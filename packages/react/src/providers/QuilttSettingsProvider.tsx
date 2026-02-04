'use client'

import type { FC, PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { QuilttSettings } from '@/contexts/QuilttSettings'

export type QuilttSettingsProviderProps = PropsWithChildren & {
  /** The Client ID to use for the passwordless Auth API */
  clientId?: string
}

export const QuilttSettingsProvider: FC<QuilttSettingsProviderProps> = ({ clientId, children }) => {
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ clientId }), [clientId])

  return <QuilttSettings.Provider value={contextValue}>{children}</QuilttSettings.Provider>
}

export default QuilttSettingsProvider
