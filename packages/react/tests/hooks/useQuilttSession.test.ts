import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { QuilttJWT } from '@quiltt/core'

import { useQuilttSession } from '@/hooks/useQuilttSession'
import { useSession } from '@/hooks/useSession'

// Mock dependencies
vi.mock('@/hooks/useQuilttSettings', () => ({
  useQuilttSettings: vi.fn().mockReturnValue({ clientId: 'test-client-id' }),
}))

vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn(),
}))

vi.mock('@/hooks/session', () => ({
  useImportSession: vi.fn(),
  useIdentifySession: vi.fn(),
  useAuthenticateSession: vi.fn(),
  useRevokeSession: vi.fn(),
}))

vi.mock('@quiltt/core', () => ({
  AuthAPI: vi.fn().mockImplementation(() => ({
    // Mock methods as needed
  })),
}))

describe('useQuilttSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with undefined session if no token is stored', () => {
    const mockSetSession = vi.fn()
    const mockSession: QuilttJWT | undefined = undefined
    vi.mocked(useSession).mockReturnValue([mockSession, mockSetSession])

    const { result } = renderHook(() => useQuilttSession())
    expect(result.current.session).toBeUndefined()
  })

  it('clears the session upon expiration', async () => {
    const mockSetSession = vi.fn()
    const expiredSession: QuilttJWT = {
      token: 'mock.token.value',
      claims: {
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        iat: Date.now(),
        nbf: 1,
        iss: 'issuer',
        sub: 'subject',
        aud: '',
        jti: '',
        rol: 'manager',
        cid: '',
        oid: '',
        eid: '',
        aid: '',
        ver: 1,
      },
    }

    // First return the expired session, then undefined after clearing
    vi.mocked(useSession).mockReturnValue([expiredSession, mockSetSession])

    const { result } = renderHook(() => useQuilttSession())

    // Initially the expired session is returned
    expect(result.current.session).toEqual(expiredSession)

    // When trying to forget the session
    await act(async () => {
      await result.current.forgetSession(expiredSession.token)
    })

    // Verify setSession was called with null
    expect(mockSetSession).toHaveBeenCalledWith(null)
  })
})
