import { PropsWithChildren } from 'react'
import { useQuilttConnector } from '..'
import { AnyTag, PropsOf } from '../types'

type QuilttContainerProps<T extends AnyTag> = {
  as?: T
  connectorId: string
  connectionId?: string // For Reconnect Mode
} & PropsWithChildren

export const QuilttContainer = <T extends AnyTag = 'div'>({
  as,
  connectorId,
  connectionId,
  ...props
}: QuilttContainerProps<T> & PropsOf<T>) => {
  useQuilttConnector()

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
