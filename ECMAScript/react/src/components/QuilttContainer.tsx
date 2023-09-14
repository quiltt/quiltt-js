import { PropsWithChildren } from 'react'
import { useQuilttConnector } from '..'
import { AnyTag, PropsOf } from '../types'

import { ConnectorSDKCallbacks } from '@quiltt/core'

type QuilttContainerProps<T extends AnyTag> = {
  as?: T
  connectorId: string
  connectionId?: string // For Reconnect Mode
} & ConnectorSDKCallbacks &
  PropsWithChildren

/**
 * QuilttContainer uses globally shared callbacks. It's recommended you only use
 * one Container at a time.
 */
export const QuilttContainer = <T extends AnyTag = 'div'>({
  as,
  connectorId,
  connectionId,
  onEvent,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  ...props
}: QuilttContainerProps<T> & PropsOf<T>) => {
  useQuilttConnector(connectorId, {
    onEvent: onEvent,
    onExit: onExit,
    onExitSuccess: onExitSuccess,
    onExitAbort: onExitAbort,
    onExitError: onExitError,
  })

  const Container = as || 'div'

  return (
    <Container
      quiltt-container={connectorId}
      quiltt-connection={connectionId}
      {...props}
    ></Container>
  )
}

export default QuilttContainer
