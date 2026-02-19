/**
 * QuilttConnector - Embeds the Quiltt Connector in an iframe
 *
 * This component renders the Quiltt Connector directly in your page,
 * suitable for full-page or embedded connector experiences.
 *
 * @example
 * ```vue
 * <QuilttConnector
 *   :connector-id="connectorId"
 *   @exit-success="handleSuccess"
 * />
 * ```
 */

import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  type PropType,
} from 'vue'

import type { ConnectorSDKCallbackMetadata, ConnectorSDKEventType } from '@quiltt/core'
import { cdnBase } from '@quiltt/core'

import { useQuilttSession } from '../composables/use-quiltt-session'

export interface QuilttConnectorHandle {
  handleOAuthCallback: (url: string) => void
}

export const QuilttConnector = defineComponent({
  name: 'QuilttConnector',

  props: {
    /** Quiltt Connector ID */
    connectorId: {
      type: String,
      required: true,
    },
    /** Existing connection ID for reconnection */
    connectionId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /** Pre-select a specific institution */
    institution: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /** Deep link URL for OAuth callbacks (mobile apps) */
    appLauncherUri: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },

  emits: {
    /** Connector loaded */
    load: (_metadata: ConnectorSDKCallbackMetadata) => true,
    /** Connection successful */
    'exit-success': (_metadata: ConnectorSDKCallbackMetadata) => true,
    /** User cancelled */
    'exit-abort': (_metadata: ConnectorSDKCallbackMetadata) => true,
    /** Error occurred */
    'exit-error': (_metadata: ConnectorSDKCallbackMetadata) => true,
    /** Any connector event */
    event: (_type: ConnectorSDKEventType, _metadata: ConnectorSDKCallbackMetadata) => true,
    /** OAuth URL requested (for native handling) */
    navigate: (_url: string) => true,
  },

  setup(props, { emit, expose }) {
    const iframeRef = ref<HTMLIFrameElement>()
    const { session } = useQuilttSession()

    // Build connector URL
    const connectorUrl = computed(() => {
      const url = new URL(`/v1/connectors/${props.connectorId}`, cdnBase)

      if (session.value?.token) {
        url.searchParams.set('token', session.value.token)
      }
      if (props.connectionId) {
        url.searchParams.set('connectionId', props.connectionId)
      }
      if (props.institution) {
        url.searchParams.set('institution', props.institution)
      }
      if (props.appLauncherUri) {
        url.searchParams.set('app_launcher_uri', props.appLauncherUri)
      }
      url.searchParams.set('mode', 'webview')

      return url.toString()
    })

    // Handle messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes('quiltt.io') && !event.origin.includes('quiltt.dev')) {
        return
      }

      const { type, payload } = event.data || {}
      if (!type) return

      const metadata: ConnectorSDKCallbackMetadata = {
        connectorId: props.connectorId,
        ...payload,
      }

      switch (type) {
        case 'quiltt:connector:load':
          emit('event', 'Load' as ConnectorSDKEventType, metadata)
          emit('load', metadata)
          break
        case 'quiltt:connector:exitSuccess':
          emit('event', 'ExitSuccess' as ConnectorSDKEventType, metadata)
          emit('exit-success', metadata)
          break
        case 'quiltt:connector:exitAbort':
          emit('event', 'ExitAbort' as ConnectorSDKEventType, metadata)
          emit('exit-abort', metadata)
          break
        case 'quiltt:connector:exitError':
          emit('event', 'ExitError' as ConnectorSDKEventType, metadata)
          emit('exit-error', metadata)
          break
        case 'quiltt:connector:navigate':
          if (payload?.url) {
            emit('navigate', payload.url)
          }
          break
      }
    }

    const handleOAuthCallback = (url: string) => {
      iframeRef.value?.contentWindow?.postMessage(
        {
          type: 'quiltt:connector:oauthCallback',
          payload: { url },
        },
        '*'
      )
    }

    expose({ handleOAuthCallback })

    onMounted(() => {
      window.addEventListener('message', handleMessage)
    })

    onUnmounted(() => {
      window.removeEventListener('message', handleMessage)
    })

    return () =>
      h('iframe', {
        ref: iframeRef,
        src: connectorUrl.value,
        allow: 'publickey-credentials-get *',
        class: 'quiltt-connector',
        style: {
          border: 'none',
          width: '100%',
          height: '100%',
        },
      })
  },
})
