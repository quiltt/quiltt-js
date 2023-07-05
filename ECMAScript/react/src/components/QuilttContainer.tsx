import { FC, DetailedHTMLProps, HTMLAttributes } from 'react'
import { useQuilttConnector } from '..'

type QuilttContainerProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  connectorId: string
  connectionId?: string // For Reconnect Mode
}

export const QuilttContainer: FC<QuilttContainerProps> = ({
  connectorId,
  connectionId,
  children,
  ...props
}) => {
  useQuilttConnector()

  return (
    // eslint-disable-next-line react/no-unknown-property
    <div quiltt-connector={connectorId} quiltt-connection={connectionId} {...props}>
      {children}
    </div>
  )
}

export default QuilttContainer
