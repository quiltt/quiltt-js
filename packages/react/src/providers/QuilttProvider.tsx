import type { FC } from 'react'

import type { QuilttAuthProviderProps } from './QuilttAuthProvider'
import { QuilttAuthProvider } from './QuilttAuthProvider'
import type { QuilttSettingsProviderProps } from './QuilttSettingsProvider'
import { QuilttSettingsProvider } from './QuilttSettingsProvider'

type QuilttProviderProps = QuilttSettingsProviderProps & QuilttAuthProviderProps

export const QuilttProvider: FC<QuilttProviderProps> = ({
  clientId,
  graphqlClient,
  token,
  children,
}) => {
  return (
    <QuilttSettingsProvider clientId={clientId}>
      <QuilttAuthProvider token={token} graphqlClient={graphqlClient}>
        {children}
      </QuilttAuthProvider>
    </QuilttSettingsProvider>
  )
}

export default QuilttProvider
