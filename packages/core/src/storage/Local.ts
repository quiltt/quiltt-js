import type { Observer } from '@/observables'
import type { Maybe } from '@/types'

/**
 * An error and type safe wrapper for localStorage.
 * It allows you to subscribe to changes;
 * but localStorage changes only fire when another
 * window updates the record.
 */
export class LocalStorage<T = any> {
  private observers: { [key: string]: Observer<T>[] } = {}
  private readonly keyPrefix: string

  constructor(keyPrefix = 'quiltt') {
    this.keyPrefix = keyPrefix

    if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent.bind(this))
    }
  }

  isEnabled = (): boolean => {
    try {
      const testKey = `${this.keyPrefix}.ping`
      localStorage.setItem(testKey, 'pong')
      localStorage.removeItem(testKey)
      return true
    } catch (_error) {
      return false
    }
  }

  isDisabled = (): boolean => !this.isEnabled()

  get = (key: string): Maybe<T> | undefined => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return undefined
    }

    const fullKey = this.getFullKey(key)
    try {
      const state = window.localStorage.getItem(fullKey)
      return state ? (JSON.parse(state) as T) : null
    } catch (error) {
      console.warn(`localStorage Error: "${fullKey}"`, error)
      return undefined
    }
  }

  set = (key: string, state: Maybe<T> | undefined): void => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return

    const fullKey = this.getFullKey(key)
    try {
      if (state !== null && state !== undefined) {
        window.localStorage.setItem(fullKey, JSON.stringify(state))
      } else {
        window.localStorage.removeItem(fullKey)
      }
    } catch (error) {
      console.warn(`localStorage Error: "${fullKey}"`, error)
    }
  }

  remove = (key: string): void => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return

    const fullKey = this.getFullKey(key)
    try {
      window.localStorage.removeItem(fullKey)
    } catch (error) {
      console.warn(`localStorage Error: "${fullKey}"`, error)
    }
  }

  has = (key: string): boolean => {
    return this.get(key) !== null && this.get(key) !== undefined
  }

  clear = (): void => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return

    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(`${this.keyPrefix}.`)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn(`localStorage Error during clear`, error)
    }
  }

  subscribe = (key: string, observer: Observer<T>): (() => void) => {
    const fullKey = this.getFullKey(key)

    if (!this.observers[fullKey]) {
      this.observers[fullKey] = []
    }

    this.observers[fullKey].push(observer)

    // Return unsubscribe function
    return () => this.unsubscribe(key, observer)
  }

  unsubscribe = (key: string, observer: Observer<T>): void => {
    const fullKey = this.getFullKey(key)

    if (this.observers[fullKey]) {
      this.observers[fullKey] = this.observers[fullKey].filter((update) => update !== observer)

      // Clean up empty observer arrays
      if (this.observers[fullKey].length === 0) {
        delete this.observers[fullKey]
      }
    }
  }

  // Get all keys that match quiltt prefix
  keys = (): string[] => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return []
    }

    const keys: string[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(`${this.keyPrefix}.`)) {
          keys.push(key.replace(`${this.keyPrefix}.`, ''))
        }
      }
    } catch (error) {
      console.warn('localStorage Error getting keys', error)
    }
    return keys
  }

  private getFullKey = (key: string): string => {
    return `${this.keyPrefix}.${key}`
  }

  /**
   * Handle storage events from other windows/tabs
   * If there is a key, then trigger the related updates. If there is no key
   * it means that a record has been removed and everything needs to be rechecked.
   */
  private handleStorageEvent = (event: StorageEvent): void => {
    const isQuilttKey = event.key?.startsWith(`${this.keyPrefix}.`)

    if (isQuilttKey && event.key) {
      // Parse the new value safely
      let newState: T | null = null
      try {
        newState = event.newValue ? JSON.parse(event.newValue) : null
      } catch (error) {
        console.warn(`Failed to parse storage event value for ${event.key}`, error)
        return
      }

      if (this.observers[event.key]) {
        this.observers[event.key].forEach((observer) => {
          try {
            observer(newState)
          } catch (error) {
            console.warn(`Observer error for key ${event.key}`, error)
          }
        })
      }
    } else if (!event.key) {
      // Storage was cleared or changed in a way that doesn't specify a key
      // Re-check all observed keys
      Object.entries(this.observers).forEach(([fullKey, observers]) => {
        const shortKey = fullKey.replace(`${this.keyPrefix}.`, '')
        const currentValue = this.get(shortKey)

        observers.forEach((observer) => {
          try {
            observer(currentValue)
          } catch (error) {
            console.warn(`Observer error for key ${fullKey}`, error)
          }
        })
      })
    }
  }
}
