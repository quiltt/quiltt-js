import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Observable } from '@/observables'

describe('Observable', () => {
  let observable: Observable<number>

  beforeEach(() => {
    observable = new Observable<number>()
  })

  it('initializes with undefined state if no initial state is provided', () => {
    expect(observable.get()).toBeUndefined()
  })

  it('initializes with provided initial state', () => {
    const initialValue = 10
    const observableWithInitialState = new Observable<number>(initialValue)
    expect(observableWithInitialState.get()).toBe(initialValue)
  })

  it('updates the state and notifies observers', () => {
    const observer = vi.fn()
    const newState = 20

    observable.subscribe(observer)
    observable.set(newState)

    expect(observable.get()).toBe(newState)
    expect(observer).toHaveBeenCalledWith(newState)
  })

  it('does not notify observers when the state does not change', () => {
    const initialState = 10
    const observableWithInitialState = new Observable<number>(initialState)
    const observer = vi.fn()

    observableWithInitialState.subscribe(observer)
    observableWithInitialState.set(initialState) // Setting to the same initial state

    expect(observer).not.toHaveBeenCalled()
  })

  it('allows subscription and unsubscription of observers', () => {
    const observer1 = vi.fn()
    const observer2 = vi.fn()
    const newState = 30

    observable.subscribe(observer1)
    observable.subscribe(observer2)

    // Unsubscribe observer1 and update the state
    observable.unsubscribe(observer1)
    observable.set(newState)

    expect(observer1).not.toHaveBeenCalled()
    expect(observer2).toHaveBeenCalledWith(newState)
  })

  // TODO: Add any additional tests here to cover more scenarios and edge cases
})
