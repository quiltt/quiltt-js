'use client'

import type { FC, PropsWithChildren } from 'react'
import { useState } from 'react'

import { QuilttSettings } from '../hooks'

type QuilttSettingsProviderProps = PropsWithChildren & {
  clientId: string
}

export const QuilttSettingsProvider: FC<QuilttSettingsProviderProps> = ({ clientId, children }) => {
  const [_clientId] = useState(clientId)

  return (
    <QuilttSettings.Provider value={{ clientId: _clientId }}>{children}</QuilttSettings.Provider>
  )
}

export default QuilttSettingsProvider
