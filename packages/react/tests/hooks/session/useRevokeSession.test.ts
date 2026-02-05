import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import type { AuthAPI, QuilttJWT } from '@quiltt/core'

import { useRevokeSession } from '@/hooks/session/useRevokeSession'
import type { SetSession } from '@/hooks/useSession'

// Helper to create mock AuthAPI
const createMockAuthAPI = () => ({
  authenticate: vi.fn(),
  ping: vi.fn(),
  identify: vi.fn(),
  revoke: vi.fn(),
  clientId: 'test-client-id',
})

// Helper to create test JWT
const createTestJWT = (overrides?: Partial<QuilttJWT>): QuilttJWT => ({
  token: 'test.jwt.token',
  claims: {
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
    iss: 'issuer',
    sub: 'subject',
    aud: 'audience',
    jti: 'jwt-id',
    rol: 'manager',
    cid: 'client-id',
    oid: 'org-id',
    eid: 'environment-id',
    aid: 'app-id',
    ver: 1,
  },
  ...overrides,
})

describe('useRevokeSession', () => {
  let mockAuth: ReturnType<typeof createMockAuthAPI>
  let mockSetSession: SetSession

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth = createMockAuthAPI()
    mockSetSession = vi.fn() as SetSession
  })

  describe('with active session', () => {
    it('revokes session and clears local state', async () => {
      const testSession = createTestJWT()
      mockAuth.revoke.mockResolvedValue({ status: 204, data: {} })

      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, testSession, mockSetSession)
      )

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).toHaveBeenCalledWith(testSession.token)
      expect(mockSetSession).toHaveBeenCalledWith(null)
    })

    it('clears session even when API call fails', async () => {
      const testSession = createTestJWT()
      mockAuth.revoke.mockResolvedValue({ status: 401, data: {} })

      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, testSession, mockSetSession)
      )

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).toHaveBeenCalledWith(testSession.token)
      expect(mockSetSession).toHaveBeenCalledWith(null)
    })

    it('handles API errors gracefully', async () => {
      const testSession = createTestJWT()
      mockAuth.revoke.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, testSession, mockSetSession)
      )

      await expect(
        act(async () => {
          await result.current()
        })
      ).rejects.toThrow('Network error')

      // Session should still be cleared despite the error
      expect(mockAuth.revoke).toHaveBeenCalledWith(testSession.token)
    })
  })

  describe('with no active session', () => {
    it('does nothing when session is undefined', async () => {
      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, undefined, mockSetSession)
      )

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).not.toHaveBeenCalled()
      expect(mockSetSession).not.toHaveBeenCalled()
    })

    it('does nothing when session is null', async () => {
      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, null, mockSetSession)
      )

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).not.toHaveBeenCalled()
      expect(mockSetSession).not.toHaveBeenCalled()
    })
  })

  describe('memoization', () => {
    it('returns stable function reference when dependencies do not change', () => {
      const testSession = createTestJWT()

      const { result, rerender } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, testSession, mockSetSession)
      )

      const firstReference = result.current

      rerender()

      expect(result.current).toBe(firstReference)
    })

    it('returns new function reference when auth changes', () => {
      const testSession = createTestJWT()

      const { result, rerender } = renderHook(
        ({ auth }) => useRevokeSession(auth as unknown as AuthAPI, testSession, mockSetSession),
        { initialProps: { auth: mockAuth } }
      )

      const firstReference = result.current

      const newMockAuth = createMockAuthAPI()
      rerender({ auth: newMockAuth })

      expect(result.current).not.toBe(firstReference)
    })

    it('returns new function reference when session changes', () => {
      const session1 = createTestJWT({ token: 'token1' })
      const session2 = createTestJWT({ token: 'token2' })

      const { result, rerender } = renderHook(
        ({ session }) => useRevokeSession(mockAuth as unknown as AuthAPI, session, mockSetSession),
        { initialProps: { session: session1 } }
      )

      const firstReference = result.current

      rerender({ session: session2 })

      expect(result.current).not.toBe(firstReference)
    })

    it('returns new function reference when setSession changes', () => {
      const testSession = createTestJWT()

      const { result, rerender } = renderHook(
        ({ setSession }) =>
          useRevokeSession(mockAuth as unknown as AuthAPI, testSession, setSession),
        { initialProps: { setSession: mockSetSession } }
      )

      const firstReference = result.current

      const newSetSession = vi.fn()
      rerender({ setSession: newSetSession })

      expect(result.current).not.toBe(firstReference)
    })
  })

  describe('multiple revocations', () => {
    it('handles multiple calls correctly when session changes', async () => {
      const testSession = createTestJWT()
      mockAuth.revoke.mockResolvedValue({ status: 204, data: {} })

      const { result, rerender } = renderHook(
        ({ session }: { session: QuilttJWT | undefined }) =>
          useRevokeSession(mockAuth as unknown as AuthAPI, session, mockSetSession),
        { initialProps: { session: testSession as QuilttJWT | undefined } }
      )

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).toHaveBeenCalledTimes(1)
      expect(mockSetSession).toHaveBeenCalledWith(null)

      // Update to undefined session (simulating what would happen after setSession(null))
      rerender({ session: undefined })

      // Second call should not do anything since session is now undefined
      await act(async () => {
        await result.current()
      })

      // Still only called once since session is now undefined
      expect(mockAuth.revoke).toHaveBeenCalledTimes(1)
      expect(mockSetSession).toHaveBeenCalledTimes(1)
    })

    it('can revoke a new session after previous revocation', async () => {
      const session1 = createTestJWT({ token: 'token1' })
      const session2 = createTestJWT({ token: 'token2' })

      mockAuth.revoke.mockResolvedValue({ status: 204, data: {} })

      const { result, rerender } = renderHook(
        ({ session }) => useRevokeSession(mockAuth as unknown as AuthAPI, session, mockSetSession),
        { initialProps: { session: session1 } }
      )

      // Revoke first session
      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).toHaveBeenCalledWith(session1.token)
      expect(mockSetSession).toHaveBeenCalledWith(null)

      // Update to new session
      rerender({ session: session2 })

      // Revoke second session
      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).toHaveBeenCalledWith(session2.token)
      expect(mockSetSession).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('handles transition from session to undefined', async () => {
      const testSession = createTestJWT()

      const { result, rerender } = renderHook(
        ({ session }: { session: QuilttJWT | undefined }) =>
          useRevokeSession(mockAuth as unknown as AuthAPI, session, mockSetSession),
        { initialProps: { session: testSession as QuilttJWT | undefined } }
      )

      // Change to undefined session before revoking
      rerender({ session: undefined })

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).not.toHaveBeenCalled()
      expect(mockSetSession).not.toHaveBeenCalled()
    })

    it('handles transition from session to null', async () => {
      const testSession = createTestJWT()

      const { result, rerender } = renderHook(
        ({ session }: { session: QuilttJWT | null }) =>
          useRevokeSession(mockAuth as unknown as AuthAPI, session, mockSetSession),
        { initialProps: { session: testSession as QuilttJWT | null } }
      )

      // Change to null session before revoking
      rerender({ session: null })

      await act(async () => {
        await result.current()
      })

      expect(mockAuth.revoke).not.toHaveBeenCalled()
      expect(mockSetSession).not.toHaveBeenCalled()
    })

    it('uses current session at time of revocation', async () => {
      const session1 = createTestJWT({ token: 'token1' })
      const session2 = createTestJWT({ token: 'token2' })

      mockAuth.revoke.mockResolvedValue({ status: 204, data: {} })

      const { result, rerender } = renderHook(
        ({ session }) => useRevokeSession(mockAuth as unknown as AuthAPI, session, mockSetSession),
        { initialProps: { session: session1 } }
      )

      // Change session before revoking
      rerender({ session: session2 })

      await act(async () => {
        await result.current()
      })

      // Should revoke the current session (session2), not the initial one
      expect(mockAuth.revoke).toHaveBeenCalledWith(session2.token)
      expect(mockSetSession).toHaveBeenCalledWith(null)
    })
  })

  describe('return value', () => {
    it('returns void/undefined', async () => {
      const testSession = createTestJWT()
      mockAuth.revoke.mockResolvedValue({ status: 204, data: {} })

      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, testSession, mockSetSession)
      )

      const returnValue = await act(async () => {
        return await result.current()
      })

      expect(returnValue).toBeUndefined()
    })

    it('returns void when no session exists', async () => {
      const { result } = renderHook(() =>
        useRevokeSession(mockAuth as unknown as AuthAPI, undefined, mockSetSession)
      )

      const returnValue = await act(async () => {
        return await result.current()
      })

      expect(returnValue).toBeUndefined()
    })
  })
})
