'use client'

import { createContext, useContext } from 'react'

type QuilttSettingsContext = {
  clientId?: string | undefined
}

export const QuilttSettings = createContext<QuilttSettingsContext>({})

export const useQuilttSettings = () => {
  const settings = useContext(QuilttSettings)

  return { ...settings }
}

export default useQuilttSettings
