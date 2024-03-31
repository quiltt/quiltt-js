import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSession } from '@/hooks'
import * as QuilttCoreModule from '@quiltt/core'
import * as useStorageModule from '@/hooks/useStorage'
import type { PrivateClaims, JsonWebToken } from '@quiltt/core'

type Session = JsonWebToken<PrivateClaims> | null

// Mocking the JsonWebTokenParse and Timeoutable from @quiltt/core
vi.mock('@quiltt/core', () => ({
  JsonWebTokenParse: vi.fn(),
  Timeoutable: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    clear: vi.fn(),
  })),
}))

// Mocking useStorage hook
vi.mock('./useStorage', () => ({
  useStorage: vi.fn(),
}))

describe('useSession', () => {
  const mockToken = 'mock.token.value'
  const mockParsedToken: Session = {
    token: mockToken,
    claims: {
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'issuer',
      sub: 'subject',
      aud: '',
      nbf: 1,
      iat: Date.now(),
      jti: '',
      oid: '',
      cid: '',
      eid: '',
      aid: '',
      ver: 1,
    }, // 1 hour from now
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()

    vi.spyOn(QuilttCoreModule, 'JsonWebTokenParse').mockImplementation(() => mockParsedToken)

    vi.spyOn(useStorageModule, 'useStorage').mockImplementation(() => [mockToken, vi.fn()])
  })

  it('initializes with undefined session if no token is stored', async () => {
    const { result } = renderHook(() => useSession())
    expect(result.current[0]).toBeUndefined()
  })

  it('clears the session upon expiration', async () => {
    // Simulate a token that will expire immediately
    const expiringToken = {
      ...mockParsedToken,
      claims: { ...mockParsedToken.claims, exp: Math.floor(Date.now() / 1000) - 1 }, // 1 second in the past
    }
    vi.spyOn(QuilttCoreModule, 'JsonWebTokenParse').mockImplementation(() => expiringToken)

    const { result } = renderHook(() => useSession())
    expect(result.current[0]).toBeUndefined() // Assuming the hook clears the expired token immediately
  })

  // TODO: Add more tests as necessary, such as for setting a new session, handling invalid tokens, etc.
})
