import { createApp, ref } from 'vue'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  checkResolvableMock: vi.fn(),
}))

vi.mock('@quiltt/core', async () => {
  const actual = await vi.importActual<typeof import('@quiltt/core')>('@quiltt/core')

  class MockConnectorsAPI {
    checkResolvable = mocks.checkResolvableMock
  }

  return {
    ...actual,
    ConnectorsAPI: MockConnectorsAPI,
  }
})

const sessionRef = ref<{ token?: string } | null>({ token: 'session_token' })

vi.mock('@/composables/use-quiltt-session', () => ({
  useQuilttSession: () => ({
    session: sessionRef,
  }),
}))

import { useQuilttResolvable } from '@/composables/use-quiltt-resolvable'

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

describe('useQuilttResolvable', () => {
  afterEach(() => {
    mocks.checkResolvableMock.mockReset()
  })

  it('checks resolvability and updates state', async () => {
    mocks.checkResolvableMock.mockResolvedValue({
      status: 200,
      data: { resolvable: true },
    } as any)

    const { result, unmount } = mountComposable(() => useQuilttResolvable('connector_test'))

    const response = await result.checkResolvable({ plaid: 'plaid_provider_id' })

    expect(response).toBe(true)
    expect(result.isLoading.value).toBe(false)
    expect(result.isResolvable.value).toBe(true)
    expect(result.error.value).toBeNull()

    unmount()
  })

  it('returns null with guard errors before API call', async () => {
    const onError = vi.fn()

    sessionRef.value = null
    const { result, unmount } = mountComposable(() =>
      useQuilttResolvable('connector_test', onError)
    )

    expect(await result.checkResolvable({ plaid: 'provider' })).toBeNull()
    expect(onError).toHaveBeenCalledWith('Missing session token')

    sessionRef.value = { token: 'session_token' }
    expect(await result.checkResolvable({})).toBeNull()
    expect(onError).toHaveBeenCalledWith('No provider ID specified')

    unmount()
  })

  it('handles non-200 and rejected API responses', async () => {
    const onError = vi.fn()
    const { result, unmount } = mountComposable(() =>
      useQuilttResolvable('connector_test', onError)
    )

    mocks.checkResolvableMock.mockResolvedValueOnce({
      status: 422,
      data: { message: 'unprocessable' },
    } as any)

    expect(await result.checkResolvable({ plaid: 'provider' })).toBeNull()
    expect(result.isResolvable.value).toBeNull()
    expect(onError).toHaveBeenCalledWith('unprocessable')

    mocks.checkResolvableMock.mockRejectedValueOnce(new Error('network failure'))
    expect(await result.checkResolvable({ plaid: 'provider' })).toBeNull()
    expect(onError).toHaveBeenCalledWith('network failure')
    expect(result.isLoading.value).toBe(false)

    unmount()
  })
})
