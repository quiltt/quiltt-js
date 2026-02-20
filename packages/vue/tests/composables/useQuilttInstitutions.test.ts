import { createApp, ref } from 'vue'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  searchInstitutionsMock: vi.fn(),
}))

vi.mock('@quiltt/core', async () => {
  const actual = await vi.importActual<typeof import('@quiltt/core')>('@quiltt/core')

  class MockConnectorsAPI {
    searchInstitutions = mocks.searchInstitutionsMock
  }

  return {
    ...actual,
    ConnectorsAPI: MockConnectorsAPI,
  }
})

const sessionRef = ref<{ token?: string } | null>({ token: 'session_token' })

vi.mock('@/composables/useQuilttSession', () => ({
  useQuilttSession: () => ({
    session: sessionRef,
  }),
}))

import { useQuilttInstitutions } from '@/composables/useQuilttInstitutions'

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

describe('useQuilttInstitutions', () => {
  afterEach(() => {
    vi.useRealTimers()
    mocks.searchInstitutionsMock.mockReset()
  })

  it('searches institutions after debounce and updates results', async () => {
    vi.useFakeTimers()

    mocks.searchInstitutionsMock.mockResolvedValue({
      status: 200,
      data: [{ id: 'inst_1', name: 'Demo Bank' }],
    } as any)

    const { result, unmount } = mountComposable(() => useQuilttInstitutions('connector_test'))

    result.setSearchTerm('de')

    vi.advanceTimersByTime(350)
    await Promise.resolve()
    await Promise.resolve()

    expect(result.searchTerm.value).toBe('de')
    expect(result.isSearching.value).toBe(false)
    expect(result.searchResults.value).toEqual([{ id: 'inst_1', name: 'Demo Bank' }])

    unmount()
  })

  it('resets state for short search terms', () => {
    const { result, unmount } = mountComposable(() => useQuilttInstitutions('connector_test'))

    result.setSearchTerm('a')

    expect(result.searchTerm.value).toBe('')
    expect(result.searchResults.value).toEqual([])
    expect(result.isSearching.value).toBe(false)

    unmount()
  })

  it('handles non-200 and thrown API errors', async () => {
    vi.useFakeTimers()
    const onError = vi.fn()

    mocks.searchInstitutionsMock.mockResolvedValueOnce({
      status: 500,
      data: { message: 'request failed' },
    } as any)

    const { result, unmount } = mountComposable(() =>
      useQuilttInstitutions('connector_test', onError)
    )

    result.setSearchTerm('de')
    vi.advanceTimersByTime(350)
    await Promise.resolve()
    await Promise.resolve()

    expect(onError).toHaveBeenCalledWith('request failed')
    expect(result.isSearching.value).toBe(false)

    mocks.searchInstitutionsMock.mockRejectedValueOnce(new Error('network down'))

    result.setSearchTerm('bank')
    vi.advanceTimersByTime(350)
    await Promise.resolve()
    await Promise.resolve()

    expect(onError).toHaveBeenCalledWith('network down')
    expect(result.isSearching.value).toBe(false)

    unmount()
  })
})
