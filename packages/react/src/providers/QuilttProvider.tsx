import type { FC } from 'react'

import { QuilttProviderRender } from '@/contexts/QuilttProviderRender'

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
  // Mark that we're rendering the provider
  // This helps detect if SDK components are rendered in the same component
  return (
    <QuilttProviderRender.Provider value={{ isRenderingProvider: true }}>
      <QuilttSettingsProvider clientId={clientId}>
        <QuilttAuthProvider token={token} graphqlClient={graphqlClient}>
          {children}
        </QuilttAuthProvider>
      </QuilttSettingsProvider>
    </QuilttProviderRender.Provider>
  )
}

export default QuilttProvider
