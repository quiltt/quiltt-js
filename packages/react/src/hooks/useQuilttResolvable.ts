'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ErrorData, ResolvableData } from '@quiltt/core'
import { ConnectorsAPI } from '@quiltt/core'

import { getUserAgent } from '@/utils'
import { version } from '@/version'

import useSession from './useSession'

export type UseQuilttResolvable = (
  connectorId: string,
  onErrorCallback?: (msg: string) => void
) => {
  checkResolvable: (providerId: {
    plaid?: string
    mock?: string
    mx?: string
    finicity?: string
    akoya?: string
  }) => Promise<boolean | null>
  isLoading: boolean
  isResolvable: boolean | null
  error: string | null
}

export const useQuilttResolvable: UseQuilttResolvable = (connectorId, onErrorCallback) => {
  const userAgent = useMemo(() => getUserAgent(version), [])
  const connectorsAPI = useMemo(
    () => new ConnectorsAPI(connectorId, userAgent),
    [connectorId, userAgent]
  )
  const [session] = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const [isResolvable, setIsResolvable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Store callback in ref to maintain stable reference
  const onErrorCallbackRef = useRef(onErrorCallback)
  useEffect(() => {
    onErrorCallbackRef.current = onErrorCallback
  })

  const handleError = useCallback((message: string) => {
    const errorMessage = message || 'Unknown error occurred while checking resolvability'

    setError(errorMessage)
    console.error('Quiltt Connector Resolvable Error:', errorMessage)
    if (onErrorCallbackRef.current) onErrorCallbackRef.current(errorMessage)
  }, [])

  const checkResolvable = useCallback(
    async (providerId: {
      plaid?: string
      mock?: string
      mx?: string
      finicity?: string
      akoya?: string
    }): Promise<boolean | null> => {
      if (!session?.token) {
        handleError('Missing session token')
        return null
      }

      if (!connectorId) {
        handleError('Missing connector ID')
        return null
      }

      const hasProviderId = Object.values(providerId).some((id) => !!id)
      if (!hasProviderId) {
        handleError('No provider ID specified')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await connectorsAPI.checkResolvable(session.token, connectorId, providerId)

        if (response.status === 200) {
          const result = (response.data as ResolvableData).resolvable
          setIsResolvable(result)
          return result
        }

        handleError((response.data as ErrorData).message || 'Failed to check resolvability')
        setIsResolvable(null)
        return null
      } catch (error: any) {
        handleError(error?.message)
        setIsResolvable(null)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [session?.token, connectorId, connectorsAPI, handleError]
  )

  return {
    checkResolvable,
    isLoading,
    isResolvable,
    error,
  }
}

export default useQuilttResolvable
