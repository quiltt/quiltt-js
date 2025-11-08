import type { MockedFunction } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchWithRetry } from '@/api/rest/fetchWithRetry'
import { ConnectorsAPI } from '@/api/rest/connectors'

// Mock fetchWithRetry
vi.mock('@/api/rest/fetchWithRetry', () => ({
  fetchWithRetry: vi.fn(),
}))

// Mock configuration with complete exports to avoid import errors
vi.mock('@/configuration', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    endpointRest: 'https://api.quiltt.com',
    endpointGraphQL: 'https://api.quiltt.com/graphql', // Add missing export
  }
})

const mockFetchWithRetry = vi.mocked(fetchWithRetry) as MockedFunction<typeof fetchWithRetry>

describe('ConnectorsAPI', () => {
  let connectorsAPI: ConnectorsAPI

  beforeEach(() => {
    vi.clearAllMocks()
    connectorsAPI = new ConnectorsAPI('test-client-id', 'test-agent')
  })

  describe('constructor', () => {
    it('should initialize with clientId and default agent', () => {
      const api = new ConnectorsAPI('client-123')

      expect(api.clientId).toBe('client-123')
      expect(api.agent).toBe('web') // default value
    })

    it('should initialize with custom agent', () => {
      const api = new ConnectorsAPI('client-123', 'mobile')

      expect(api.clientId).toBe('client-123')
      expect(api.agent).toBe('mobile')
    })
  })

  describe('searchInstitutions method', () => {
    const mockToken = 'test-token-123'
    const mockConnectorId = 'connector-456'
    const mockTerm = 'Chase Bank'

    it('should make correct API call with all parameters', async () => {
      const mockResponse = {
        data: [
          { name: 'Chase Bank', logoUrl: 'https://example.com/chase.png' },
          { name: 'Chase Credit Union', logoUrl: 'https://example.com/chase-cu.png' },
        ],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.searchInstitutions(mockToken, mockConnectorId, mockTerm)

      // Verify the URL construction
      const expectedUrl =
        'https://api.quiltt.com/sdk/connectors/connector-456/institutions?term=Chase+Bank'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, {
        method: 'GET',
        signal: undefined,
        headers: expect.any(Headers),
        validateStatus: expect.any(Function),
        retry: true,
      })

      expect(result).toBe(mockResponse)
    })

    it('should include abort signal when provided', async () => {
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const abortController = new AbortController()
      await connectorsAPI.searchInstitutions(
        mockToken,
        mockConnectorId,
        mockTerm,
        abortController.signal,
      )

      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: abortController.signal,
        }),
      )
    })

    it('should properly encode URL parameters', async () => {
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const specialCharTerm = 'Bank & Trust Co.'
      const specialConnectorId = 'connector/with-slash'

      await connectorsAPI.searchInstitutions(mockToken, specialConnectorId, specialCharTerm)

      const expectedUrl =
        'https://api.quiltt.com/sdk/connectors/connector/with-slash/institutions?term=Bank+%26+Trust+Co.'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
    })

    it('should set correct headers in config', async () => {
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await connectorsAPI.searchInstitutions(mockToken, mockConnectorId, mockTerm)

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Content-Type')).toBe('application/json')
      expect(headers.get('Accept')).toBe('application/json')
      expect(headers.get('Quiltt-SDK-Agent')).toBe('test-agent')
      expect(headers.get('Authorization')).toBe('Bearer test-token-123')
    })

    it('should use custom agent in headers', async () => {
      const customAPI = new ConnectorsAPI('client-123', 'react-native')
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await customAPI.searchInstitutions(mockToken, mockConnectorId, mockTerm)

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Quiltt-SDK-Agent')).toBe('react-native')
    })
  })

  describe('validateStatus method', () => {
    it('should validate status codes correctly', () => {
      // Access private method for testing
      const validateStatus = (connectorsAPI as any).validateStatus

      // Should return true for status < 500 and not 429
      expect(validateStatus(200)).toBe(true)
      expect(validateStatus(201)).toBe(true)
      expect(validateStatus(400)).toBe(true)
      expect(validateStatus(401)).toBe(true)
      expect(validateStatus(404)).toBe(true)
      expect(validateStatus(499)).toBe(true)

      // Should return false for status >= 500 or 429
      expect(validateStatus(429)).toBe(false)
      expect(validateStatus(500)).toBe(false)
      expect(validateStatus(502)).toBe(false)
      expect(validateStatus(503)).toBe(false)
    })
  })

  describe('config method', () => {
    it('should create config with token', () => {
      const config = (connectorsAPI as any).config('test-token')

      expect(config.headers).toBeInstanceOf(Headers)
      expect(config.validateStatus).toBeInstanceOf(Function)
      expect(config.retry).toBe(true)

      const headers = config.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer test-token')
    })

    it('should create config without token', () => {
      const config = (connectorsAPI as any).config()

      const headers = config.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer undefined')
    })

    it('should create config with undefined token', () => {
      const config = (connectorsAPI as any).config(undefined)

      const headers = config.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer undefined')
    })
  })

  describe('error scenarios', () => {
    it('should handle 401 Unauthorized responses', async () => {
      const mockErrorResponse = {
        data: { message: 'Invalid token', instruction: 'Please provide a valid token' },
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        ok: false,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockErrorResponse)

      const result = await connectorsAPI.searchInstitutions('invalid-token', 'connector-123', 'Chase')

      expect(result.status).toBe(401)
      expect(result.data).toEqual({
        message: 'Invalid token',
        instruction: 'Please provide a valid token',
      })
    })

    it('should handle 400 Bad Request responses', async () => {
      const mockErrorResponse = {
        data: {
          message: 'Invalid request',
          instruction: 'Check your parameters',
          error_id: 'err_123',
        },
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
        ok: false,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockErrorResponse)

      const result = await connectorsAPI.searchInstitutions('valid-token', '', 'Chase') // empty connectorId

      expect(result.status).toBe(400)
      expect(result.data).toEqual({
        message: 'Invalid request',
        instruction: 'Check your parameters',
        error_id: 'err_123',
      })
    })

    it('should propagate fetchWithRetry errors', async () => {
      const networkError = new Error('Network failure')
      mockFetchWithRetry.mockRejectedValueOnce(networkError)

      await expect(connectorsAPI.searchInstitutions('token', 'connector', 'term')).rejects.toThrow(
        'Network failure',
      )
    })
  })

  describe('response types', () => {
    it('should handle successful institutions data response', async () => {
      const mockInstitutions = [
        { name: 'Bank of America', logoUrl: 'https://example.com/boa.png' },
        { name: 'Wells Fargo', logoUrl: 'https://example.com/wf.png' },
      ]

      const mockResponse = {
        data: mockInstitutions,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.searchInstitutions('token', 'connector', 'bank')

      expect(result.data).toEqual(mockInstitutions)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should handle empty institutions response', async () => {
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.searchInstitutions('token', 'connector', 'nonexistent')

      expect(result.data).toEqual([])
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })
})
