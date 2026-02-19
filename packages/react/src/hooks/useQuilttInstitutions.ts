'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ErrorData, InstitutionsData } from '@quiltt/core'
import { ConnectorsAPI } from '@quiltt/core'
import { useDebounce } from 'use-debounce'

import { getUserAgent } from '@/utils'
import { version } from '@/version'

import { useSession } from './useSession'

export type UseQuilttInstitutions = (
  connectorId: string,
  onErrorCallback?: (msg: string) => void
) => {
  searchTerm: string
  searchResults: InstitutionsData
  isSearching: boolean
  setSearchTerm: (term: string) => void
}

export const useQuilttInstitutions: UseQuilttInstitutions = (connectorId, onErrorCallback) => {
  const userAgent = useMemo(() => getUserAgent(version), [])
  const connectorsAPI = useMemo(
    () => new ConnectorsAPI(connectorId, userAgent),
    [connectorId, userAgent]
  )
  const [session] = useSession()

  const [searchTermInput, setSearchTermInput] = useState('')
  const [searchTerm] = useDebounce(searchTermInput, 350)
  const [searchResults, setSearchResults] = useState<InstitutionsData>([])

  const [isSearching, setIsSearching] = useState(false)

  // Store callback in ref to maintain stable reference
  const onErrorCallbackRef = useRef(onErrorCallback)
  useEffect(() => {
    onErrorCallbackRef.current = onErrorCallback
  })

  /**
   * Start Search
   * This function is used to initiate a search for institutions based on the provided term with
   * a minimum length of 2 characters. Debouncing is applied to avoid excessive API calls.
   */
  const startSearch = useCallback((term: string) => {
    if (term.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchTermInput(term)
  }, [])

  const handleError = useCallback((message: string) => {
    const errorMessage = message || 'Unknown error occurred while searching institutions'

    console.error('Quiltt Institutions Search Error:', errorMessage)
    if (onErrorCallbackRef.current) onErrorCallbackRef.current(errorMessage)
  }, [])

  /**
   * Run Search
   * This effect will run when the searchTerm changes and is at least 2 characters long.
   */
  useEffect(() => {
    if (!session?.token || !connectorId || !searchTerm || searchTerm.trim().length < 2) {
      return
    }

    const abortController = new AbortController()

    connectorsAPI
      .searchInstitutions(session?.token, connectorId, searchTerm, abortController.signal)
      .then((response) => {
        if (!abortController.signal.aborted) {
          if (response.status === 200) {
            setSearchResults(response.data as InstitutionsData)
          } else {
            handleError((response.data as ErrorData).message || 'Failed to fetch institutions')
          }
          setIsSearching(false)
        }
      })
      .catch((error) => {
        if (!abortController.signal.aborted) {
          handleError(error?.message)
          setIsSearching(false)
        }
      })

    return () => abortController.abort()
  }, [session?.token, connectorId, searchTerm, connectorsAPI, handleError])

  return {
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm: startSearch,
  }
}
