import { afterEach, beforeEach, describe, it, vi } from 'vitest'

vi.mock('@/api/rest/fetchWithRetry', () => ({
  fetchWithRetry: vi.fn(),
}))

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should fetch', async () => {
    // TODO: Figure out how to mock fetch in a way that works with fetchWithRetry, then write tests
  })
})
