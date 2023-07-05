import { FC, DetailedHTMLProps, ButtonHTMLAttributes } from 'react'
import { useQuilttConnector } from '..'

type QuilttButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  connectorId: string
  connectionId?: string // For Reconnect Mode
}

export const QuilttButton: FC<QuilttButtonProps> = ({
  connectorId,
  connectionId,
  children,
  ...props
}) => {
  useQuilttConnector()

  return (
    // eslint-disable-next-line react/no-unknown-property
    <button quiltt-connector={connectorId} quiltt-connection={connectionId} {...props}>
      {children}
    </button>
  )
}

export default QuilttButton
