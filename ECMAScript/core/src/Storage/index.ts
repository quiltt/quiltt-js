import type { Maybe } from '../types'

import type { Observer } from '../Observable'
import { LocalStorage } from './Local'
import { MemoryStorage } from './Memory'

/**
 * This is wraps both local and memory storage to create a unified interface, that
 * allows you to subscribe to all either changes made within this window, or changes
 * made by other windows.
 */
export class Storage<T> {
  private memoryStore = new MemoryStorage<T>()
  private localStore = new LocalStorage<T>()
  private observersMap: Array<[Observer<T>, Observer<T>]> = []

  /**
   * Checks memoryStorage before falling back to localStorage.
   */
  get = (key: string) => {
    let state

    if ((state = this.memoryStore.get(key)) !== undefined) {
      return state
    }

    if ((state = this.localStore.get(key)) !== undefined) {
      return state
    }

    return state
  }

  /**
   * Sets memoryStorage before updating localStorage.
   *
   * We don't need to worry about firing callbacks since each store does it.
   */
  set = (key: string, newState: Maybe<T> | undefined) => {
    this.memoryStore.set(key, newState)
    this.localStore.set(key, newState)
  }

  /**
   * Allows you to subscribe to all changes in memory or local storage as a single event
   *
   * Since memoryStorage and LocalStorage callback in different cases, we just
   * subscribe to both, rather than trying to manage it ourselves; but when a
   * localStorage removeItem event fires, we filter the callbacks to reduce noise.
   */
  subscribe = (key: string, observer: Observer<T>) => {
    const wrappedObserver: Observer<T> = (newState) => {
      if (this.memoryStore.get(key) !== newState) {
        observer(newState)
      }
    }
    this.observersMap.push([observer, wrappedObserver])

    this.memoryStore.subscribe(key, observer)
    this.localStore.subscribe(key, wrappedObserver)
  }

  unsubscribe = (key: string, observer: Observer<T>) => {
    const match = this.observersMap.find(([ori, _]) => ori === observer)
    if (!match) return

    this.memoryStore.unsubscribe(key, observer)
    this.localStore.unsubscribe(key, match[1])
  }
}

export * from './Local'
export * from './Memory'
export default Storage
