'use client'

import { useEffect, useMemo } from 'react'

import { QuilttClient, InMemoryCache, NormalizedCacheObject } from '@quiltt/core'
import { useQuilttSession } from './useQuilttSession'

export const useQuilttClient = (): QuilttClient<NormalizedCacheObject> => {
  const { session, forgetSession } = useQuilttSession()

  const client = useMemo(() => {
    return new QuilttClient({
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

  return client
}

export default useQuilttClient
