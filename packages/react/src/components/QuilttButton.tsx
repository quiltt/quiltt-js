import type { MouseEvent, PropsWithChildren } from 'react'

import type { ConnectorSDKCallbacks } from '@quiltt/core'

import { useQuilttConnector } from '../hooks/useQuilttConnector'
import type { AnyTag, PropsOf } from '../types'

type QuilttButtonProps<T extends AnyTag> = PropsWithChildren<
  {
    as?: T
    connectorId: string
    connectionId?: string // For Reconnect Mode
    institution?: string // For Connect Mode
    // Override the native onClick handler
    onClick?: (event: MouseEvent<HTMLElement>) => void
  } & Omit<ConnectorSDKCallbacks, 'onLoad'> & {
      // Separate the SDK onLoad from the HTML onLoad
      onLoad?: ConnectorSDKCallbacks['onLoad']
      onHtmlLoad?: React.ReactEventHandler<HTMLElement>
    }
>

export const QuilttButton = <T extends AnyTag = 'button'>({
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
    // Call the user's onClick handler if provided
    onClick?.(event)
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
