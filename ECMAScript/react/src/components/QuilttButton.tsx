import { PropsWithChildren } from 'react'
import { useQuilttConnector } from '..'
import { AnyTag, PropsOf } from '../types'

import { ConnectorSDKCallbacks } from '@quiltt/core'

type QuilttButtonProps<T extends AnyTag> = {
  as?: T
  connectorId: string
  connectionId?: string // For Reconnect Mode
} & ConnectorSDKCallbacks &
  PropsWithChildren

export const QuilttButton = <T extends AnyTag = 'button'>({
  as,
  connectorId,
  connectionId,
  onEvent,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  ...props
}: QuilttButtonProps<T> & PropsOf<T>) => {
  const { open } = useQuilttConnector(connectorId, {
    connectionId: connectionId,
    onEvent: onEvent,
    onExit: onExit,
    onExitSuccess: onExitSuccess,
    onExitAbort: onExitAbort,
    onExitError: onExitError,
  })

  const Button = as || 'button'

  return <Button onClick={open} quiltt-connection={connectionId} {...props}></Button>
}

export default QuilttButton
