import { createApp } from 'vue'

import { describe, expect, it } from 'vitest'

import { GlobalStorage } from '@quiltt/core'

import { useStorage } from '@/composables/use-storage'

const mountComposable = <T>(factory: () => T) => {
  let result!: T
  const root = document.createElement('div')
  document.body.appendChild(root)

  const app = createApp({
    setup() {
      result = factory()
      return () => null
    },
  })

  app.mount(root)

  return {
    result,
    unmount: () => {
      app.unmount()
      root.remove()
    },
  }
}

describe('useStorage', () => {
  it('initializes from GlobalStorage and updates via setStorage', () => {
    GlobalStorage.set('test:key', 'initial')

    const { result, unmount } = mountComposable(() => useStorage<string>('test:key'))

    expect(result.storage.value).toBe('initial')

    result.setStorage('next')

    expect(result.storage.value).toBe('next')
    expect(GlobalStorage.get('test:key')).toBe('next')

    unmount()
  })

  it('handles missing-key null state and supports updater fn', () => {
    const missingKey = `test:missing:${Date.now()}:${Math.random()}`

    const { result, unmount } = mountComposable(() => useStorage<number>(missingKey, 10))

    expect(result.storage.value).toBeNull()

    result.setStorage((previous) => (previous ?? 0) + 5)
    expect(result.storage.value).toBe(5)
    expect(GlobalStorage.get(missingKey)).toBe(5)

    unmount()
  })
})
