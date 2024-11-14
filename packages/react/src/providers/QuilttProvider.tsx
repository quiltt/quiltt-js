import type { FC, PropsWithChildren } from 'react'

import { QuilttAuthProvider } from './QuilttAuthProvider'
import { QuilttSettingsProvider } from './QuilttSettingsProvider'

type QuilttProviderProps = PropsWithChildren & {
  /** The client ID for the client-side Auth API */
  clientId?: string
  /** The Session token obtained from the server */
  token?: string
}

export const QuilttProvider: FC<QuilttProviderProps> = ({ clientId, token, children }) => {
  return (
    <QuilttSettingsProvider clientId={clientId}>
      <QuilttAuthProvider token={token}>{children}</QuilttAuthProvider>
    </QuilttSettingsProvider>
  )
}

export default QuilttProvider
