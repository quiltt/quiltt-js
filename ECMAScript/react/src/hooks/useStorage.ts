'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { Maybe } from '@quiltt/core'
import { Storage } from '@quiltt/core'

import { useEventListener } from './helpers'

/**
 * This is an singleton to share the memory states across all instance of
 * the hook; This basically acts like shared memory when there is no localStorage.
 */
const storage = new Storage<any>()

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
    let state

    if ((state = storage.get(key)) !== undefined) {
      return state
    }

    return initialState
  }, [key, initialState])

  const [hookState, setHookState] = useState<Maybe<T> | undefined>(getStorage())

  const setStorage = useCallback(
    (nextState: Maybe<T> | SetStateAction<Maybe<T> | undefined>) => {
      const newState = nextState instanceof Function ? nextState(hookState) : nextState

      if (hookState !== newState) {
        storage.set(key, newState)
      }
    },
    [key, hookState]
  )

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return
      }
      setStorage(getStorage())
    },
    [key, getStorage, setStorage]
  )

  /**
   * The empty dependency array ensures that the effect runs only once when the component mounts
   * and doesn't re-run unnecessarily on subsequent renders because it doesn't depend on any
   * props or state variables that could change during the component's lifetime.
   *
   * Use an empty dependency array to avoid unnecessary re-renders.
   */
  useEffect(() => {
    storage.subscribe(key, setHookState)

    setHookState(getStorage())

    return () => storage.unsubscribe(key, setHookState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [hookState, setStorage]
}

export default useStorage
