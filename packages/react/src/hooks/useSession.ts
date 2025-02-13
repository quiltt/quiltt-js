'use client'

import { useCallback, useEffect, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { Maybe, PrivateClaims, QuilttJWT } from '@quiltt/core'
import { JsonWebTokenParse, Timeoutable } from '@quiltt/core'

import { useStorage } from './useStorage'

export type SetSession = Dispatch<SetStateAction<Maybe<string> | undefined>>

// Initialize JWT parser with our specific claims type
const parse = JsonWebTokenParse<PrivateClaims>

// Global timer to manage token expiration across all hook instances
const sessionTimer = new Timeoutable()

/**
 * Custom hook to manage JWT session state with automatic expiration handling.
 * Provides global singleton access to the session across components and windows.
 *
 * TODO: Support Rotation before Expiry
 *
 * Handles two types of data flow:
 * 1. Bottom-up (Login): Token passed through setSession callback
 * 2. Top-down (Refresh): State reinitialized on page reload
 *
 * @param storageKey - Key used for storing session in useStorage (defaults to 'session')
 * @returns [session, setSession] - Current session state and setter function
 */
export const useSession = (storageKey = 'session'): [Maybe<QuilttJWT> | undefined, SetSession] => {
  const [token, setToken] = useStorage<string>(storageKey)

  // Parse token into session data, updates when token changes
  const session = useMemo(() => parse(token), [token])

  // Handle session expiration
  useEffect(() => {
    if (!session) return

    const expirationMS = session.claims.exp * 1000
    const expire = () => setToken(null)

    // Clear immediately if already expired
    if (Date.now() >= expirationMS) {
      expire()
    } else {
      // Set timer to clear session at expiration time
      sessionTimer.set(expire, expirationMS - Date.now())
      return () => sessionTimer.clear(expire)
    }
  }, [session, setToken])

  /**
   * Validates and updates the session token.
   * - Handles both direct values and updater functions
   * - Validates new tokens before setting them
   * - Prevents unnecessary updates for same token value
   * - Allows clearing the session with null/undefined
   */
  const setSession = useCallback(
    (nextState: Maybe<string> | SetStateAction<Maybe<string> | undefined> | undefined) => {
      const newState = nextState instanceof Function ? nextState(token) : nextState

      // Only update if:
      // 1. The token has actually changed AND
      // 2. Either the new state is falsy (clearing session) OR it's a valid token
      if (token !== newState && (!newState || parse(newState))) {
        setToken(newState)
      }
    },
    [token, setToken]
  )

  return [session, setSession]
}

export default useSession
