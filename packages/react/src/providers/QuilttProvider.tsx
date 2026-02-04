import type { FC } from 'react'
import { useMemo } from 'react'

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
  // Set a context flag that SDK components can check to warn about potential anti-patterns.
  // LIMITATION: This flags ALL descendants due to React context propagation, not just same-component usage.
  // Will produce false positives for valid patterns like: <QuilttProvider><MyPage /></QuilttProvider>
  // where MyPage renders SDK components (which is correct usage).
  // The flag-based approach is simple but imprecise - a proper solution would require render stack tracking.
  // Memoize context value to prevent unnecessary re-renders
  const renderContextValue = useMemo(() => ({ isRenderingProvider: true }), [])

  return (
    <QuilttProviderRender.Provider value={renderContextValue}>
      <QuilttSettingsProvider clientId={clientId}>
        <QuilttAuthProvider token={token} graphqlClient={graphqlClient}>
          {children}
        </QuilttAuthProvider>
      </QuilttSettingsProvider>
    </QuilttProviderRender.Provider>
  )
}

export default QuilttProvider
