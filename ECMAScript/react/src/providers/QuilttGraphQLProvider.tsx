import type { FC, PropsWithChildren } from 'react'
import { useEffect, useMemo } from 'react'

import { QuilttClient, InMemoryCache } from '@quiltt/core'
import { ApolloProvider } from '@apollo/client/index.js'
import { useQuilttSession } from '../hooks'

let client = new QuilttClient({
  token: undefined,
  cache: new InMemoryCache()
})

export const QuilttGraphQLProvider: FC<PropsWithChildren> = ({ children }) => {
  const { session, forgetSession } = useQuilttSession()

  useMemo(() => {
    client = new QuilttClient({
      token: session?.token,
      unauthorizedCallback: forgetSession,
      cache: new InMemoryCache()
    })
  }, [session?.token, forgetSession])

  /**
   * Clear cache and refetches on session changes (login and logout). Wait till
   * after forgetSession has been flushed to ensure a clear state.
   * https://www.apollographql.com/docs/react/networking/authentication
   */
  useEffect(() => {
    client.clearStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default QuilttGraphQLProvider
