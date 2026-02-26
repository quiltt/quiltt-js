import type { MockedFunction } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConnectorsAPI } from '@/api/rest/connectors'
import { fetchWithRetry } from '@/api/rest/fetchWithRetry'
import { version } from '@/config'
import { extractVersionNumber, getSDKAgent } from '@/utils/telemetry'

// Mock fetchWithRetry
vi.mock('@/api/rest/fetchWithRetry', () => ({
  fetchWithRetry: vi.fn(),
}))

// Mock configuration with complete exports to avoid import errors
vi.mock('@/config', async (importOriginal) => {
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
  const testSDKAgent = getSDKAgent(version, 'React/18.2.0; Chrome/120')

  beforeEach(() => {
    vi.clearAllMocks()
    connectorsAPI = new ConnectorsAPI('test-client-id', testSDKAgent)
  })

  describe('constructor', () => {
    it('should initialize with clientId and sdkAgent', () => {
      const sdkAgent = getSDKAgent(version, 'React/18.2.0; Chrome/120')
      const api = new ConnectorsAPI('client-123', sdkAgent)

      expect(api.clientId).toBe('client-123')
      expect(api.sdkAgent).toBe(sdkAgent)
    })

    it('should initialize with custom sdkAgent', () => {
      const sdkAgent = getSDKAgent(version, 'React/18.2.0; Safari/17')
      const api = new ConnectorsAPI('client-123', sdkAgent)

      expect(api.clientId).toBe('client-123')
      expect(api.sdkAgent).toBe(sdkAgent)
    })

    it('should use default Unknown sdkAgent when sdkAgent is not provided', () => {
      const api = new ConnectorsAPI('client-123')
      const versionNumber = extractVersionNumber(version)
      const expectedSdkAgent = getSDKAgent(versionNumber, 'Unknown')

      expect(api.clientId).toBe('client-123')
      expect(api.sdkAgent).toBe(expectedSdkAgent)
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
        abortController.signal
      )

      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: abortController.signal,
        })
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
      expect(headers.get('Quiltt-SDK-Agent')).toBe(testSDKAgent)
      expect(headers.get('Authorization')).toBe('Bearer test-token-123')
    })

    it('should use custom sdkAgent in headers', async () => {
      const customSDKAgent = getSDKAgent(version, 'ReactNative/0.73.0; iOS/17.0; iPhone14,2')
      const customAPI = new ConnectorsAPI('client-123', customSDKAgent)
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

      expect(headers.get('Quiltt-SDK-Agent')).toBe(customSDKAgent)
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
      // Authorization header should not be set when token is not provided
      expect(headers.get('Authorization')).toBeNull()
    })

    it('should create config with undefined token', () => {
      const config = (connectorsAPI as any).config(undefined)

      const headers = config.headers as Headers
      // Authorization header should not be set when token is undefined
      expect(headers.get('Authorization')).toBeNull()
    })
  })

  describe('custom headers', () => {
    const customHeaders = {
      'Quiltt-Session-ID': 'session-123',
      'Quiltt-Anonymous-ID': 'anon-456',
      'X-Custom-Header': 'custom-value',
    }

    it('should store custom headers in constructor', () => {
      const apiWithHeaders = new ConnectorsAPI('client-123', testSDKAgent, customHeaders)

      expect(apiWithHeaders.customHeaders).toEqual(customHeaders)
    })

    it('should include custom headers in searchInstitutions request', async () => {
      const apiWithHeaders = new ConnectorsAPI('client-123', testSDKAgent, customHeaders)
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }
      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await apiWithHeaders.searchInstitutions('token', 'connector-id', 'Chase')

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Quiltt-Session-ID')).toBe('session-123')
      expect(headers.get('Quiltt-Anonymous-ID')).toBe('anon-456')
      expect(headers.get('X-Custom-Header')).toBe('custom-value')
    })

    it('should include custom headers in checkResolvable request', async () => {
      const apiWithHeaders = new ConnectorsAPI('client-123', testSDKAgent, customHeaders)
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }
      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await apiWithHeaders.checkResolvable('token', 'connector-id', { plaid: 'ins_123' })

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Quiltt-Session-ID')).toBe('session-123')
      expect(headers.get('Quiltt-Anonymous-ID')).toBe('anon-456')
      expect(headers.get('X-Custom-Header')).toBe('custom-value')
    })

    it('should not add custom headers when customHeaders is undefined', async () => {
      const apiWithoutHeaders = new ConnectorsAPI('client-123', testSDKAgent)
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }
      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await apiWithoutHeaders.searchInstitutions('token', 'connector-id', 'Chase')

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Quiltt-Session-ID')).toBeNull()
      expect(headers.get('Quiltt-Anonymous-ID')).toBeNull()
    })

    it('should allow custom headers to override default headers', async () => {
      const overrideHeaders = {
        Accept: 'text/plain',
      }
      const apiWithOverrides = new ConnectorsAPI('client-123', testSDKAgent, overrideHeaders)
      const mockResponse = {
        data: [],
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }
      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await apiWithOverrides.searchInstitutions('token', 'connector-id', 'Chase')

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Accept')).toBe('text/plain')
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

      const result = await connectorsAPI.searchInstitutions(
        'invalid-token',
        'connector-123',
        'Chase'
      )

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
        'Network failure'
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

  describe('checkResolvable method', () => {
    const mockToken = 'test-token-123'
    const mockConnectorId = 'connector-456'

    it('should make correct API call with plaid institution ID', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        plaid: 'ins_3',
      })

      // Verify the URL construction
      const expectedUrl =
        'https://api.quiltt.com/sdk/connectors/connector-456/resolvable?plaid=ins_3'

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
        data: { resolvable: false },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const abortController = new AbortController()
      await connectorsAPI.checkResolvable(
        mockToken,
        mockConnectorId,
        { plaid: 'ins_3' },
        abortController.signal
      )

      expect(mockFetchWithRetry).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: abortController.signal,
        })
      )
    })

    it('should handle empty provider ID object', async () => {
      const mockResponse = {
        data: { resolvable: false },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {})

      const expectedUrl = 'https://api.quiltt.com/sdk/connectors/connector-456/resolvable?'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
    })

    it('should set correct headers in config', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      await connectorsAPI.checkResolvable(mockToken, mockConnectorId, { plaid: 'ins_3' })

      const callArgs = mockFetchWithRetry.mock.calls[0][1]
      const headers = callArgs?.headers as Headers

      expect(headers.get('Content-Type')).toBe('application/json')
      expect(headers.get('Accept')).toBe('application/json')
      expect(headers.get('Quiltt-SDK-Agent')).toBe(testSDKAgent)
      expect(headers.get('Authorization')).toBe('Bearer test-token-123')
    })

    it('should handle 400 Bad Request when provider ID is missing', async () => {
      const mockErrorResponse = {
        data: {
          message: 'Bad Request',
          instruction: 'Are you sending the correct parameters?',
        },
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
        ok: false,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockErrorResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {})

      expect(result.status).toBe(400)
      expect(result.data).toEqual({
        message: 'Bad Request',
        instruction: 'Are you sending the correct parameters?',
      })
    })

    it('should handle 404 Not Found when connector does not exist', async () => {
      const mockErrorResponse = {
        data: {
          message: 'Not Found',
          instruction: 'Is this the correct URL?',
        },
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        ok: false,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockErrorResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, 'invalid-connector', {
        plaid: 'ins_3',
      })

      expect(result.status).toBe(404)
      expect(result.data).toEqual({
        message: 'Not Found',
        instruction: 'Is this the correct URL?',
      })
    })

    it('should handle 401 Unauthorized responses', async () => {
      const mockErrorResponse = {
        data: {
          message: 'Not Authenticated',
          instruction: 'Are you sending a valid API Key secret in the `Authorization` header?',
        },
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        ok: false,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockErrorResponse)

      const result = await connectorsAPI.checkResolvable('invalid-token', mockConnectorId, {
        plaid: 'ins_3',
      })

      expect(result.status).toBe(401)
      expect(result.data).toEqual({
        message: 'Not Authenticated',
        instruction: 'Are you sending a valid API Key secret in the `Authorization` header?',
      })
    })

    it('should handle 403 Forbidden for unsupported SDK', async () => {
      const mockErrorResponse = {
        data: {
          message: 'Forbidden',
          instruction: 'This endpoint must be called from a supported Quiltt SDK.',
        },
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers(),
        ok: false,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockErrorResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        plaid: 'ins_3',
      })

      expect(result.status).toBe(403)
      expect(result.data).toEqual({
        message: 'Forbidden',
        instruction: 'This endpoint must be called from a supported Quiltt SDK.',
      })
    })

    it('should return resolvable true when provider ID can be resolved', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        plaid: 'ins_3',
      })

      expect(result.data).toEqual({ resolvable: true })
      expect(result.status).toBe(200)
    })

    it('should return resolvable false when provider ID cannot be resolved', async () => {
      const mockResponse = {
        data: { resolvable: false },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        plaid: 'ins_unknown',
      })

      expect(result.data).toEqual({ resolvable: false })
      expect(result.status).toBe(200)
    })

    it('should handle mock provider ID', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        mock: 'mock_123',
      })

      const expectedUrl =
        'https://api.quiltt.com/sdk/connectors/connector-456/resolvable?mock=mock_123'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result.data).toEqual({ resolvable: true })
      expect(result.status).toBe(200)
    })

    it('should handle mx provider ID', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        mx: 'mx_123',
      })

      const expectedUrl = 'https://api.quiltt.com/sdk/connectors/connector-456/resolvable?mx=mx_123'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result.data).toEqual({ resolvable: true })
      expect(result.status).toBe(200)
    })

    it('should handle finicity provider ID', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        finicity: 'finicity_123',
      })

      const expectedUrl =
        'https://api.quiltt.com/sdk/connectors/connector-456/resolvable?finicity=finicity_123'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result.data).toEqual({ resolvable: true })
      expect(result.status).toBe(200)
    })

    it('should handle akoya provider ID', async () => {
      const mockResponse = {
        data: { resolvable: true },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        ok: true,
      }

      mockFetchWithRetry.mockResolvedValueOnce(mockResponse)

      const result = await connectorsAPI.checkResolvable(mockToken, mockConnectorId, {
        akoya: 'akoya_123',
      })

      const expectedUrl =
        'https://api.quiltt.com/sdk/connectors/connector-456/resolvable?akoya=akoya_123'

      expect(mockFetchWithRetry).toHaveBeenCalledWith(expectedUrl, expect.any(Object))
      expect(result.data).toEqual({ resolvable: true })
      expect(result.status).toBe(200)
    })
  })
})
