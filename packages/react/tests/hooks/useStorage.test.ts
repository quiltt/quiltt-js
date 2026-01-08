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
})
