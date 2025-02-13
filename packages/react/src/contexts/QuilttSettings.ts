'use client'

import { createContext } from 'react'

type QuilttSettingsContext = {
  clientId?: string
}

export const QuilttSettings = createContext<QuilttSettingsContext>({})
