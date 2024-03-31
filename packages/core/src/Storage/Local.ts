import type { Maybe } from '../types'
import type { Observer } from '../Observable'

/**
 * An error and type safe wrapper for localStorage.
 * It allows you to subscribe to changes;
 * but localStorage changes only fire with another
 * window updates the record.
 */
export class LocalStorage<T> {
  private observers: { [key: string]: Observer<T>[] } = {}

  constructor() {
    if (typeof window !== 'undefined' && !window?.expo) {
      window.addEventListener('storage', this.handleStorageEvent.bind(this))
    }
  }

  isEnabled = (): boolean => {
    try {
      localStorage.setItem(`quiltt.ping`, 'pong')
      localStorage.removeItem(`quiltt.ping`)
      return true
    } catch (error) {
      return false
    }
  }

  isDisabled = (): boolean => !this.isEnabled()

  get = (key: string): Maybe<T> | undefined => {
    if (typeof window === 'undefined' || !!window.expo) return undefined

    try {
      const state = window.localStorage.getItem(`quiltt.${key}`)
      return state ? JSON.parse(state) : state
    } catch (error) {
      console.warn(`localStorage Error: "quiltt.${key}"`, error)
      return undefined
    }
  }

  set = (key: string, state: Maybe<T> | undefined): void => {
    if (typeof window === 'undefined' || !!window.expo) return

    try {
      if (state) {
        window.localStorage.setItem(`quiltt.${key}`, JSON.stringify(state))
      } else {
        window.localStorage.removeItem(`quiltt.${key}`)
      }
    } catch (error) {
      console.warn(`localStorage Error: "quiltt.${key}"`, error)
    }
  }

  remove = (key: string) => {
    try {
      window.localStorage.removeItem(`quiltt.${key}`)
    } catch (error) {
      console.warn(`localStorage Error: "quiltt.${key}">`, error)
    }
  }

  subscribe = (key: string, observer: Observer<T>) => {
    if (!this.observers[key]) this.observers[key] = []

    this.observers[key].push(observer)
  }

  unsubscribe = (key: string, observer: Observer<T>) => {
    this.observers[key] = this.observers[key]?.filter((update) => update !== observer)
  }

  // if there is a key, then trigger the related updates. If there is not key
  // it means that a record has been removed and everything needs to be rechecked.
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key && event.key.includes('quiltt.')) {
      const newState = event.newValue ? JSON.parse(event.newValue) : null

      if (this.observers[event.key]) {
        this.observers[event.key].forEach((update) => update(newState))
      }
    } else {
      Object.entries(this.observers).forEach(([key, observers]) => {
        observers.forEach((update) => update(this.get(key)))
      })
    }
  }
}
