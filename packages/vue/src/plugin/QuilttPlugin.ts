/**
 * Quiltt Vue Plugin implementation
 *
 * Provides session state management via Vue's provide/inject system.
 * Handles token parsing, storage synchronization, and automatic expiration.
 */

import type { App, Plugin } from 'vue'
import { ref, watch } from 'vue'

import type { Maybe, PrivateClaims, QuilttJWT } from '@quiltt/core'
import { JsonWebTokenParse } from '@quiltt/core'

import type { QuilttPluginOptions } from './keys'
import { QuilttClientIdKey, QuilttSessionKey, QuilttSetSessionKey } from './keys'

// Initialize JWT parser with our specific claims type
const parse = JsonWebTokenParse<PrivateClaims>

// Storage key for session persistence
const STORAGE_KEY = 'quiltt:session'

/**
 * Get stored token from localStorage (browser only)
 */
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null
  }
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Store token in localStorage (browser only)
 */
const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage not available
  }
}

/**
 * Quiltt Vue Plugin
 *
 * Provides session management across your Vue application.
 * Use with `app.use(QuilttPlugin, options)`.
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { QuilttPlugin } from '@quiltt/vue'
 *
 * const app = createApp(App)
 * app.use(QuilttPlugin, { token: '<SESSION_TOKEN>' })
 * app.mount('#app')
 * ```
 */
export const QuilttPlugin: Plugin<[QuilttPluginOptions?]> = {
  install(app: App, options?: QuilttPluginOptions) {
    // Instance-scoped timeout for session expiration
    let sessionTimeout: ReturnType<typeof setTimeout> | undefined
    let isCleanedUp = false
    let stopSessionWatcher: (() => void) | undefined

    /**
     * Clear the session timeout for this app instance
     */
    const clearSessionTimeout = () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout)
        sessionTimeout = undefined
      }
    }

    // Initialize with provided token or stored token
    const initialToken = options?.token ?? getStoredToken()
    const initialSession = parse(initialToken)

    // Reactive session state
    const session = ref<Maybe<QuilttJWT> | undefined>(initialSession)
    const clientId = ref<string | undefined>(options?.clientId)

    /**
     * Set session token
     * Parses token, updates storage, and sets expiration timer
     */
    const setSession = (token: Maybe<string>): void => {
      const parsed = parse(token)
      session.value = parsed
      setStoredToken(token ?? null)

      // Clear any existing expiration timer
      clearSessionTimeout()

      // Set new expiration timer if session is valid
      if (parsed) {
        const expirationMS = parsed.claims.exp * 1000
        const timeUntilExpiry = expirationMS - Date.now()

        if (timeUntilExpiry > 0) {
          sessionTimeout = setTimeout(() => {
            session.value = null
            setStoredToken(null)
          }, timeUntilExpiry)
        } else {
          // Token already expired
          session.value = null
          setStoredToken(null)
        }
      }
    }

    // Storage event handler for cross-tab synchronization
    let storageHandler: ((event: StorageEvent) => void) | undefined

    // Listen for storage changes from other tabs/windows
    if (typeof window !== 'undefined') {
      storageHandler = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
          const newSession = parse(event.newValue)
          session.value = newSession
        }
      }
      window.addEventListener('storage', storageHandler)
    }

    // Cleanup function for when the app is unmounted
    const cleanup = () => {
      if (isCleanedUp) {
        return
      }
      isCleanedUp = true

      clearSessionTimeout()
      if (stopSessionWatcher) {
        stopSessionWatcher()
        stopSessionWatcher = undefined
      }
      if (typeof window !== 'undefined' && storageHandler) {
        window.removeEventListener('storage', storageHandler)
        storageHandler = undefined
      }
    }

    // Register cleanup on app unmount (Vue 3.5+)
    if (typeof app.onUnmount === 'function') {
      app.onUnmount(cleanup)
    }

    // Ensure cleanup runs on all supported Vue versions (3.3+)
    if (typeof app.unmount === 'function') {
      const originalUnmount = app.unmount.bind(app)
      app.unmount = (...args: Parameters<typeof originalUnmount>) => {
        cleanup()
        return originalUnmount(...args)
      }
    }

    // Watch for session changes to update expiration timer
    stopSessionWatcher = watch(
      () => session.value,
      (newSession) => {
        if (!newSession) {
          clearSessionTimeout()
          return
        }

        const expirationMS = newSession.claims.exp * 1000
        const timeUntilExpiry = expirationMS - Date.now()

        if (timeUntilExpiry <= 0) {
          session.value = null
          setStoredToken(null)
          return
        }

        clearSessionTimeout()
        sessionTimeout = setTimeout(() => {
          session.value = null
          setStoredToken(null)
        }, timeUntilExpiry)
      },
      { immediate: true }
    )

    // Provide session state to all components
    app.provide(QuilttSessionKey, session)
    app.provide(QuilttSetSessionKey, setSession)
    app.provide(QuilttClientIdKey, clientId)
  },
}
