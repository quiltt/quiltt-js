import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryStorage } from '@/storage/Memory'

describe('MemoryStorage', () => {
  let storage: MemoryStorage<any>

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  it('should return undefined for unset keys', () => {
    expect(storage.get('unknown')).toBeUndefined()
  })

  it('should set and get values correctly', () => {
    const testKey = 'test'
    const testValue = { a: 1 }
    storage.set(testKey, testValue)
    expect(storage.get(testKey)).toEqual(testValue)
  })

  it('should allow subscribing to and receiving updates', () => {
    const testKey = 'test'
    const initialValue = { a: 1 }
    const updatedValue = { a: 2 }
    const observer = vi.fn()

    storage.set(testKey, initialValue)
    storage.subscribe(testKey, observer)

    // Trigger an update
    storage.set(testKey, updatedValue)

    expect(observer).toHaveBeenCalledWith(updatedValue)
  })

  it('should not notify unsubscribed observers', () => {
    const testKey = 'test'
    const initialValue = { a: 1 }
    const updatedValue = { a: 2 }
    const observer = vi.fn()

    storage.set(testKey, initialValue)
    storage.subscribe(testKey, observer)
    storage.unsubscribe(testKey, observer)

    // Attempt to trigger an update
    storage.set(testKey, updatedValue)

    expect(observer).not.toHaveBeenCalled()
  })
})
