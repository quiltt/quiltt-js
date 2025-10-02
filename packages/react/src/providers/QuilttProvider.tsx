import type { FC } from 'react'

import { QuilttAuthProvider } from './QuilttAuthProvider'
import { QuilttSettingsProvider } from './QuilttSettingsProvider'
import type { QuilttSettingsProviderProps } from './QuilttSettingsProvider'
import type { QuilttAuthProviderProps } from './QuilttAuthProvider'

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
