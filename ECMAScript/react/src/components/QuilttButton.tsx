import { PropsWithChildren } from 'react'
import { useQuilttConnector } from '..'
import { AnyTag, PropsOf } from '../types'

type QuilttButtonProps<T extends AnyTag> = {
  as?: T
  connectorId: string
  connectionId?: string // For Reconnect Mode
} & PropsWithChildren

export const QuilttButton = <T extends AnyTag = 'button'>({
  as,
  connectorId,
  connectionId,
  ...props
}: QuilttButtonProps<T> & PropsOf<T>) => {
  useQuilttConnector()

  const Button = as || 'button'

  return <Button quiltt-button={connectorId} quiltt-connection={connectionId} {...props}></Button>
}

export default QuilttButton
