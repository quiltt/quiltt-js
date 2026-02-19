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

import type { PropType } from 'vue'
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'

import type { ConnectorSDKCallbackMetadata, ConnectorSDKEventType } from '@quiltt/core'

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

    const trustedQuilttHostSuffixes = ['quiltt.io', 'quiltt.dev', 'quiltt.app']

    const isTrustedQuilttOrigin = (origin: string): boolean => {
      try {
        const originUrl = new URL(origin)
        if (originUrl.protocol !== 'https:') {
          return false
        }
        const hostname = originUrl.hostname.toLowerCase()
        return trustedQuilttHostSuffixes.some(
          (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
        )
      } catch {
        return false
      }
    }

    // Build connector URL
    const connectorUrl = computed(() => {
      const url = new URL(`https://${props.connectorId}.quiltt.app`)

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
      // Set mode for inline iframe embedding
      url.searchParams.set('mode', 'INLINE')

      return url.toString()
    })

    // Handle messages from the iframe
    // The platform MessageBus sends: { source: 'quiltt', type: 'Load'|'ExitSuccess'|..., ...metadata }
    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedQuilttOrigin(event.origin)) {
        return
      }

      const data = event.data || {}
      // Validate message is from Quiltt MessageBus
      if (data.source !== 'quiltt' || !data.type) return

      const { type, connectionId, profileId, connectorSession, url } = data

      // Build metadata from message fields
      const metadata: ConnectorSDKCallbackMetadata = {
        connectorId: props.connectorId,
        ...(profileId && { profileId }),
        ...(connectionId && { connectionId }),
        ...(connectorSession && { connectorSession }),
      }

      switch (type) {
        case 'Load':
          emit('event', 'Load' as ConnectorSDKEventType, metadata)
          emit('load', metadata)
          break
        case 'ExitSuccess':
          emit('event', 'ExitSuccess' as ConnectorSDKEventType, metadata)
          emit('exit-success', metadata)
          break
        case 'ExitAbort':
          emit('event', 'ExitAbort' as ConnectorSDKEventType, metadata)
          emit('exit-abort', metadata)
          break
        case 'ExitError':
          emit('event', 'ExitError' as ConnectorSDKEventType, metadata)
          emit('exit-error', metadata)
          break
        case 'Navigate':
          if (url) {
            emit('navigate', url)
          }
          break
      }
    }

    // Build OAuth callback message matching React Native SDK format
    const buildOAuthCallbackMessage = (callbackUrl: string) => {
      try {
        const parsedUrl = new URL(callbackUrl)
        const params: Record<string, string> = {}
        parsedUrl.searchParams.forEach((value, key) => {
          params[key] = value
        })
        return {
          source: 'quiltt',
          type: 'OAuthCallback',
          data: { url: callbackUrl, params },
        }
      } catch {
        return {
          source: 'quiltt',
          type: 'OAuthCallback',
          data: { url: callbackUrl, params: {} },
        }
      }
    }

    const handleOAuthCallback = (url: string) => {
      iframeRef.value?.contentWindow?.postMessage(buildOAuthCallbackMessage(url), '*')
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
