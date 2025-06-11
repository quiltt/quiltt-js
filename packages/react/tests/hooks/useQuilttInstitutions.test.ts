import { renderHook, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { QuilttJWT } from '@quiltt/core'

import { useQuilttInstitutions } from '@/hooks/useQuilttInstitutions'

vi.mock('@/hooks/useQuilttSettings', () => ({
  useQuilttSettings: vi.fn().mockReturnValue({ clientId: 'test-client-id' }),
}))

vi.mock('@/hooks/useSession', () => ({
  default: vi.fn(),
}))

vi.mock('@/hooks/session', () => ({
  useImportSession: vi.fn(),
  useIdentifySession: vi.fn(),
  useAuthenticateSession: vi.fn(),
  useRevokeSession: vi.fn(),
}))

const mockSearch = vi.fn()
vi.mock('@quiltt/core', () => ({
  InstitutionsAPI: vi.fn().mockImplementation(() => ({
    search: mockSearch,
  })),
}))

vi.mock('use-debounce', () => ({
  useDebounce: vi.fn((value) => [value]),
}))

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('useQuilttInstitutions', async () => {
  const { default: useSession } = await import('@/hooks/useSession')
  const mockUseSession = vi.mocked(useSession)

  const mockSession = {
    token: 'mock-token',
    claims: {
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  } as QuilttJWT

  beforeEach(() => {
    vi.clearAllMocks()
    mockConsoleError.mockClear()

    mockUseSession.mockReturnValue([mockSession, vi.fn()])
    mockSearch.mockResolvedValue({
      status: 200,
      data: [],
    })
  })

  it('initializes with empty search results if no search term is provided', () => {
    const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

    expect(result.current.searchResults).toEqual([])
    expect(result.current.isSearching).toBe(false)
    expect(result.current.searchTerm).toBe('')
  })

  describe('search term validation', () => {
    it('clears search results and stops searching when term is less than 2 characters', () => {
      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('a')
      })

      expect(result.current.searchResults).toEqual([])
      expect(result.current.isSearching).toBe(false)
    })

    it('clears search results when term is only whitespace', () => {
      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('   ')
      })

      expect(result.current.searchResults).toEqual([])
      expect(result.current.isSearching).toBe(false)
    })

    it('sets isSearching to true and updates search term when term is 2+ characters', () => {
      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('ab')
      })

      expect(result.current.isSearching).toBe(true)
      expect(result.current.searchTerm).toBe('ab')
    })

    it('preserves whitespace in valid search terms', () => {
      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('  ab  ')
      })

      expect(result.current.isSearching).toBe(true)
      expect(result.current.searchTerm).toBe('  ab  ')
    })
  })

  describe('error handling', () => {
    it('logs error to console and calls onErrorCallback when API returns non-200 status', async () => {
      const mockErrorCallback = vi.fn()
      mockSearch.mockResolvedValue({
        status: 400,
        data: { message: 'API Error' },
      })

      const { result } = renderHook(() =>
        useQuilttInstitutions('mockConnectorId', mockErrorCallback)
      )

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Quiltt Institutions Search Error:',
        'API Error'
      )
      expect(mockErrorCallback).toHaveBeenCalledWith('API Error')
    })

    it('uses default error message when no message provided', async () => {
      const mockErrorCallback = vi.fn()
      mockSearch.mockResolvedValue({
        status: 400,
        data: { message: '' },
      })

      const { result } = renderHook(() =>
        useQuilttInstitutions('mockConnectorId', mockErrorCallback)
      )

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Quiltt Institutions Search Error:',
        'Failed to fetch institutions'
      )
      expect(mockErrorCallback).toHaveBeenCalledWith('Failed to fetch institutions')
    })

    it('uses fallback error message when message is undefined', async () => {
      const mockErrorCallback = vi.fn()
      mockSearch.mockResolvedValue({
        status: 400,
        data: {},
      })

      const { result } = renderHook(() =>
        useQuilttInstitutions('mockConnectorId', mockErrorCallback)
      )

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Quiltt Institutions Search Error:',
        'Failed to fetch institutions'
      )
      expect(mockErrorCallback).toHaveBeenCalledWith('Failed to fetch institutions')
    })

    it('works without onErrorCallback', async () => {
      mockSearch.mockResolvedValue({
        status: 400,
        data: { message: 'API Error' },
      })

      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId'))

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Quiltt Institutions Search Error:',
        'API Error'
      )
    })

    it('handles network errors thrown by search method', async () => {
      const mockErrorCallback = vi.fn()
      const mockError = new Error('Network error')
      mockSearch.mockRejectedValue(mockError)

      const { result } = renderHook(() =>
        useQuilttInstitutions('mockConnectorId', mockErrorCallback)
      )

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(mockErrorCallback).toHaveBeenCalledWith('Network error')
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Quiltt Institutions Search Error:',
        'Network error'
      )
    })

    /**
     * Tests abort controller behavior when search terms change rapidly
     * Ensures previous requests are cancelled to prevent race conditions
     */
    it('ignores errors from aborted requests', async () => {
      const mockErrorCallback = vi.fn()

      mockSearch.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ status: 200, data: [] })
          }, 1000)
        })
      })

      const { result } = renderHook(() =>
        useQuilttInstitutions('mockConnectorId', mockErrorCallback)
      )

      act(() => {
        result.current.setSearchTerm('test')
      })

      act(() => {
        result.current.setSearchTerm('testing')
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledTimes(2)
      })

      expect(mockErrorCallback).not.toHaveBeenCalled()
      expect(result.current.isSearching).toBe(true)
    })
  })

  describe('API integration', () => {
    it('sets search results when API returns success', async () => {
      const mockInstitutions = [{ id: '1', name: 'Test Bank' }]
      mockSearch.mockResolvedValue({
        status: 200,
        data: mockInstitutions,
      })

      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(result.current.searchResults).toEqual(mockInstitutions)
    })

    it('calls error handler when API returns non-200 status', async () => {
      const mockErrorCallback = vi.fn()
      mockSearch.mockResolvedValue({
        status: 400,
        data: { message: 'Bad Request' },
      })

      const { result } = renderHook(() =>
        useQuilttInstitutions('mockConnectorId', mockErrorCallback)
      )

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })

      expect(mockErrorCallback).toHaveBeenCalledWith('Bad Request')
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Quiltt Institutions Search Error:',
        'Bad Request'
      )
    })

    it('stops searching after API call completes', async () => {
      mockSearch.mockResolvedValue({
        status: 200,
        data: [],
      })

      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('test')
      })

      expect(result.current.isSearching).toBe(true)

      await waitFor(() => {
        expect(result.current.isSearching).toBe(false)
      })
    })

    /**
     * Verifies guard condition prevents API calls without valid session
     */
    it('does not make API call when session token is null', async () => {
      mockUseSession.mockReturnValue([null, vi.fn()])

      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('test')
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockSearch).not.toHaveBeenCalled()
      expect(result.current.isSearching).toBe(true)
    })

    /**
     * Verifies guard condition prevents API calls without valid connector
     */
    it('does not make API call when connectorId is empty', async () => {
      const { result } = renderHook(() => useQuilttInstitutions('', vi.fn()))

      act(() => {
        result.current.setSearchTerm('test')
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockSearch).not.toHaveBeenCalled()
    })

    it('makes API call with correct parameters when conditions are met', async () => {
      const { result } = renderHook(() => useQuilttInstitutions('mockConnectorId', vi.fn()))

      act(() => {
        result.current.setSearchTerm('test')
      })

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith(
          'mock-token',
          'mockConnectorId',
          'test',
          expect.any(AbortSignal)
        )
      })
    })
  })
})
