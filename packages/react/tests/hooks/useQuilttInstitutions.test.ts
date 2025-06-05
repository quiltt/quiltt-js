import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useQuilttInstitutions } from '@/hooks/useQuilttInstitutions'

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
  InstitutionsAPI: vi.fn().mockImplementation(() => ({
    // Mock methods as needed
  })),
}))

describe('useQuilttInstitutions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty search results if no search term is provided', () => {
    const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

    expect(result.current.searchResults).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })
})
