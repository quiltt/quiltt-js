import { createApp, ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useQuilttSettings } from '@/composables/use-quiltt-settings'
import { QuilttClientIdKey } from '@/plugin/keys'

const mountComposable = <T>(factory: () => T, provide?: Array<[symbol, unknown]>) => {
  let result!: T
  const root = document.createElement('div')
  document.body.appendChild(root)

  const app = createApp({
    setup() {
      result = factory()
      return () => null
    },
  })

  provide?.forEach(([key, value]) => {
    app.provide(key, value)
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

describe('useQuilttSettings', () => {
  it('reads clientId from injected plugin state', () => {
    const { result, unmount } = mountComposable(
      () => useQuilttSettings(),
      [[QuilttClientIdKey as unknown as symbol, ref('cid_test')]]
    )

    expect(result.clientId.value).toBe('cid_test')

    unmount()
  })
})
