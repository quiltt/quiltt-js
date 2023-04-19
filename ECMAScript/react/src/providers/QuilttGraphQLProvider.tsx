'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'

import { ApolloProvider } from '@apollo/client/index.js'
import { InMemoryCache, QuilttClient } from '@quiltt/core'
import { useQuilttSession } from '../hooks'

export const QuilttGraphQLProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
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
  }, [session?.token, forgetSession, setClient])

  /**
   * Session can take a moment to update, then it flushes through and then
   * the client can take a moment to update. This loading state is to things
   * wait until everything has been updated to help prevent unauth'd requests.
   *
   * TODO: Consider accepting a loading component.
   */
  useEffect(() => {
    if (!isLoading && session?.token !== client.token) {
      setIsLoading(true)
    } else if (isLoading && session?.token === client.token) {
      setIsLoading(false)
    }
  }, [isLoading, session?.token, client.token])

  if (isLoading) return null

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default QuilttGraphQLProvider
