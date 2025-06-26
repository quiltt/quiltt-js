'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDebounce } from 'use-debounce'

import { InstitutionsAPI } from '@quiltt/core'
import type { ErrorData, InstitutionsData } from '@quiltt/core'

import { version } from '../version'
import useSession from './useSession'

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
  const agent = useMemo(() => {
    // Try deprecated navigator.product first (still used in some RN versions)
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return `react-native-${version}`
    }

    // Detect React Native by its unique environment characteristics
    const isReactNative = !!(
      // Has window (unlike Node.js)
      (
        typeof window !== 'undefined' &&
        // No document in window (unlike browsers)
        typeof window.document === 'undefined' &&
        // Has navigator (unlike Node.js)
        typeof navigator !== 'undefined'
      )
    )

    return isReactNative ? `react-native-${version}` : `react-${version}`
  }, [])

  const institutionsAPI = useMemo(
    () => new InstitutionsAPI(connectorId, agent),
    [connectorId, agent]
  )
  const [session] = useSession()

  const [searchTermInput, setSearchTermInput] = useState('')
  const [searchTerm] = useDebounce(searchTermInput, 350)
  const [searchResults, setSearchResults] = useState<InstitutionsData>([])

  const [isSearching, setIsSearching] = useState(false)

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

  const handleError = useCallback(
    (message: string) => {
      const errorMessage = message || 'Unknown error occurred while searching institutions'

      console.error('Quiltt Institutions Search Error:', errorMessage)
      if (onErrorCallback) onErrorCallback(errorMessage)
    },
    [onErrorCallback]
  )

  /**
   * Run Search
   * This effect will run when the searchTerm changes and is at least 2 characters long.
   */
  useEffect(() => {
    if (!session?.token || !connectorId || !searchTerm || searchTerm.trim().length < 2) {
      return
    }

    const abortController = new AbortController()

    institutionsAPI
      .search(session?.token, connectorId, searchTerm, abortController.signal)
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
          handleError(error.message)
          setIsSearching(false)
        }
      })

    return () => abortController.abort()
  }, [session?.token, connectorId, searchTerm, institutionsAPI, handleError])

  return {
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm: startSearch,
  }
}

export default useQuilttInstitutions
