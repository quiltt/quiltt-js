import { computed, onUnmounted, ref, watch } from 'vue'

import type { ErrorData, InstitutionsData } from '@quiltt/core'
import { ConnectorsAPI } from '@quiltt/core'

import { version } from '../version'
import { useQuilttSession } from './use-quiltt-session'

const getUserAgent = (): string => `@quiltt/vue@${version}`

export const useQuilttInstitutions = (
  connectorId: string,
  onErrorCallback?: (msg: string) => void
) => {
  const { session } = useQuilttSession()

  const searchTermInput = ref('')
  const searchTerm = ref('')
  const searchResults = ref<InstitutionsData>([])
  const isSearching = ref(false)

  const debounceTimer = ref<ReturnType<typeof setTimeout> | undefined>()
  const abortController = ref<AbortController | undefined>()

  const connectorsAPI = new ConnectorsAPI(connectorId, getUserAgent())

  const handleError = (message: string) => {
    const errorMessage = message || 'Unknown error occurred while searching institutions'
    console.error('Quiltt Institutions Search Error:', errorMessage)
    onErrorCallback?.(errorMessage)
  }

  const setSearchTerm = (term: string) => {
    searchTermInput.value = term

    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }

    if (term.trim().length < 2) {
      searchTerm.value = ''
      searchResults.value = []
      isSearching.value = false
      return
    }

    isSearching.value = true
    debounceTimer.value = setTimeout(() => {
      searchTerm.value = term
    }, 350)
  }

  watch(
    [() => session.value?.token, searchTerm],
    async ([token, term]) => {
      if (!token || !connectorId || !term || term.trim().length < 2) {
        return
      }

      abortController.value?.abort()
      abortController.value = new AbortController()

      try {
        const response = await connectorsAPI.searchInstitutions(
          token,
          connectorId,
          term,
          abortController.value.signal
        )

        if (response.status === 200) {
          searchResults.value = response.data as InstitutionsData
        } else {
          handleError((response.data as ErrorData).message || 'Failed to fetch institutions')
        }
      } catch (error: any) {
        if (!abortController.value.signal.aborted) {
          handleError(error?.message)
        }
      } finally {
        if (!abortController.value.signal.aborted) {
          isSearching.value = false
        }
      }
    },
    { immediate: false }
  )

  onUnmounted(() => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
    abortController.value?.abort()
  })

  return {
    searchTerm: computed(() => searchTerm.value),
    searchResults: computed(() => searchResults.value),
    isSearching: computed(() => isSearching.value),
    setSearchTerm,
  }
}
