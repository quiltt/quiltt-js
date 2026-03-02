import type { FC } from 'react'

import type { QuilttSettingsProviderProps } from '@quiltt/react'
import { QuilttSettingsProvider } from '@quiltt/react'

import type { QuilttAuthProviderProps } from './QuilttAuthProvider'
import { QuilttAuthProvider } from './QuilttAuthProvider'

type QuilttProviderProps = QuilttSettingsProviderProps & QuilttAuthProviderProps

/**
 * React Native-specific QuilttProvider that combines settings and auth providers
 * with platform-specific GraphQL client configuration.
 */
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
