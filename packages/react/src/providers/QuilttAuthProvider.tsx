'use client'

import type { FC, PropsWithChildren } from 'react'
import { useEffect, useMemo, useRef } from 'react'

import { ApolloProvider } from '@apollo/client/react'
import { createVersionLink, InMemoryCache, QuilttClient } from '@quiltt/core'

import { useQuilttSession } from '@/hooks'
import { getPlatformInfo, isDeepEqual } from '@/utils'

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
  const previousTokenRef = useRef<string | undefined>(undefined)
  const importSessionRef = useRef(importSession)

  // Keep importSession ref up to date
  useEffect(() => {
    importSessionRef.current = importSession
  }, [importSession])

  // Memoize the client to avoid unnecessary re-renders
  const apolloClient = useMemo(
    () =>
      graphqlClient ||
      new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink(getPlatformInfo()),
      }),
    [graphqlClient]
  )

  // Import passed in token (only if value has changed)
  useEffect(() => {
    if (token && token !== previousTokenRef.current) {
      importSessionRef.current(token)
      previousTokenRef.current = token
    } else if (!token) {
      // Reset ref when token becomes undefined to allow re-import of same token later
      previousTokenRef.current = undefined
    }
  }, [token])

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
