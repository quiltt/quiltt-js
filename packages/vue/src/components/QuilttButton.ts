/**
 * QuilttButton - Button component that opens Quiltt Connector modal
 *
 * Wraps a button (or custom element) that opens the Quiltt Connector
 * in a modal overlay when clicked.
 *
 * @example
 * ```vue
 * <QuilttButton
 *   :connector-id="connectorId"
 *   @exit-success="handleSuccess"
 * >
 *   Add Bank Account
 * </QuilttButton>
 * ```
 */

import { computed, defineComponent, h, type PropType } from 'vue'

import type { ConnectorSDKCallbackMetadata, ConnectorSDKEventType } from '@quiltt/core'

import { useQuilttConnector } from '../composables/useQuilttConnector'

export const QuilttButton = defineComponent({
  name: 'QuilttButton',

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
    /**
     * @deprecated Use `appLauncherUri` instead. This property will be removed in a future version.
     * The OAuth redirect URL for mobile or embedded webview flows.
     */
    oauthRedirectUrl: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /** Render as a different element */
    as: {
      type: String,
      default: 'button',
    },
  },

  emits: {
    /** Connector loaded */
    load: (_metadata: ConnectorSDKCallbackMetadata) => true,
    /** Connector opened */
    open: (_metadata: ConnectorSDKCallbackMetadata) => true,
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
    const effectiveAppLauncherUri = computed(() => props.appLauncherUri ?? props.oauthRedirectUrl)

    const { open } = useQuilttConnector(() => props.connectorId, {
      connectionId: () => props.connectionId,
      institution: () => props.institution,
      appLauncherUri: effectiveAppLauncherUri,
      onEvent: (type, metadata) => emit('event', type, metadata),
      onOpen: (metadata) => emit('open', metadata),
      onLoad: (metadata) => emit('load', metadata),
      onExit: (type, metadata) => emit('exit', type, metadata),
      onExitSuccess: (metadata) => emit('exit-success', metadata),
      onExitAbort: (metadata) => emit('exit-abort', metadata),
      onExitError: (metadata) => emit('exit-error', metadata),
    })

    const handleClick = () => {
      open()
    }

    return () =>
      h(
        props.as,
        {
          class: 'quiltt-button',
          onClick: handleClick,
        },
        slots.default?.()
      )
  },
})
