import type { PropsWithChildren } from 'react'

import type { ConnectorSDKCallbacks } from '@quiltt/core'

import { useQuilttConnector } from '../hooks/useQuilttConnector'
import type { AnyTag, PropsOf } from '../types'

type QuilttButtonProps<T extends AnyTag> = PropsWithChildren<
  {
    as?: T
    connectorId: string
    connectionId?: string // For Reconnect Mode
    institution?: string // For Connect Mode
  } & ConnectorSDKCallbacks
>

export const QuilttButton = <T extends AnyTag = 'button'>({
  as,
  connectorId,
  connectionId,
  institution,
  onEvent,
  onLoad,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  children,
  ...props
}: QuilttButtonProps<T> & PropsOf<T>) => {
  const { open } = useQuilttConnector(connectorId, {
    connectionId,
    institution,
    onEvent,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  const Button = as || 'button'

  return (
    <Button onClick={open} quiltt-connection={connectionId} {...props}>
      {children}
    </Button>
  )
}

export default QuilttButton
