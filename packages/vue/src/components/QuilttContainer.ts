/**
 * QuilttContainer - Container component that renders Quiltt Connector inline
 *
 * Renders a container element where the Quiltt Connector will be displayed.
 * The connector opens automatically when the component mounts.
 *
 * @example
 * ```vue
 * <QuilttContainer
 *   :connector-id="connectorId"
 *   @exit-success="handleSuccess"
 * />
 * ```
 */

import { computed, defineComponent, h, onMounted, onUnmounted, type PropType, watch } from 'vue'

import type { ConnectorSDKCallbackMetadata, ConnectorSDKEventType } from '@quiltt/core'

import { useQuilttConnector } from '../composables/useQuilttConnector'
import { oauthRedirectUrlDeprecationWarning } from '../constants/deprecation-warnings'

export const QuilttContainer = defineComponent({
  name: 'QuilttContainer',

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
    appLauncherUrl: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /**
     * @deprecated Use `appLauncherUrl` instead. This property will be removed in a future version.
     * The OAuth redirect URL for mobile or embedded webview flows.
     */
    oauthRedirectUrl: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /** Render as a different element */
    as: {
      type: String,
      default: 'div',
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
    /** Connector exited (any reason) */
    exit: (_type: ConnectorSDKEventType, _metadata: ConnectorSDKCallbackMetadata) => true,
    /** Any connector event */
    event: (_type: ConnectorSDKEventType, _metadata: ConnectorSDKCallbackMetadata) => true,
  },

  setup(props, { emit, slots }) {
    watch(
      () => props.oauthRedirectUrl,
      (value) => {
        if (value !== undefined) {
          console.warn(oauthRedirectUrlDeprecationWarning)
        }
      },
      { immediate: true }
    )

    const effectiveAppLauncherUri = computed(() => props.appLauncherUrl ?? props.oauthRedirectUrl)
    let openTimeout: ReturnType<typeof setTimeout> | undefined

    const { open } = useQuilttConnector(() => props.connectorId, {
      connectionId: () => props.connectionId,
      institution: () => props.institution,
      appLauncherUrl: effectiveAppLauncherUri,
      onEvent: (type, metadata) => emit('event', type, metadata),
      onLoad: (metadata) => emit('load', metadata),
      onExit: (type, metadata) => emit('exit', type, metadata),
      onExitSuccess: (metadata) => emit('exit-success', metadata),
      onExitAbort: (metadata) => emit('exit-abort', metadata),
      onExitError: (metadata) => emit('exit-error', metadata),
    })

    onMounted(() => {
      // Short delay to ensure SDK is loaded
      openTimeout = setTimeout(() => {
        open()
      }, 100)
    })

    onUnmounted(() => {
      if (openTimeout) {
        clearTimeout(openTimeout)
        openTimeout = undefined
      }
    })

    return () =>
      h(
        props.as,
        {
          class: 'quiltt-container',
          style: {
            width: '100%',
            height: '100%',
          },
        },
        slots.default?.()
      )
  },
})
