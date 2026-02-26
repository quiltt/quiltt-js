'use client'

import type { ReactNode } from 'react'

import { QuilttProvider } from '@quiltt/react'

type QuilttProviderClientProps = {
  children: ReactNode
}

const quilttClientId = process.env.NEXT_PUBLIC_QUILTT_CLIENT_ID ?? 'test-client-id'
const quilttAuthToken = process.env.NEXT_PUBLIC_QUILTT_AUTH_TOKEN ?? 'test-auth-token'

export const QuilttProviderClient = ({ children }: QuilttProviderClientProps) => {
  return (
    <QuilttProvider clientId={quilttClientId} token={quilttAuthToken}>
      {children}
    </QuilttProvider>
  )
}
