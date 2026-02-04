import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Timeoutable } from '@/timing'

describe('Timeoutable', () => {
  let timeoutable: Timeoutable
  let timeoutId: NodeJS.Timeout | undefined

  beforeEach(() => {
    timeoutable = new Timeoutable()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('notifies the first observer after the specified delay', () => {
    const observer = vi.fn()
    const delay = 1000 // 1 second

    timeoutable.set(observer, delay)

    expect(observer).not.toHaveBeenCalled()

    // Simulate the passage of time
    vi.advanceTimersByTime(delay)

    expect(observer).toHaveBeenCalledTimes(1)
    expect(observer).toHaveBeenCalledWith(undefined) // As called by broadcast method
  })

  it('does not notify cleared observers', () => {
    const observer = vi.fn()
    const delay = 1000 // 1 second

    timeoutable.set(observer, delay)
    timeoutable.clear(observer)

    vi.advanceTimersByTime(delay)

    expect(observer).not.toHaveBeenCalled()
  })

  it('clears previous timeout when set is called multiple times', () => {
    const observer1 = vi.fn()
    const observer2 = vi.fn()
    const delay1 = 1000
    const delay2 = 500

    timeoutable.set(observer1, delay1)
    vi.advanceTimersByTime(500)

    // This should replace observer1 with observer2
    timeoutable.set(observer2, delay2)
    vi.advanceTimersByTime(500)

    // Original timeout was cleared, observer1 never fires
    expect(observer1).not.toHaveBeenCalled()
    // New timeout fires observer2
    expect(observer2).toHaveBeenCalledTimes(1)
  })
})
