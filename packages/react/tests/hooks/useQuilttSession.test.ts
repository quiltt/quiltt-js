import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useQuilttSession } from '@/hooks'
import { useSession } from '@/hooks/useSession'

// Mock dependencies
vi.mock('@/hooks/useQuilttSettings', () => ({
  useQuilttSettings: vi.fn().mockReturnValue({ clientId: 'test-client-id' }),
}))

// Correcting useSession mock to align with the test expectations
vi.mock('@/hooks/useSession', () => ({
  useSession: vi.fn().mockReturnValue([null, vi.fn()]), // Assume session is null initially
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
  it('initializes correctly', async () => {
    const { result } = renderHook(() => useQuilttSession())
    expect(result.current.session).toBeNull() // Assuming the initial state is null based on the mock
  })

  it('forgets session correctly when token matches', async () => {
    // Setup a specific session state for this test
    const mockSetSession = vi.fn()
    // @ts-expect-error
    vi.mocked(useSession).mockReturnValue([{ token: 'test-token', claims: {} }, mockSetSession])

    const { result } = renderHook(() => useQuilttSession())

    await act(async () => {
      await result.current.forgetSession('test-token')
    })

    expect(mockSetSession).toHaveBeenCalledWith(null)
  })

  // Additional test cases can be implemented here
})
