import type { Maybe } from '../types'

import { Observable } from '../Observable'
import type { Observer } from '../Observable'

/**
 * This is designed to support effectively an in memory key value store singleton,
 * similar to localstorage, but allows you to subscribe to changes within the current
 * window.
 */
export class MemoryStorage<T> {
  private observables: { [key: string]: Observable<T> } = {}

  get = (key: string) => {
    if (this.observables[key]) {
      return this.observables[key].get()
    } else {
      return undefined
    }
  }

  set = (key: string, state: Maybe<T> | undefined) => {
    if (!this.observables[key]) {
      this.observables[key] = new Observable<T>(state)
    } else {
      this.observables[key].set(state)
    }
  }

  subscribe = (key: string, observer: Observer<T>) => {
    if (!this.observables[key]) this.observables[key] = new Observable<T>()

    this.observables[key].subscribe(observer)
  }

  unsubscribe = (key: string, observer: Observer<T>) => {
    this.observables[key].unsubscribe(observer)
  }
}

export default MemoryStorage
