import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventListener } from '@/hooks/helpers/useEventListener'

describe('useEventListener', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add and remove window event listener', () => {
    const handler = vi.fn()
    const addEventListener = vi.spyOn(window, 'addEventListener')
    const removeEventListener = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useEventListener('click', handler))

    expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined)

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined)
  })

  it('should add and remove element event listener', () => {
    const handler = vi.fn()
    const element = document.createElement('div')
    const addEventListener = vi.spyOn(element, 'addEventListener')
    const removeEventListener = vi.spyOn(element, 'removeEventListener')

    const { unmount } = renderHook(() => useEventListener('click', handler, { current: element }))

    expect(addEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined)

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined)
  })

  it('should add and remove MediaQueryList event listener', () => {
    const handler = vi.fn()
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const addEventListener = vi.spyOn(mediaQuery, 'addEventListener')
    const removeEventListener = vi.spyOn(mediaQuery, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useEventListener('change', handler, { current: mediaQuery })
    )

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function), undefined)

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function), undefined)
  })

  it('should call handler when event is triggered', () => {
    const handler = vi.fn()
    const element = document.createElement('div')

    renderHook(() => useEventListener('click', handler, { current: element }))

    element.click()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(expect.any(Event))
  })
})
