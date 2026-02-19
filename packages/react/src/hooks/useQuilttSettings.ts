'use client'

import { useContext } from 'react'

import { QuilttSettings } from '@/contexts/QuilttSettings'

export const useQuilttSettings = () => {
  const settings = useContext(QuilttSettings)

  return settings
}
