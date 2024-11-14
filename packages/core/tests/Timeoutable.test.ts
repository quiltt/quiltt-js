import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Timeoutable } from '@/Timeoutable'

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

  // TODO: Add any additional tests here to cover more scenarios and edge cases
})
