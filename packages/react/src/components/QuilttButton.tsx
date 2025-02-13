import type { ElementType, MouseEvent, PropsWithChildren } from 'react'

import type { ConnectorSDKCallbacks } from '@quiltt/core'

import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import type { PropsOf } from '@/types'

// Base button props without callback-specific properties
type BaseQuilttButtonProps<T extends ElementType> = {
  as?: T
  connectorId: string
  connectionId?: string // For Reconnect Mode
  institution?: string // For Connect Mode
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

export const QuilttButton = <T extends ElementType = 'button'>({
  as,
  connectorId,
  connectionId,
  institution,
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
  const { open } = useQuilttConnector(connectorId, {
    connectionId,
    institution,
    onEvent,
    onOpen,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  const Button = as || 'button'

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    // Call the user's onClick handler first to allow for:
    // 1. Pre-open validation
    // 2. Preventing opening via event.preventDefault()
    // 3. Setting up state before connector opens
    if (onClick) onClick(event)

    // Then open the Quiltt connector
    open()
  }

  return (
    <Button onClick={handleClick} onLoad={onHtmlLoad} quiltt-connection={connectionId} {...props}>
      {children}
    </Button>
  )
}

export default QuilttButton
