import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { GlobalStorage } from '@quiltt/core'

import { useStorage } from '@/hooks/useStorage'

// Store subscription callbacks to trigger them manually in tests
const subscriptionCallbacks = new Map<string, Set<(value: any) => void>>()

vi.mock('@quiltt/core', () => ({
  GlobalStorage: {
    get: vi.fn(),
    set: vi.fn(),
    subscribe: vi.fn((key: string, callback: (value: any) => void) => {
      if (!subscriptionCallbacks.has(key)) {
        subscriptionCallbacks.set(key, new Set())
      }
      subscriptionCallbacks.get(key)?.add(callback)
    }),
    unsubscribe: vi.fn((key: string, callback: (value: any) => void) => {
      subscriptionCallbacks.get(key)?.delete(callback)
    }),
  },
}))

describe('useStorage', () => {
  const storageKey = 'testKey'
  const initialValue = 'initialValue'

  beforeEach(() => {
    vi.clearAllMocks()
    subscriptionCallbacks.clear()
  })

  describe('initialization', () => {
    it('initializes with the value from GlobalStorage when it exists', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('storedValue')

      const { result } = renderHook(() => useStorage(storageKey, initialValue))

      expect(result.current[0]).toBe('storedValue')
      expect(GlobalStorage.get).toHaveBeenCalledWith(storageKey)
    })

    it('initializes with the default value when GlobalStorage is empty', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(undefined)

      const { result } = renderHook(() => useStorage(storageKey, initialValue))

      expect(result.current[0]).toBe(initialValue)
    })

    it('initializes with undefined when no storage value and no default', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(undefined)

      const { result } = renderHook(() => useStorage(storageKey))

      expect(result.current[0]).toBeUndefined()
    })

    it('handles null as a valid initial value', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(null)

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      expect(result.current[0]).toBeNull()
    })

    it('handles complex object types', () => {
      const complexObject = { user: { id: 1, name: 'John' }, settings: { theme: 'dark' } }
      vi.mocked(GlobalStorage.get).mockReturnValue(complexObject)

      const { result } = renderHook(() =>
        useStorage<typeof complexObject>(storageKey, complexObject)
      )

      expect(result.current[0]).toEqual(complexObject)
    })
  })

  describe('setStorage', () => {
    it('calls GlobalStorage.set when setting a new value', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(initialValue)

      const { result } = renderHook(() => useStorage(storageKey, initialValue))

      const newValue = 'newValue'
      act(() => {
        result.current[1](newValue)
      })

      expect(GlobalStorage.set).toHaveBeenCalledWith(storageKey, newValue)
    })

    it('does not call GlobalStorage.set when setting the same value', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(initialValue)

      const { result } = renderHook(() => useStorage(storageKey, initialValue))

      act(() => {
        result.current[1](initialValue)
      })

      expect(GlobalStorage.set).not.toHaveBeenCalled()
    })

    it('handles function updates (SetStateAction)', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(5)

      const { result } = renderHook(() => useStorage<number>(storageKey, 5))

      act(() => {
        result.current[1]((prev) => (prev ?? 0) + 10)
      })

      expect(GlobalStorage.set).toHaveBeenCalledWith(storageKey, 15)
    })

    it('can set value to null', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { result } = renderHook(() => useStorage(storageKey, 'value'))

      act(() => {
        result.current[1](null)
      })

      expect(GlobalStorage.set).toHaveBeenCalledWith(storageKey, null)
    })

    it('can set value to undefined', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { result } = renderHook(() => useStorage(storageKey, 'value'))

      act(() => {
        result.current[1](undefined)
      })

      expect(GlobalStorage.set).toHaveBeenCalledWith(storageKey, undefined)
    })

    it('handles complex object updates', () => {
      const initial = { count: 0, name: 'test' }
      vi.mocked(GlobalStorage.get).mockReturnValue(initial)

      const { result } = renderHook(() => useStorage(storageKey, initial))

      const updated = { count: 1, name: 'updated' }
      act(() => {
        result.current[1](updated)
      })

      expect(GlobalStorage.set).toHaveBeenCalledWith(storageKey, updated)
    })
  })

  describe('subscription and synchronization', () => {
    it('subscribes to storage changes on mount', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(initialValue)

      renderHook(() => useStorage(storageKey, initialValue))

      expect(GlobalStorage.subscribe).toHaveBeenCalledWith(storageKey, expect.any(Function))
    })

    it('unsubscribes from storage changes on unmount', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(initialValue)

      const { unmount } = renderHook(() => useStorage(storageKey, initialValue))

      unmount()

      expect(GlobalStorage.unsubscribe).toHaveBeenCalledWith(storageKey, expect.any(Function))
    })
  })

  describe('key changes', () => {
    it('updates subscription when key changes', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value1')

      const { rerender } = renderHook(({ key }) => useStorage(key, 'default'), {
        initialProps: { key: 'key1' },
      })

      expect(GlobalStorage.subscribe).toHaveBeenCalledWith('key1', expect.any(Function))

      vi.mocked(GlobalStorage.get).mockReturnValue('value2')
      rerender({ key: 'key2' })

      expect(GlobalStorage.subscribe).toHaveBeenCalledWith('key2', expect.any(Function))
      expect(GlobalStorage.unsubscribe).toHaveBeenCalledWith('key1', expect.any(Function))
    })
  })

  describe('type safety', () => {
    it('maintains type information for strings', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('test')

      const { result } = renderHook(() => useStorage<string>(storageKey, 'default'))

      // TypeScript should know this is a string | null | undefined
      const value: string | null | undefined = result.current[0]
      expect(typeof value).toBe('string')
    })

    it('maintains type information for numbers', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(42)

      const { result } = renderHook(() => useStorage<number>(storageKey, 0))

      const value: number | null | undefined = result.current[0]
      expect(typeof value).toBe('number')
    })

    it('maintains type information for custom interfaces', () => {
      interface User {
        id: number
        name: string
      }

      const user: User = { id: 1, name: 'John' }
      vi.mocked(GlobalStorage.get).mockReturnValue(user)

      const { result } = renderHook(() => useStorage<User>(storageKey, user))

      const value: User | null | undefined = result.current[0]
      expect(value).toEqual(user)
    })
  })

  describe('cross-instance synchronization', () => {
    it('synchronizes state when external storage changes', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('initial')

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      expect(result.current[0]).toBe('initial')

      // Simulate external storage change by triggering subscription callback
      act(() => {
        const callbacks = subscriptionCallbacks.get(storageKey)
        callbacks?.forEach((callback) => {
          callback('updated-externally')
        })
      })

      expect(result.current[0]).toBe('updated-externally')
    })

    it('synchronizes between multiple hook instances', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('initial')

      const { result: result1 } = renderHook(() => useStorage(storageKey, 'default'))
      const { result: result2 } = renderHook(() => useStorage(storageKey, 'default'))

      expect(result1.current[0]).toBe('initial')
      expect(result2.current[0]).toBe('initial')

      // Update from first instance
      act(() => {
        result1.current[1]('updated')
      })

      // Simulate synchronization to second instance
      act(() => {
        const callbacks = subscriptionCallbacks.get(storageKey)
        callbacks?.forEach((callback) => {
          callback('updated')
        })
      })

      expect(result2.current[0]).toBe('updated')
    })

    it('handles rapid successive updates', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('initial')

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      act(() => {
        result.current[1]('update1')
        result.current[1]('update2')
        result.current[1]('update3')
      })

      expect(GlobalStorage.set).toHaveBeenCalledTimes(3)
      expect(GlobalStorage.set).toHaveBeenLastCalledWith(storageKey, 'update3')
    })

    it('handles null being broadcast to all instances', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      // External change to null
      act(() => {
        const callbacks = subscriptionCallbacks.get(storageKey)
        callbacks?.forEach((callback) => {
          callback(null)
        })
      })

      expect(result.current[0]).toBeNull()
    })

    it('handles undefined being broadcast to all instances', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      // External change to undefined
      act(() => {
        const callbacks = subscriptionCallbacks.get(storageKey)
        callbacks?.forEach((callback) => {
          callback(undefined)
        })
      })

      expect(result.current[0]).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles very long strings', () => {
      const longString = 'x'.repeat(10000)
      vi.mocked(GlobalStorage.get).mockReturnValue(longString)

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      expect(result.current[0]).toBe(longString)
    })

    it('handles deeply nested objects', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      }
      vi.mocked(GlobalStorage.get).mockReturnValue(deepObject)

      const { result } = renderHook(() => useStorage(storageKey, {}))

      expect(result.current[0]).toEqual(deepObject)
    })

    it('handles arrays as values', () => {
      const arrayValue = [1, 2, 3, 'four', { five: 5 }]
      vi.mocked(GlobalStorage.get).mockReturnValue(arrayValue)

      const { result } = renderHook(() => useStorage(storageKey, []))

      expect(result.current[0]).toEqual(arrayValue)
    })

    it('handles boolean values', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(true)

      const { result } = renderHook(() => useStorage<boolean>(storageKey, false))

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1](false)
      })

      expect(GlobalStorage.set).toHaveBeenCalledWith(storageKey, false)
    })

    it('handles zero as a valid value', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue(0)

      const { result } = renderHook(() => useStorage<number>(storageKey, 100))

      expect(result.current[0]).toBe(0)
    })

    it('handles empty string as a valid value', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('')

      const { result } = renderHook(() => useStorage<string>(storageKey, 'default'))

      expect(result.current[0]).toBe('')
    })

    it('does not update when setter receives same value via function', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { result } = renderHook(() => useStorage(storageKey, 'default'))

      act(() => {
        result.current[1]((prev) => prev) // Return same value
      })

      expect(GlobalStorage.set).not.toHaveBeenCalled()
    })
  })

  describe('performance and cleanup', () => {
    it('properly cleans up subscriptions on unmount', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { unmount } = renderHook(() => useStorage(storageKey, 'default'))

      // Verify subscription was created
      expect(GlobalStorage.subscribe).toHaveBeenCalledWith(storageKey, expect.any(Function))

      const subscribedCallback = vi.mocked(GlobalStorage.subscribe).mock.calls[0][1]

      unmount()

      // Verify unsubscription with the exact same callback
      expect(GlobalStorage.unsubscribe).toHaveBeenCalledWith(storageKey, subscribedCallback)
    })

    it('handles multiple mount/unmount cycles', () => {
      vi.mocked(GlobalStorage.get).mockReturnValue('value')

      const { unmount: unmount1 } = renderHook(() => useStorage(storageKey, 'default'))
      const { unmount: unmount2 } = renderHook(() => useStorage(storageKey, 'default'))

      unmount1()
      unmount2()

      expect(GlobalStorage.unsubscribe).toHaveBeenCalledTimes(2)
    })

    it('updates subscription when both key and initial value change', () => {
      vi.mocked(GlobalStorage.get).mockImplementation((key) => {
        if (key === 'key1') return 'value1'
        if (key === 'key2') return 'value2'
        return undefined
      })

      const { result, rerender } = renderHook(({ key, initial }) => useStorage(key, initial), {
        initialProps: { key: 'key1', initial: 'default1' },
      })

      expect(result.current[0]).toBe('value1')

      rerender({ key: 'key2', initial: 'default2' })

      expect(GlobalStorage.subscribe).toHaveBeenCalledWith('key2', expect.any(Function))
      expect(GlobalStorage.unsubscribe).toHaveBeenCalledWith('key1', expect.any(Function))
    })
  })
})
