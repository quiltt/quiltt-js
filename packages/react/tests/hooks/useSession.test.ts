import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSession } from '@/hooks/useSession'
import { useStorage } from '@/hooks/useStorage'

// Mock the storage hook to control token state
vi.mock('@/hooks/useStorage', () => ({
  useStorage: vi.fn(),
}))

describe('useSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.spyOn(Date, 'now').mockRestore()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('initializes with undefined session if no token is stored', () => {
    vi.mocked(useStorage).mockReturnValue([undefined, vi.fn()])

    const { result } = renderHook(() => useSession())
    expect(result.current[0]).toBeUndefined()
  })

  it('clears the session upon expiration', async () => {
    const mockSetStorage = vi.fn()

    // Create an expired token payload
    const payload = {
      iss: 'test',
      sub: 'test',
      aud: 'test',
      exp: 1600000000, // Past timestamp
      nbf: 1600000000,
      iat: 1600000000,
      jti: 'test',
      oid: 'test',
      eid: 'test',
      cid: 'test',
      aid: 'test',
      ver: 1,
      rol: 'manager' as const,
    }

    // Construct JWT with header, payload, and signature
    const token = [
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
      btoa(JSON.stringify(payload)),
      'signature',
    ].join('.')

    // Mock current time to be after token expiration
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
    vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

    renderHook(() => useSession())

    // Allow effects and timers to process
    await act(async () => {
      await Promise.resolve()
      vi.runAllTimers()
    })

    expect(mockSetStorage).toHaveBeenCalledWith(null)
  })

  it('maintains session for valid token', () => {
    const setStorage = vi.fn()

    // Create timestamps for valid token
    const currentTime = 1700000000
    const expirationTime = currentTime + 3600 // 1 hour in future

    // Create URL-safe base64 encoded JWT parts
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const payload = btoa(
      JSON.stringify({
        exp: expirationTime,
        iat: currentTime,
        iss: 'issuer',
        sub: 'subject',
        rol: 'manager',
        nbf: currentTime,
        aud: 'audience',
        jti: 'token-id',
        cid: 'client-id',
        oid: 'org-id',
        eid: 'entity-id',
        aid: 'app-id',
        ver: 1,
      })
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const token = `${header}.${payload}.valid-signature`

    // Set current time to be before token expiration
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
    vi.mocked(useStorage).mockReturnValue([token, setStorage])

    const { result } = renderHook(() => useSession())

    expect(result.current[0]).toBeDefined()
    expect(setStorage).not.toHaveBeenCalled()
  })
})
