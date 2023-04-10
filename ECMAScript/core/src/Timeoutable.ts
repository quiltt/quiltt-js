import type { Observer } from './Observable'

/**
 * This is designed to support singletons to timeouts that can broadcast to any
 * observers, preventing race conditions with multiple timeouts.
 */
export class Timeoutable {
  private timeout?: ReturnType<typeof setTimeout>
  private observers: Observer<void>[] = []

  set = (callback: () => void, delay: number | undefined) => {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.observers.push(callback)
    this.timeout = setTimeout(this.broadcast.bind(this), delay)
  }

  clear = (observer: Observer<void>) => {
    this.observers = this.observers.filter((callback) => callback !== observer)
  }

  // Only sends to the 1st listener, but ensures that someone is notified
  private broadcast = () => {
    if (this.observers.length === 0) return

    this.observers[0](undefined)
  }
}

export default Timeoutable
