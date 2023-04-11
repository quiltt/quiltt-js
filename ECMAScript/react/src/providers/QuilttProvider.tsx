import type { FC, PropsWithChildren } from 'react'

import { QuilttAuthProvider } from './QuilttAuthProvider'
import { QuilttGraphQLProvider } from './QuilttGraphQLProvider'
import { QuilttSettingsProvider } from './QuilttSettingsProvider'

type QuilttProviderProps = PropsWithChildren & {
  clientId: string
  token?: string
}

export const QuilttProvider: FC<QuilttProviderProps> = ({ clientId, token, children }) => {
  return (
    <QuilttSettingsProvider clientId={clientId}>
      <QuilttAuthProvider token={token}>
        <QuilttGraphQLProvider>{children}</QuilttGraphQLProvider>
      </QuilttAuthProvider>
    </QuilttSettingsProvider>
  )
}

export default QuilttProvider
