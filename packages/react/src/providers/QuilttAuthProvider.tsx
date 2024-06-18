'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { ApolloProvider } from '@apollo/client'
import { InMemoryCache, QuilttClient } from '@quiltt/core'
import { useQuilttSession } from '../hooks'

type QuilttAuthProviderProps = PropsWithChildren & {
  token?: string
}

const GraphQLClient = new QuilttClient({
  cache: new InMemoryCache(),
})

/**
 * If a token is provided, will validate the token against the api and then import
 * it into trusted storage. While this process is happening, the component is put
 * into a loading state and the children are not rendered to prevent race conditions
 * from triggering within the transitionary state.
 *
 */
export const QuilttAuthProvider: FC<QuilttAuthProviderProps> = ({ token, children }) => {
  const { session, importSession } = useQuilttSession()

  // Import passed in token
  useEffect(() => {
    if (token) importSession(token)
  }, [token, importSession])

  // Reset Client Store when logging in or out
  // biome-ignore lint/correctness/useExhaustiveDependencies: We should reset the store whenever the session changes
  useEffect(() => {
    GraphQLClient.resetStore()
  }, [session])

  return <ApolloProvider client={GraphQLClient}>{children}</ApolloProvider>
}

export default QuilttAuthProvider
