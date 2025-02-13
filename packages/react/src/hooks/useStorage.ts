'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { Maybe } from '@quiltt/core'
import { GlobalStorage } from '@quiltt/core'

/**
 * Attempt to persist state with local storage, so it remains after refresh and
 * across open documents. Falls back to in memory storage when localStorage is
 * unavailable.
 *
 * This hook is used in the same way as useState except that you must pass the
 * storage key in the 1st parameter. If the window object is not present (as in SSR),
 * useStorage() will return the default nextState.
 *
 * Expect values to remain in sync
 *   Across Hooks
 *   Across Reloads
 *   Across Windows (Documents)
 *
 * @param key
 * @param initialState
 * @returns {Array} [storage, setStorage]
 */
export const useStorage = <T>(
  key: string,
  initialState?: Maybe<T>
): [Maybe<T> | undefined, Dispatch<SetStateAction<Maybe<T> | undefined>>] => {
  const getStorage = useCallback(() => {
    const state = GlobalStorage.get(key)
    if (state !== undefined) {
      return state
    }

    return initialState
  }, [key, initialState])

  const [hookState, setHookState] = useState<Maybe<T> | undefined>(getStorage())

  const setStorage = useCallback(
    (nextState: Maybe<T> | SetStateAction<Maybe<T> | undefined>) => {
      const newState = nextState instanceof Function ? nextState(hookState) : nextState
      if (hookState !== newState) {
        GlobalStorage.set(key, newState)
        // Immediately update hook state as well
        setHookState(newState)
      }
    },
    [key, hookState]
  )

  useEffect(() => {
    // Subscribe to storage changes and ensure state is synchronized
    // Reruns when key or state changes to maintain consistency
    GlobalStorage.subscribe(key, (newValue) => {
      // Only update if the value is different from current state
      if (newValue !== hookState) {
        setHookState(newValue)
      }
    })

    // Initial sync
    const initialValue = getStorage()
    if (initialValue !== hookState) {
      setHookState(initialValue)
    }

    return () => GlobalStorage.unsubscribe(key, setHookState)
  }, [key, hookState, getStorage])

  return [hookState, setStorage]
}

export default useStorage
