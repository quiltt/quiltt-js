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
    let state: Maybe<T>

    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    if ((state = GlobalStorage.get(key)) !== undefined) {
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
      }
    },
    [key, hookState]
  )

  /**
   * The empty dependency array ensures that the effect runs only once when the component mounts
   * and doesn't re-run unnecessarily on subsequent renders because it doesn't depend on any
   * props or state variables that could change during the component's lifetime.
   *
   * Use an empty dependency array to avoid unnecessary re-renders.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    GlobalStorage.subscribe(key, setHookState)

    setHookState(getStorage())

    return () => GlobalStorage.unsubscribe(key, setHookState)
  }, [])

  return [hookState, setStorage]
}

export default useStorage
