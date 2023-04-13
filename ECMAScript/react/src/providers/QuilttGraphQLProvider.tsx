'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { QuilttClient, InMemoryCache } from '@quiltt/core'
import { ApolloProvider } from '@apollo/client/index.js'
import { useQuilttSession } from '../hooks'

let client = new QuilttClient({
  token: undefined,
  cache: new InMemoryCache(),
})

export const QuilttGraphQLProvider: FC<PropsWithChildren> = ({ children }) => {
  const { session, forgetSession } = useQuilttSession()

  /**
   * Clear cache and refetches on session changes (login and logout). Wait till
   * after forgetSession has been flushed to ensure a clear state.
   * https://www.apollographql.com/docs/react/networking/authentication
   */
  useEffect(() => {
    client.disconnect()

    client = new QuilttClient({
      token: session?.token,
      unauthorizedCallback: forgetSession,
      cache: new InMemoryCache(),
    })
  }, [session?.token])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default QuilttGraphQLProvider
