'use client'

import type { FC, PropsWithChildren } from 'react'
import { Fragment, useEffect, useState } from 'react'

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
 * TODO: Consider accepting a loading component.
 */
export const QuilttAuthProvider: FC<QuilttAuthProviderProps> = ({ token, children }) => {
  const { session, importSession } = useQuilttSession()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.token == token) {
      if (isLoading) setIsLoading(false)
      return
    }

    if (token && !isLoading) {
      setIsLoading(true)
      importSession(token)
    }
  }, [session?.token, token, isLoading, setIsLoading, importSession])

  if (isLoading) return null

  return <Fragment>{children}</Fragment>
}

export default QuilttAuthProvider
