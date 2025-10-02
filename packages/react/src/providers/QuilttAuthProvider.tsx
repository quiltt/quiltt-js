'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect, useMemo, useRef } from 'react'

import { ApolloProvider } from '@apollo/client/react/context/ApolloProvider.js'
import { InMemoryCache, QuilttClient } from '@quiltt/core'

import { useQuilttSession } from '@/hooks'
import { isDeepEqual } from '@/utils'

export type QuilttAuthProviderProps = PropsWithChildren & {
  /** A custom QuilttClient instance to use instead of the default */
  graphqlClient?: QuilttClient
  /** The Quiltt Session token obtained from the server */
  token?: string
}

/**
 * If a token is provided, will validate the token against the api and then import
 * it into trusted storage. While this process is happening, the component is put
 * into a loading state and the children are not rendered to prevent race conditions
 * from triggering within the transitionary state.
 */
export const QuilttAuthProvider: FC<QuilttAuthProviderProps> = ({
  graphqlClient,
  token,
  children,
}) => {
  const { session, importSession } = useQuilttSession()
  const previousSessionRef = useRef(session)

  // Memoize the client to avoid unnecessary re-renders
  const apolloClient = useMemo(
    () =>
      graphqlClient ||
      new QuilttClient({
        cache: new InMemoryCache(),
      }),
    [graphqlClient]
  )

  // Import passed in token
  useEffect(() => {
    if (token) importSession(token)
  }, [token, importSession])

  // Reset Client Store when session changes (using deep comparison)
  useEffect(() => {
    if (!isDeepEqual(session, previousSessionRef.current)) {
      apolloClient.resetStore()
      previousSessionRef.current = session
    }
  }, [session, apolloClient])

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

export default QuilttAuthProvider
