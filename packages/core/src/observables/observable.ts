import type { Dispatch, SetStateAction } from 'react'

import type { Maybe } from '../types'

export type Observer<T> = Dispatch<SetStateAction<Maybe<T> | undefined>>

/**
 * This is designed to support singletons to share the memory states across all
 * instance of hooks to ensure that updates only process once, by storing a value
 * then notifying all subscribers when it's updated.
 */
export class Observable<T> {
  private state?: Maybe<T>
  private observers: Observer<T>[] = []

  constructor(initialState?: Maybe<T>) {
    this.state = initialState
  }

  get = () => {
    return this.state
  }

  set = (nextState: Maybe<T> | undefined) => {
    if (this.state === nextState) return

    this.state = nextState
    this.observers.forEach((update) => {
      update(nextState)
    })
  }

  subscribe = (observer: Observer<T>) => {
    this.observers.push(observer)
  }

  unsubscribe = (observer: Observer<T>) => {
    this.observers = this.observers.filter((update) => update !== observer)
  }
}
