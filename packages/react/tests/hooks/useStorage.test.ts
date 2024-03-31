import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStorage } from '@/hooks/useStorage'
import { GlobalStorage } from '@quiltt/core'

vi.mock('@quiltt/core', () => ({
  GlobalStorage: {
    get: vi.fn(),
    set: vi.fn(),
    subscribe: vi.fn((key, callback) => {
      // Mock a simple subscription mechanism
      const triggerUpdate = <T>(value: T) => callback(value)
      return { triggerUpdate }
    }),
    unsubscribe: vi.fn(),
  },
}))

describe('useStorage', () => {
  const storageKey = 'testKey'
  const initialValue = 'initialValue'

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()
  })

  it('initializes with the value from GlobalStorage', () => {
    vi.spyOn(GlobalStorage, 'get').mockReturnValue(initialValue)

    const { result } = renderHook(() => useStorage(storageKey))

    expect(result.current[0]).toBe(initialValue)
    expect(GlobalStorage.get).toHaveBeenCalledWith(storageKey)
  })

  // Add more tests to cover other scenarios like testing the effect cleanup
})
