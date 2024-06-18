import type { PropsWithChildren } from 'react'

import type { ConnectorSDKCallbacks } from '@quiltt/core'

import { useQuilttConnector } from '../hooks/useQuilttConnector'
import type { AnyTag, PropsOf } from '../types'

type QuilttContainerProps<T extends AnyTag> = PropsWithChildren<
  {
    as?: T
    connectorId: string
    connectionId?: string // For Reconnect Mode
  } & ConnectorSDKCallbacks
>

/**
 * QuilttContainer uses globally shared callbacks. It's recommended you only use
 * one Container at a time.
 */
export const QuilttContainer = <T extends AnyTag = 'div'>({
  as,
  connectorId,
  connectionId,
  onEvent,
  onLoad,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  children,
  ...props
}: QuilttContainerProps<T> & PropsOf<T>) => {
  useQuilttConnector(connectorId, {
    onEvent,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  const Container = as || 'div'

  return (
    <Container quiltt-container={connectorId} quiltt-connection={connectionId} {...props}>
      {children}
    </Container>
  )
}

export default QuilttContainer
