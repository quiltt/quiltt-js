'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { useQuilttSession } from '../hooks'

type QuilttAuthProviderProps = PropsWithChildren & {
  token?: string
}

export const QuilttAuthProvider: FC<QuilttAuthProviderProps> = ({ token, children }) => {
  const { importSession } = useQuilttSession()

  useEffect(() => {
    if (importSession && token) {
      importSession(token)
    }
  }, [importSession, token])

  return <>{children}</>
}

export default QuilttAuthProvider
