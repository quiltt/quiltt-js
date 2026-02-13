import type { ElementType, MouseEvent, PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'

import type { ConnectorSDKCallbacks } from '@quiltt/core'

import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import { useQuilttRenderGuard } from '@/hooks/useQuilttRenderGuard'
import type { PropsOf } from '@/types'
import { isDeepEqual } from '@/utils/isDeepEqual'

// Base button props without callback-specific properties
type BaseQuilttButtonProps<T extends ElementType> = {
  as?: T
  connectorId: string
  connectionId?: string // For Reconnect Mode
  institution?: string // For Connect Mode
  oauthRedirectUrl?: string // For OAuth flows in mobile or embedded webviews

  /**
   * Forces complete remount when connectionId changes.
   * Useful as a fallback for ensuring clean state.
   * @default false
   */
  forceRemountOnConnectionChange?: boolean

  // Override the native onClick handler
  onClick?: (event: MouseEvent<HTMLElement>) => void
}

// Separate SDK callback types
type QuilttCallbackProps = Omit<ConnectorSDKCallbacks, 'onLoad'> & {
  // Separate the SDK onLoad from the HTML onLoad to avoid conflicts
  onLoad?: ConnectorSDKCallbacks['onLoad'] // Handles SDK initialization
  onHtmlLoad?: React.ReactEventHandler<HTMLElement> // Handles DOM element load
}

// Combined type for the full component
type QuilttButtonProps<T extends ElementType> = PropsWithChildren<
  BaseQuilttButtonProps<T> & QuilttCallbackProps
>

/**
 * QuilttButton provides a clickable interface to open Quiltt connectors.
 *
 * When connectionId changes, the button will automatically update the existing
 * connector instance with the new connection details. If you need to force a
 * complete remount instead, set forceRemountOnConnectionChange to true.
 */
export const QuilttButton = <T extends ElementType = 'button'>({
  as,
  connectorId,
  connectionId,
  institution,
  oauthRedirectUrl,
  forceRemountOnConnectionChange = false,
  onEvent,
  onOpen,
  onLoad,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  onClick,
  onHtmlLoad,
  children,
  ...props
}: QuilttButtonProps<T> & PropsOf<T>) => {
  // Check flag to warn about potential anti-pattern (may produce false positives for valid nested patterns)
  useQuilttRenderGuard('QuilttButton')

  // Keep track of previous connectionId for change detection
  const prevConnectionIdRef = useRef<string | undefined>(connectionId)
  const prevCallbacksRef = useRef({
    onEvent,
    onOpen,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  // Track if callbacks have changed to help with debugging
  const currentCallbacks = {
    onEvent,
    onOpen,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  }

  const callbacksChanged = !isDeepEqual(prevCallbacksRef.current, currentCallbacks)

  useEffect(() => {
    prevCallbacksRef.current = currentCallbacks
  })

  // Warning for potential callback reference issues
  useEffect(() => {
    if (callbacksChanged && prevConnectionIdRef.current !== undefined) {
      console.warn(
        '[Quiltt] Callback functions changed after initial render. ' +
          'This may cause unexpected behavior. Consider memoizing callback functions ' +
          'with useCallback to maintain stable references.'
      )
    }
  }, [callbacksChanged])

  const { open } = useQuilttConnector(connectorId, {
    connectionId,
    institution,
    oauthRedirectUrl,
    nonce: props?.nonce, // Pass nonce for script loading if needed
    onEvent,
    onOpen,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  // Update previous connectionId reference
  useEffect(() => {
    prevConnectionIdRef.current = connectionId
  }, [connectionId])

  const Button = as || 'button'

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    // Call the user's onClick handler first to allow for:
    // 1. Pre-open validation
    // 2. Preventing opening via event.preventDefault()
    // 3. Setting up state before connector opens
    onClick?.(event)

    // Only open if event wasn't prevented
    if (!event.defaultPrevented) {
      open()
    }
  }

  // Generate key for forced remounting if enabled, but respect user-provided key
  const buttonKey =
    props.key ??
    (forceRemountOnConnectionChange
      ? `${connectorId}-${connectionId || 'no-connection'}`
      : undefined)

  return (
    <Button
      key={buttonKey}
      onClick={handleClick}
      onLoad={onHtmlLoad}
      quiltt-connection={connectionId}
      quiltt-oauth-redirect-url={oauthRedirectUrl}
      {...props}
    >
      {children}
    </Button>
  )
}

export default QuilttButton
