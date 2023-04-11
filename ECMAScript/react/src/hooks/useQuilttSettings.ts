'use client'

import { createContext, useContext } from 'react'

type QuilttSettingsContext = {
  clientId: string
}

export const QuilttSettings = createContext<QuilttSettingsContext>({
  clientId: '',
})

export const useQuilttSettings = () => {
  const settings = useContext(QuilttSettings)

  return { ...settings }
}

export default useQuilttSettings
