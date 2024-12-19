'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { FC, PropsWithChildren } from 'react'

import { ApolloProvider } from '@apollo/client/react/context/ApolloProvider.js'
import { InMemoryCache, QuilttClient } from '@quiltt/core'

import { useQuilttSession } from '@/hooks'
import { isDeepEqual } from '@/utils'

type QuilttAuthProviderProps = PropsWithChildren & {
  /** The Session token obtained from the server */
  token?: string
}

/**
 * If a token is provided, will validate the token against the api and then import
 * it into trusted storage. While this process is happening, the component is put
 * into a loading state and the children are not rendered to prevent race conditions
 * from triggering within the transitionary state.
 */
export const QuilttAuthProvider: FC<QuilttAuthProviderProps> = ({ token, children }) => {
  const { session, importSession } = useQuilttSession()
  const previousSessionRef = useRef(session)

  // @todo: extract into a provider so it can accessed by child components
  const graphQLClient = useMemo(
    () =>
      new QuilttClient({
        cache: new InMemoryCache(),
      }),
    []
  )

  // Import passed in token
  useEffect(() => {
    if (token) importSession(token)
  }, [token, importSession])

  // Reset Client Store when session changes (using deep comparison)
  useEffect(() => {
    if (!isDeepEqual(session, previousSessionRef.current)) {
      graphQLClient.resetStore()
      previousSessionRef.current = session
    }
  }, [session, graphQLClient])

  return <ApolloProvider client={graphQLClient}>{children}</ApolloProvider>
}

export default QuilttAuthProvider
