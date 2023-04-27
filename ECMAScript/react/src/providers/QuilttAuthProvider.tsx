'use client'

import { FC, PropsWithChildren, useMemo } from 'react'
import { useEffect } from 'react'

import { ApolloProvider } from '@apollo/client/index.js'
import { InMemoryCache, QuilttClient } from '@quiltt/core'
import { useQuilttSession } from '../hooks'

type QuilttAuthProviderProps = PropsWithChildren & {
  token?: string
}

/**
 * If a token is provided, will validate the token against the api and then import
 * it into trusted storage. While this process is happening, the component is put
 * into a loading state and the children are not rendered to prevent race conditions
 * from triggering within the transitionary state.
 *
 */
export const QuilttAuthProvider: FC<QuilttAuthProviderProps> = ({ token, children }) => {
  const { session, importSession, forgetSession } = useQuilttSession()
  const client = useMemo<QuilttClient<unknown>>(
    () =>
      new QuilttClient({
        unauthorizedCallback: forgetSession,
        cache: new InMemoryCache(),
      }),
    [forgetSession]
  )

  // Import Passed in Tokens
  useEffect(() => {
    if (token) importSession(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Reset Client Store when logging in or out
  useEffect(() => {
    client.resetStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default QuilttAuthProvider
