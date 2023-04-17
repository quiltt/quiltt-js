import type { Maybe } from '../types'

import type { Observer } from '../Observable'
import { Observable } from '../Observable'
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
  private observers: { [key: string]: Observer<T>[] } = {}
  private monitors: Set<string> = new Set()

  /**
   * Checks memoryStorage before falling back to localStorage.
   */
  get = (key: string): Maybe<T> | undefined => {
    this.monitorLocalStorageChanges(key)

    let state = this.memoryStore.get(key)

    if (state === undefined) {
      state = this.localStore.get(key)
    }

    return state
  }

  /**
   * We don't trust localStorage to always be present, so we can't rely on it to
   * update memoryStorage based on emitted changes. So we manage our own
   * emitting while using the underlying events to keep memoryStore in sync with
   * localStore.
   */
  set = (key: string, newState: Maybe<T> | undefined) => {
    this.monitorLocalStorageChanges(key)

    this.memoryStore.set(key, newState)
    this.localStore.set(key, newState)

    this.observers[key]?.forEach((update) => update(newState))
  }

  /**
   * Allows you to subscribe to all changes in memory or local storage as a
   * single event.
   */
  subscribe = (key: string, observer: Observer<T>) => {
    if (!this.observers[key]) this.observers[key] = []

    this.observers[key].push(observer)
  }

  unsubscribe = (key: string, observer: Observer<T>) => {
    this.observers[key] = this.observers[key]?.filter((update) => update !== observer)
  }

  /**
   * Sets bubble the changes down the stack starting with memoryStore and then
   * localStore. memoryStore will emit changes to everything within the current
   * window context, while localStore will emit changes to every other window
   * context.
   *
   * To ensure that the other windows are updated correctly, changes to localStore
   * need to be subscribed and updated to in memory store, which then may be subscribed
   * to outside of storage.
   */
  private monitorLocalStorageChanges = (key: string) => {
    if (this.monitors.has(key)) return

    this.localStore.subscribe(key, (nextState) => {
      const prevValue = this.memoryStore.get(key)
      const newState = nextState instanceof Function ? nextState(prevValue) : nextState

      this.memoryStore.set(key, newState)
      this.observers[key]?.forEach((update) => update(newState))
    })

    this.monitors.add(key)
  }
}

export * from './Local'
export * from './Memory'
export default Storage
