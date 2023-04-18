'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'

import { ApolloProvider } from '@apollo/client/index.js'
import { InMemoryCache, QuilttClient } from '@quiltt/core'
import { useQuilttSession } from '../hooks'

export const QuilttGraphQLProvider: FC<PropsWithChildren> = ({ children }) => {
  const { session, forgetSession } = useQuilttSession()
  const [client, setClient] = useState<QuilttClient<unknown>>(
    new QuilttClient({
      token: session?.token,
      cache: new InMemoryCache(),
    })
  )

  /**
   * Clear cache and refetches on session changes (login and logout). Wait till
   * after forgetSession has been flushed to ensure a clear state.
   * https://www.apollographql.com/docs/react/networking/authentication
   */
  useEffect(() => {
    setClient((client: QuilttClient<unknown>) => {
      client.disconnect()

      return new QuilttClient({
        token: session?.token,
        unauthorizedCallback: forgetSession,
        cache: new InMemoryCache(),
      })
    })
  }, [session?.token, forgetSession])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default QuilttGraphQLProvider
