import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GraphQLError } from 'graphql'

import { GlobalStorage } from '@/storage'
import { validateSessionToken } from '@/utils/token-validation'

// Mock GlobalStorage
vi.mock('@/storage', () => ({
  GlobalStorage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

// Mock JsonWebTokenParse
vi.mock('@/auth/json-web-token', () => ({
  JsonWebTokenParse: vi.fn(),
}))

const mockGlobalStorage = vi.mocked(GlobalStorage)

describe('validateSessionToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when no token exists', () => {
    it('should return invalid result with NO_TOKEN error when token is null', () => {
      mockGlobalStorage.get.mockReturnValue(null)

      const result = validateSessionToken()

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBeInstanceOf(GraphQLError)
        expect(result.error.message).toBe('No session token available')
        expect(result.error.extensions?.code).toBe('UNAUTHENTICATED')
        expect(result.error.extensions?.reason).toBe('NO_TOKEN')
      }
      expect(mockGlobalStorage.get).toHaveBeenCalledWith('session')
    })

    it('should return invalid result when token is undefined', () => {
      mockGlobalStorage.get.mockReturnValue(undefined)

      const result = validateSessionToken()

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBeInstanceOf(GraphQLError)
        expect(result.error.extensions?.code).toBe('UNAUTHENTICATED')
        expect(result.error.extensions?.reason).toBe('NO_TOKEN')
      }
    })

    it('should return invalid result when token is empty string', () => {
      mockGlobalStorage.get.mockReturnValue('')

      const result = validateSessionToken()

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBeInstanceOf(GraphQLError)
        expect(result.error.extensions?.code).toBe('UNAUTHENTICATED')
        expect(result.error.extensions?.reason).toBe('NO_TOKEN')
      }
    })

    it('should include custom error message prefix when provided', () => {
      mockGlobalStorage.get.mockReturnValue(null)

      const result = validateSessionToken('for subscription')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.message).toBe('No session token available for subscription')
      }
    })

    it('should handle various falsy values', () => {
      const falsyValues = [null, undefined, '', 0, false]

      for (const falsyValue of falsyValues) {
        vi.clearAllMocks()
        mockGlobalStorage.get.mockReturnValue(falsyValue)

        const result = validateSessionToken()

        expect(result.valid).toBe(false)
        if (!result.valid) {
          expect(result.error).toBeInstanceOf(GraphQLError)
          expect(result.error.extensions?.code).toBe('UNAUTHENTICATED')
          expect(result.error.extensions?.reason).toBe('NO_TOKEN')
        }
      }
    })
  })

  describe('when token is expired', () => {
    it('should return invalid result and clear storage when token is expired', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'expired.token.here'
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: expiredTimestamp,
          iat: expiredTimestamp - 7200,
          iss: 'test',
          sub: 'test',
          aud: 'test',
          nbf: expiredTimestamp - 7200,
          jti: 'test',
          oid: 'test',
          eid: 'test',
          cid: 'test',
          aid: 'test',
          ver: 1,
          rol: 'manager',
        } as any,
      })

      const result = validateSessionToken()

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBeInstanceOf(GraphQLError)
        expect(result.error.message).toBe('Session token has expired')
        expect(result.error.extensions?.code).toBe('UNAUTHENTICATED')
        expect(result.error.extensions?.reason).toBe('TOKEN_EXPIRED')
        expect(result.error.extensions?.expiredAt).toBe(expiredTimestamp)
      }
      expect(mockGlobalStorage.set).toHaveBeenCalledWith('session', null)
    })

    it('should clear storage exactly once when token is expired', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'expired.token.here'
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 1 // 1 second ago

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: expiredTimestamp,
        } as any,
      })

      validateSessionToken()

      expect(mockGlobalStorage.set).toHaveBeenCalledTimes(1)
      expect(mockGlobalStorage.set).toHaveBeenCalledWith('session', null)
    })

    it('should handle token expired exactly at current time', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'just.expired.token'
      const currentTimestamp = Math.floor(Date.now() / 1000)

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: currentTimestamp - 1, // Just expired
        } as any,
      })

      const result = validateSessionToken()

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.extensions?.reason).toBe('TOKEN_EXPIRED')
      }
      expect(mockGlobalStorage.set).toHaveBeenCalledWith('session', null)
    })
  })

  describe('when token is valid', () => {
    it('should return valid result with token when token is not expired', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'valid.token.here'
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: futureTimestamp,
          iat: Math.floor(Date.now() / 1000),
          iss: 'test',
          sub: 'test',
          aud: 'test',
          nbf: Math.floor(Date.now() / 1000),
          jti: 'test',
          oid: 'test',
          eid: 'test',
          cid: 'test',
          aid: 'test',
          ver: 1,
          rol: 'manager',
        } as any,
      })

      const result = validateSessionToken()

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.token).toBe(mockToken)
      }
      expect(mockGlobalStorage.set).not.toHaveBeenCalled()
    })

    it('should return valid result when token has no exp claim', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'token.without.exp'

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: undefined as any,
          iat: Math.floor(Date.now() / 1000),
          iss: 'test',
          sub: 'test',
          aud: 'test',
        } as any,
      })

      const result = validateSessionToken()

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.token).toBe(mockToken)
      }
      expect(mockGlobalStorage.set).not.toHaveBeenCalled()
    })

    it('should return valid result when JsonWebTokenParse returns null', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'malformed.token'

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue(null)

      const result = validateSessionToken()

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.token).toBe(mockToken)
      }
      expect(mockGlobalStorage.set).not.toHaveBeenCalled()
    })

    it('should not modify storage when token is valid', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'valid.token'
      const futureTimestamp = Math.floor(Date.now() / 1000) + 7200 // 2 hours from now

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: futureTimestamp,
        } as any,
      })

      validateSessionToken()

      expect(mockGlobalStorage.set).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle token that expires in the next second', async () => {
      const { JsonWebTokenParse } = await import('@/auth/json-web-token')
      const mockToken = 'about.to.expire'
      const nextSecond = Math.floor(Date.now() / 1000) + 1

      mockGlobalStorage.get.mockReturnValue(mockToken)
      vi.mocked(JsonWebTokenParse).mockReturnValue({
        token: mockToken,
        claims: {
          exp: nextSecond,
        } as any,
      })

      const result = validateSessionToken()

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.token).toBe(mockToken)
      }
    })

    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(10000)
      mockGlobalStorage.get.mockReturnValue(longToken)

      const result = validateSessionToken()

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.token).toBe(longToken)
      }
    })

    it('should handle special characters in tokens', () => {
      const specialToken = 'token-with_special.chars+/='
      mockGlobalStorage.get.mockReturnValue(specialToken)

      const result = validateSessionToken()

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.token).toBe(specialToken)
      }
    })

    it('should call GlobalStorage.get exactly once', () => {
      mockGlobalStorage.get.mockReturnValue('some-token')

      validateSessionToken()

      expect(mockGlobalStorage.get).toHaveBeenCalledTimes(1)
      expect(mockGlobalStorage.get).toHaveBeenCalledWith('session')
    })
  })

  describe('error message customization', () => {
    it('should support empty string prefix', () => {
      mockGlobalStorage.get.mockReturnValue(null)

      const result = validateSessionToken('')

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.message).toBe('No session token available')
      }
    })

    it('should support custom prefixes', () => {
      mockGlobalStorage.get.mockReturnValue(null)

      const prefixes = ['for query', 'for mutation', 'during authentication', 'in middleware']

      for (const prefix of prefixes) {
        vi.clearAllMocks()
        mockGlobalStorage.get.mockReturnValue(null)

        const result = validateSessionToken(prefix)

        expect(result.valid).toBe(false)
        if (!result.valid) {
          expect(result.error.message).toBe(`No session token available ${prefix}`)
        }
      }
    })
  })
})
