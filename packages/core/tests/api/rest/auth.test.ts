import { AuthAPI } from '@/api/rest/auth'
import { fetchWithRetry } from '@/api/rest/fetchWithRetry'
import { endpointAuth } from '@/configuration'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PasscodePayload, UsernamePayload } from '@/api/rest/auth'
import type { Mock, MockInstance } from 'vitest'

vi.mock('@/api/rest/fetchWithRetry', () => ({
  fetchWithRetry: vi.fn(),
}))

describe('AuthAPI', () => {
  const clientId = 'test-client-id'
  const authAPI = new AuthAPI(clientId)
  const token = 'test-token'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const assertHeaders = (headers: Headers, includeAuth = true) => {
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Accept')).toBe('application/json')
    if (includeAuth) {
      expect(headers.get('Authorization')).toBe(`Bearer ${token}`)
    } else {
      expect(headers.has('Authorization')).toBe(false)
    }
  }

  const mockResponse = (body: any, status = 200, statusText = 'OK') => ({
    json: () => Promise.resolve(body),
    status,
    statusText,
    headers: new Headers(),
  })

  describe('initialization without clientId', () => {
    let errorSpy: MockInstance<any> | undefined

    beforeEach(() => {
      vi.resetAllMocks()
      errorSpy = vi.spyOn(console, 'error')
      ;(fetchWithRetry as Mock).mockResolvedValue(mockResponse({ message: 'Mock response' }))
    })

    it('logs an error when clientId is not set and trying to identify', async () => {
      const authAPIWithoutClientId = new AuthAPI()
      const payload: UsernamePayload = { email: 'test@example.com' }
      await authAPIWithoutClientId.identify(payload)

      expect(errorSpy).toHaveBeenCalledWith(
        'Quiltt Client ID is not set. Unable to identify & authenticate'
      )
    })

    it('logs an error when clientId is not set and trying to authenticate', async () => {
      const authAPIWithoutClientId = new AuthAPI()
      const payload: PasscodePayload = { email: 'test@example.com', passcode: '123456' }
      await authAPIWithoutClientId.authenticate(payload)

      expect(errorSpy).toHaveBeenCalledWith(
        'Quiltt Client ID is not set. Unable to identify & authenticate'
      )
    })
  })

  describe('ping', () => {
    it('should call `fetchWithRetry` with correct parameters', async () => {
      ;(fetchWithRetry as Mock).mockResolvedValue(mockResponse({ token: 'new-token' }))

      await authAPI.ping(token)

      const fetchOptions = (fetchWithRetry as Mock).mock.calls[0][1]
      expect((fetchWithRetry as Mock).mock.calls[0][0]).toBe(endpointAuth)
      expect(fetchOptions.method).toBe('GET')
      expect(fetchOptions.retry).toBe(true)
      assertHeaders(fetchOptions.headers)
    })
  })

  describe('identify', () => {
    it('should call `fetchWithRetry` with correct parameters', async () => {
      const payload: UsernamePayload = { email: 'test@example.com' }
      ;(fetchWithRetry as Mock).mockResolvedValue(mockResponse({ token: 'new-token' }))

      await authAPI.identify(payload)

      const fetchOptions = (fetchWithRetry as Mock).mock.calls[0][1]
      expect(fetchOptions.method).toBe('POST')
      // expect(fetchOptions.body).toBe(JSON.stringify(authAPI.body(payload)))
      expect(fetchOptions.retry).toBe(true)
      assertHeaders(fetchOptions.headers, false)
    })
  })

  describe('authenticate', () => {
    it('should call `fetchWithRetry` with correct parameters', async () => {
      const payload: PasscodePayload = { email: 'test@example.com', passcode: '123456' }
      ;(fetchWithRetry as Mock).mockResolvedValue(mockResponse({ token: 'new-token' }))

      await authAPI.authenticate(payload)

      const fetchOptions = (fetchWithRetry as Mock).mock.calls[0][1]
      expect(fetchOptions.method).toBe('PUT')
      expect(fetchOptions.body).toBe(
        JSON.stringify({
          session: {
            clientId: 'test-client-id',
            email: 'test@example.com',
            passcode: '123456',
          },
        })
      )
      expect(fetchOptions.retry).toBe(true)
      assertHeaders(fetchOptions.headers, false)
    })
  })

  describe('revoke', () => {
    it('should call `fetchWithRetry` with correct parameters', async () => {
      ;(fetchWithRetry as Mock).mockResolvedValue(mockResponse(null, 204, 'No Content'))

      await authAPI.revoke(token)

      const fetchOptions = (fetchWithRetry as Mock).mock.calls[0][1]
      expect(fetchOptions.method).toBe('DELETE')
      expect(fetchOptions.retry).toBe(true)
      assertHeaders(fetchOptions.headers)
    })
  })
})
