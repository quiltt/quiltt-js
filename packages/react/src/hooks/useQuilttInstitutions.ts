'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { version } from '@/version'
import { InstitutionsAPI } from '@quiltt/core'
import type { InstitutionsData, ErrorData } from '@quiltt/core'

import useSession from './useSession'

export type UseQuilttInstitutions = (connectorId: string, onErrorCallback?: (msg: string) => void) => {
  searchTerm: string
  searchResults: InstitutionsData
  isSearching: boolean
  setSearchTerm: (term: string) => void
}

export const useQuilttInstitutions: UseQuilttInstitutions = (connectorId, onErrorCallback) => {
  const agent = useMemo(() => {
    const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
    return isReactNative ? `react-native-${version}` : `react-${version}`
  }, [])

  const institutionsAPI = useMemo(() => new InstitutionsAPI(connectorId, agent), [connectorId, agent])
  const [session, _] = useSession()

  const [searchTermInput, setSearchTermInput] = useState('')
  const [searchTerm] = useDebounce(searchTermInput, 350)
  const [searchResults, setSearchResults] = useState<InstitutionsData>([])

  const [isSearching, setIsSearching] = useState(false)

  /**
   * Start Search
   * This function is used to initiate a search for institutions based on the provided term with
   * a minimum length of 3 characters. Debouncing is applied to avoid excessive API calls.
   */
  const startSearch = useCallback(
    (term: string) => {
      if (term.trim().length < 2) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setSearchTermInput(term)
    },
    []
  )

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

    institutionsAPI.search(session?.token, connectorId, searchTerm).then((response) => {
      if (response.status !== 200) {
        setSearchResults(response.data as InstitutionsData)
      } else {
        handleError((response.data as ErrorData).message || 'Failed to fetch institutions')
      }

      setIsSearching(false)
    })
  }, [session?.token, connectorId, searchTerm, institutionsAPI, handleError])

  return {
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm: startSearch,
  }
}

export default useQuilttInstitutions
