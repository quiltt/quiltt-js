import { computed, onUnmounted, ref, watch } from 'vue'

import type { Maybe } from '@quiltt/core'
import { GlobalStorage } from '@quiltt/core'

export const useStorage = <T>(key: string, initialState?: Maybe<T>) => {
  const readStorage = () => {
    const current = GlobalStorage.get(key)
    if (current !== undefined) {
      return current as Maybe<T>
    }

    return initialState
  }

  const state = ref<Maybe<T> | undefined>(readStorage())

  const setStorage = (
    nextState: Maybe<T> | undefined | ((prev: Maybe<T> | undefined) => Maybe<T> | undefined)
  ) => {
    const resolved = nextState instanceof Function ? nextState(state.value) : nextState

    if (state.value !== resolved) {
      GlobalStorage.set(key, resolved)
      state.value = resolved
    }
  }

  watch(
    () => key,
    () => {
      state.value = readStorage()
    },
    { immediate: false }
  )

  const handleStorageChange = (newValue: Maybe<T> | undefined) => {
    state.value = newValue
  }

  GlobalStorage.subscribe(key, handleStorageChange)

  onUnmounted(() => {
    GlobalStorage.unsubscribe(key, handleStorageChange)
  })

  return {
    storage: computed(() => state.value),
    setStorage,
  }
}

export default useStorage
