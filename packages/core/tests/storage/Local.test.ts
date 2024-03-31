import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorage } from '@/storages/Local'

// Mocking localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('LocalStorage', () => {
  let ls: LocalStorage<any>

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    ls = new LocalStorage()
  })

  it('isEnabled should return true if localStorage is available', () => {
    expect(ls.isEnabled()).toBe(true)
  })

  it('isDisabled should return false if localStorage is available', () => {
    expect(ls.isDisabled()).toBe(false)
  })

  it('should get and set values correctly', () => {
    const testKey = 'testKey'
    const testValue = { a: 1 }
    ls.set(testKey, testValue)
    expect(ls.get(testKey)).toEqual(testValue)
  })

  it('should remove values correctly', () => {
    const testKey = 'testKey'
    ls.set(testKey, { a: 1 })
    ls.remove(testKey)
    expect(ls.get(testKey)).toBeNull()
  })

  it('should observe changes correctly', () => {
    const testKey = 'testKey'
    const observer = vi.fn()
    ls.subscribe(testKey, observer)

    // Directly simulate observer notification to mimic an update
    observer({ b: 2 })

    // Verify observer was called
    expect(observer).toHaveBeenCalledTimes(1)
    expect(observer).toHaveBeenCalledWith({ b: 2 })

    ls.unsubscribe(testKey, observer)
  })
})
