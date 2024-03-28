import { AuthAPI, PasscodePayload, UsernamePayload } from '@/api/rest/AuthAPI'
import { axios } from '@/api/rest/axios'
import { endpointAuth } from '@/configuration'
import { describe, it, beforeEach, expect, vi } from 'vitest'

describe('AuthAPI', () => {
  const clientId = 'test-client-id'
  const authAPI = new AuthAPI(clientId)
  const token = 'test-token'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ping', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockedResponse = { data: { token: 'new-token' } }
      axios.get = vi.fn().mockResolvedValue(mockedResponse)

      const response = await authAPI.ping(token)

      expect(axios.get).toHaveBeenCalledWith(
        endpointAuth,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
      )
      expect(response).toEqual(mockedResponse)
    })
  })

  describe('identify', () => {
    const payload: UsernamePayload = { email: 'test@example.com' }

    it('should call axios.post with correct parameters', async () => {
      const mockedResponse = { data: { token: 'new-token' } }
      axios.post = vi.fn().mockResolvedValue(mockedResponse)

      const response = await authAPI.identify(payload)

      expect(axios.post).toHaveBeenCalledWith(endpointAuth, expect.any(Object), expect.any(Object))
      expect(response).toEqual(mockedResponse)
    })
  })

  describe('authenticate', () => {
    const payload: PasscodePayload = { email: 'test@example.com', passcode: '123456' }

    it('should call axios.put with correct parameters', async () => {
      const mockedResponse = { data: { token: 'new-token' } }
      axios.put = vi.fn().mockResolvedValue(mockedResponse)

      const response = await authAPI.authenticate(payload)

      expect(axios.put).toHaveBeenCalledWith(endpointAuth, expect.any(Object), expect.any(Object))
      expect(response).toEqual(mockedResponse)
    })
  })

  describe('revoke', () => {
    it('should call axios.delete with correct parameters', async () => {
      const mockedResponse = {}
      axios.delete = vi.fn().mockResolvedValue(mockedResponse)

      const response = await authAPI.revoke(token)

      expect(axios.delete).toHaveBeenCalledWith(
        endpointAuth,
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })
      )
      expect(response).toEqual(mockedResponse)
    })
  })
})
