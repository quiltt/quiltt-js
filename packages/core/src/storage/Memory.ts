import type { Observer } from '@/observables'
import { Observable } from '@/observables'
import type { Maybe } from '@/types'

/**
 * This is designed to support effectively an in memory key value store singleton,
 * similar to localStorage, but allows you to subscribe to changes within the current
 * window.
 */
export class MemoryStorage<T> {
  private observables: { [key: string]: Observable<T> } = {}

  get = (key: string) => {
    if (this.observables[key]) {
      return this.observables[key].get()
    }
    return undefined
  }

  set = (key: string, state: Maybe<T> | undefined): void => {
    if (!this.observables[key]) {
      this.observables[key] = new Observable<T>(state)
    } else {
      this.observables[key].set(state)
    }
  }

  subscribe = (key: string, observer: Observer<T>): void => {
    if (!this.observables[key]) this.observables[key] = new Observable<T>()

    this.observables[key].subscribe(observer)
  }

  unsubscribe = (key: string, observer: Observer<T>): void => {
    if (this.observables[key]) {
      this.observables[key].unsubscribe(observer)
    }
  }
}
