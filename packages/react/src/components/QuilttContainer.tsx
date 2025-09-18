import type { ElementType, PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'

import type { ConnectorSDKCallbacks } from '@quiltt/core'

import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import type { PropsOf } from '@/types'
import { isDeepEqual } from '@/utils/isDeepEqual'

type QuilttContainerProps<T extends ElementType> = PropsWithChildren<
  {
    as?: T
    connectorId: string
    connectionId?: string // For Reconnect Mode

    /**
     * Forces complete remount when connectionId changes.
     * Useful as a fallback for ensuring clean state.
     * @default false
     */
    forceRemountOnConnectionChange?: boolean
  } & ConnectorSDKCallbacks
>

/**
 * QuilttContainer uses globally shared callbacks. It's recommended you only use
 * one Container at a time.
 *
 * When connectionId changes, the container will automatically update the existing
 * connector instance with the new connection details. If you need to force a
 * complete remount instead, set forceRemountOnConnectionChange to true.
 */
export const QuilttContainer = <T extends ElementType = 'div'>({
  as,
  connectorId,
  connectionId,
  forceRemountOnConnectionChange = false,
  onEvent,
  onLoad,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  children,
  ...props
}: QuilttContainerProps<T> & PropsOf<T>) => {
  // Keep track of previous connectionId for change detection
  const prevConnectionIdRef = useRef<string | undefined>(connectionId)
  const prevCallbacksRef = useRef({
    onEvent,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  // Track if callbacks have changed to help with debugging
  const currentCallbacks = {
    onEvent,
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

  useQuilttConnector(connectorId, {
    connectionId,
    nonce: props?.nonce, // Pass nonce for script loading if needed
    onEvent,
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

  const Container = as || 'div'

  // Generate key for forced remounting if enabled, but respect user-provided key
  const containerKey =
    props.key ??
    (forceRemountOnConnectionChange
      ? `${connectorId}-${connectionId || 'no-connection'}`
      : undefined)

  return (
    <Container
      key={containerKey}
      quiltt-container={connectorId}
      quiltt-connection={connectionId}
      {...props}
    >
      {children}
    </Container>
  )
}

export default QuilttContainer
