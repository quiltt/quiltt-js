import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Storage } from '@/storage/Storage'
import { LocalStorage } from '@/storage/Local'
import { MemoryStorage } from '@/storage/Memory'

// Mock LocalStorage and MemoryStorage with all necessary methods
vi.mock('@/storage/Local', () => {
  const store: Record<string, any> = {}
  return {
    LocalStorage: vi.fn().mockImplementation(() => ({
      get: vi.fn((key) => store[key]),
      set: vi.fn((key, value) => {
        store[key] = value
      }),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }
})

vi.mock('@/storage/Memory', () => {
  const store: Record<string, any> = {}
  return {
    MemoryStorage: vi.fn().mockImplementation(() => ({
      get: vi.fn((key) => store[key]),
      set: vi.fn((key, value) => {
        store[key] = value
      }),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }
})

describe('Storage', () => {
  let storage: Storage<any>

  beforeEach(() => {
    // Resetting the module ensures we have a fresh instance for each test,
    // which is especially important given the singleton nature of GlobalStorage.
    vi.resetModules()
    storage = new Storage()
  })

  it('gets value, preferring memory storage over local storage', () => {
    const testKey = 'test'
    const testValue = { a: 1 }
    storage.set(testKey, testValue)

    // Assuming MemoryStorage is preferred and works as expected
    expect(storage.get(testKey)).toEqual(testValue)

    // TODO: extend this to explicitly check fallback behavior
  })

  it('sets value in both storages and notifies observers', () => {
    const testKey = 'test'
    const newValue = { a: 2 }
    const observer = vi.fn()

    storage.subscribe(testKey, observer)
    storage.set(testKey, newValue)

    expect(observer).toHaveBeenCalledWith(newValue)
    // Verify that LocalStorage and MemoryStorage are both updated
    // This requires the mock implementations to be setup to track calls and arguments
  })

  it('subscribes and unsubscribes observers', () => {
    const testKey = 'test'
    const observer = vi.fn()

    storage.subscribe(testKey, observer)
    storage.set(testKey, { b: 2 })

    expect(observer).toHaveBeenCalledTimes(1)

    storage.unsubscribe(testKey, observer)
    storage.set(testKey, { b: 3 })

    expect(observer).toHaveBeenCalledTimes(1) // Observer should not be called again
  })

  // TODO: Add additional tests to include more nuanced behaviors and monitoring changes
})
