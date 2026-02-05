import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useSession } from '@/hooks/useSession'
import { useStorage } from '@/hooks/useStorage'

// Mock the storage hook to control token state
vi.mock('@/hooks/useStorage', () => ({
  useStorage: vi.fn(),
}))

// Helper function to create test JWT tokens
function createTestToken(
  claims: {
    exp?: number
    iat?: number
    iss?: string
    sub?: string
    rol?: 'manager' | 'member'
    nbf?: number
    aud?: string
    jti?: string
    cid?: string
    oid?: string
    eid?: string
    aid?: string
    ver?: number
  } = {}
): string {
  const currentTime = Math.floor(Date.now() / 1000)

  const defaultClaims = {
    exp: currentTime + 3600,
    iat: currentTime,
    iss: 'issuer',
    sub: 'subject',
    rol: 'manager' as const,
    nbf: currentTime,
    aud: 'audience',
    jti: 'token-id',
    cid: 'client-id',
    oid: 'org-id',
    eid: 'entity-id',
    aid: 'app-id',
    ver: 1,
    ...claims,
  }

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const payload = btoa(JSON.stringify(defaultClaims))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${header}.${payload}.signature`
}

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

    const token = createTestToken({
      exp: expirationTime,
      iat: currentTime,
    })

    // Set current time to be before token expiration
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
    vi.mocked(useStorage).mockReturnValue([token, setStorage])

    const { result } = renderHook(() => useSession())

    expect(result.current[0]).toBeDefined()
    expect(setStorage).not.toHaveBeenCalled()
  })

  describe('setSession functionality', () => {
    it('accepts and validates a new valid token', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      const { result } = renderHook(() => useSession())

      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)

      const validToken = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      act(() => {
        result.current[1](validToken)
      })

      expect(mockSetStorage).toHaveBeenCalledWith(validToken)
    })

    it('rejects invalid token format', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1]('invalid-token')
      })

      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('rejects malformed JWT (missing parts)', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1]('header.payload') // Missing signature
      })

      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('rejects JWT with invalid base64', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1]('!!!invalid!!!.!!!invalid!!!.signature')
      })

      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('accepts null to clear session', () => {
      const mockSetStorage = vi.fn()
      const currentToken = 'header.payload.signature'
      vi.mocked(useStorage).mockReturnValue([currentToken, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1](null)
      })

      expect(mockSetStorage).toHaveBeenCalledWith(null)
    })

    it('accepts undefined to clear session', () => {
      const mockSetStorage = vi.fn()
      const currentToken = 'header.payload.signature'
      vi.mocked(useStorage).mockReturnValue([currentToken, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1](undefined)
      })

      expect(mockSetStorage).toHaveBeenCalledWith(undefined)
    })

    it('handles updater function with valid token', () => {
      const mockSetStorage = vi.fn()
      const oldToken = 'old.token.signature'
      vi.mocked(useStorage).mockReturnValue([oldToken, mockSetStorage])

      const { result } = renderHook(() => useSession())

      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)

      const newToken = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      act(() => {
        result.current[1]((_prev) => newToken)
      })

      expect(mockSetStorage).toHaveBeenCalledWith(newToken)
    })

    it('handles updater function returning null', () => {
      const mockSetStorage = vi.fn()
      const currentToken = 'current.token.signature'
      vi.mocked(useStorage).mockReturnValue([currentToken, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1]((_prev) => null)
      })

      expect(mockSetStorage).toHaveBeenCalledWith(null)
    })

    it('does not update when setting same token', () => {
      const mockSetStorage = vi.fn()
      const currentToken = 'current.token.signature'
      vi.mocked(useStorage).mockReturnValue([currentToken, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1](currentToken)
      })

      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('does not update when updater returns same token', () => {
      const mockSetStorage = vi.fn()
      const currentToken = 'current.token.signature'
      vi.mocked(useStorage).mockReturnValue([currentToken, mockSetStorage])

      const { result } = renderHook(() => useSession())

      act(() => {
        result.current[1]((prev) => prev)
      })

      expect(mockSetStorage).not.toHaveBeenCalled()
    })
  })

  describe('session parsing and claims', () => {
    it('correctly parses JWT claims', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const claims = {
        exp: expirationTime,
        iat: currentTime,
        iss: 'test-issuer',
        sub: 'test-subject',
        rol: 'manager' as const,
        nbf: currentTime,
        aud: 'test-audience',
        jti: 'test-jti',
        cid: 'test-client',
        oid: 'test-org',
        eid: 'test-entity',
        aid: 'test-app',
        ver: 1,
      }

      const token = createTestToken(claims)

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      const { result } = renderHook(() => useSession())

      expect(result.current[0]).toBeDefined()
      expect(result.current[0]?.claims).toEqual(claims)
    })

    it('returns undefined session for null token', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([null, mockSetStorage])

      const { result } = renderHook(() => useSession())

      expect(result.current[0]).toBeNull()
    })
  })

  describe('timer management', () => {
    it('schedules expiration timer for future token', async () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600 // 1 hour in future

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      renderHook(() => useSession())

      // Timer should be scheduled but not expired yet
      expect(mockSetStorage).not.toHaveBeenCalled()

      // Fast forward to expiration
      vi.spyOn(Date, 'now').mockImplementation(() => expirationTime * 1000)
      await act(async () => {
        vi.advanceTimersByTime(3600 * 1000)
      })

      // Session should be cleared
      expect(mockSetStorage).toHaveBeenCalledWith(null)
    })

    it('cleans up timer on unmount', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      const { unmount } = renderHook(() => useSession())

      unmount()

      // Advance time after unmount - timer should not fire
      vi.advanceTimersByTime(3600 * 1000)

      // Session should NOT be cleared because component unmounted
      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('updates timer when token changes', async () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000

      const token1 = createTestToken({ exp: currentTime + 1800, iat: currentTime }) // 30 min
      const token2 = createTestToken({ exp: currentTime + 7200, iat: currentTime }) // 2 hours

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token1, mockSetStorage])

      const { rerender } = renderHook(() => useSession())

      // Update to new token with different expiration
      vi.mocked(useStorage).mockReturnValue([token2, mockSetStorage])
      rerender()

      // Old timer should be cleared, new one should be set
      expect(mockSetStorage).not.toHaveBeenCalled()
    })
  })

  describe('custom storage key', () => {
    it('uses custom storage key when provided', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      renderHook(() => useSession('custom-session-key'))

      expect(useStorage).toHaveBeenCalledWith('custom-session-key')
    })

    it('uses default storage key when not provided', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      renderHook(() => useSession())

      expect(useStorage).toHaveBeenCalledWith('session')
    })
  })

  describe('visibility change handling', () => {
    let mockAddEventListener: ReturnType<typeof vi.fn>
    let mockRemoveEventListener: ReturnType<typeof vi.fn>
    let visibilityChangeHandler: ((event?: Event) => void) | null = null

    beforeEach(() => {
      mockAddEventListener = vi.fn((event, handler) => {
        if (event === 'visibilitychange') {
          visibilityChangeHandler = handler
        }
      })
      mockRemoveEventListener = vi.fn()

      Object.defineProperty(document, 'addEventListener', {
        value: mockAddEventListener,
        writable: true,
      })
      Object.defineProperty(document, 'removeEventListener', {
        value: mockRemoveEventListener,
        writable: true,
      })
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      visibilityChangeHandler = null
    })

    it('registers visibility change listener for valid token', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      renderHook(() => useSession())

      expect(mockAddEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    })

    it('clears expired token when tab becomes visible', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      renderHook(() => useSession())

      expect(visibilityChangeHandler).toBeDefined()

      // Simulate time passing and token expiring
      vi.spyOn(Date, 'now').mockImplementation(() => (expirationTime + 100) * 1000)

      // Simulate tab becoming visible
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
        configurable: true,
      })

      act(() => {
        visibilityChangeHandler?.()
      })

      expect(mockSetStorage).toHaveBeenCalledWith(null)
    })

    it('does not clear valid token when tab becomes visible', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      renderHook(() => useSession())

      expect(visibilityChangeHandler).toBeDefined()

      // Token is still valid
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
        configurable: true,
      })

      act(() => {
        visibilityChangeHandler?.()
      })

      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('does not check expiration when tab is hidden', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      renderHook(() => useSession())

      // Simulate time passing and token expiring
      vi.spyOn(Date, 'now').mockImplementation(() => (expirationTime + 100) * 1000)

      // Tab is hidden
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
        configurable: true,
      })

      act(() => {
        visibilityChangeHandler?.()
      })

      // Should not clear even though expired, because tab is hidden
      expect(mockSetStorage).not.toHaveBeenCalled()
    })

    it('removes visibility change listener on unmount', () => {
      const mockSetStorage = vi.fn()
      const currentTime = 1700000000
      const expirationTime = currentTime + 3600

      const token = createTestToken({
        exp: expirationTime,
        iat: currentTime,
      })

      vi.spyOn(Date, 'now').mockImplementation(() => currentTime * 1000)
      vi.mocked(useStorage).mockReturnValue([token, mockSetStorage])

      const { unmount } = renderHook(() => useSession())

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    })

    it('does not register listener when no session exists', () => {
      const mockSetStorage = vi.fn()
      vi.mocked(useStorage).mockReturnValue([undefined, mockSetStorage])

      renderHook(() => useSession())

      expect(mockAddEventListener).not.toHaveBeenCalled()
    })
  })
})
