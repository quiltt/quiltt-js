import type { MockedFunction } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApolloLink } from '@apollo/client/core'

import AuthLink from '@/api/graphql/links/AuthLink'
import { GlobalStorage } from '@/storage'

// Mock GlobalStorage
vi.mock('@/storage', () => ({
  GlobalStorage: {
    get: vi.fn(),
  },
}))

const mockGlobalStorage = vi.mocked(GlobalStorage)

describe('AuthLink', () => {
  let authLink: AuthLink
  let mockOperation: ApolloLink.Operation
  let mockForward: ApolloLink.ForwardFunction
  let mockSetContext: MockedFunction<any>

  beforeEach(() => {
    vi.clearAllMocks()

    authLink = new AuthLink()

    // Create properly typed mock function
    mockSetContext = vi.fn()

    // Mock operation
    mockOperation = {
      query: {} as any,
      variables: {},
      operationName: 'TestQuery',
      extensions: {},
      setContext: mockSetContext as any,
      getContext: vi.fn().mockReturnValue({}),
    } as any

    // Mock forward function that returns an observable
    const mockObservable = {
      subscribe: vi.fn(),
    } as any

    mockForward = vi.fn().mockReturnValue(mockObservable) as any

    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('request method with token', () => {
    it('should add authorization header when token exists', () => {
      const mockToken = 'test-jwt-token-123'
      mockGlobalStorage.get.mockReturnValue(mockToken)

      const result = authLink.request(mockOperation, mockForward)

      expect(mockGlobalStorage.get).toHaveBeenCalledWith('session')
      expect(mockSetContext).toHaveBeenCalledWith(expect.any(Function))

      // Test the context function that was passed to setContext
      const contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
      const contextResult = contextFunction({ headers: {} })

      expect(contextResult).toEqual({
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })

      expect(mockForward).toHaveBeenCalledWith(mockOperation)
      expect(result).toBe((mockForward as any).mock.results[0].value)
    })

    it('should preserve existing headers when adding authorization', () => {
      const mockToken = 'test-jwt-token-456'
      const existingHeaders = {
        'content-type': 'application/json',
        'x-custom-header': 'custom-value',
      }

      mockGlobalStorage.get.mockReturnValue(mockToken)

      authLink.request(mockOperation, mockForward)

      // Test the context function with existing headers
      const contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
      const result = contextFunction({ headers: existingHeaders })

      expect(result).toEqual({
        headers: {
          'content-type': 'application/json',
          'x-custom-header': 'custom-value',
          authorization: `Bearer ${mockToken}`,
        },
      })

      expect(mockForward).toHaveBeenCalledWith(mockOperation)
    })

    it('should handle context function with undefined headers', () => {
      const mockToken = 'test-jwt-token-789'
      mockGlobalStorage.get.mockReturnValue(mockToken)

      authLink.request(mockOperation, mockForward)

      // Test the context function with no headers property
      const contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
      const result = contextFunction({})

      expect(result).toEqual({
        headers: {
          authorization: `Bearer ${mockToken}`,
        },
      })
    })

    it('should work with various token formats', () => {
      const tokenFormats = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'simple-token',
        'bearer-token-123',
        'complex.token.with.dots',
      ]

      tokenFormats.forEach((token) => {
        vi.clearAllMocks()
        mockGlobalStorage.get.mockReturnValue(token)

        authLink.request(mockOperation, mockForward)

        const contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
        const result = contextFunction({ headers: {} })

        expect(result.headers.authorization).toBe(`Bearer ${token}`)
        expect(mockForward).toHaveBeenCalledWith(mockOperation)
      })
    })

    it('should call GlobalStorage.get exactly once per request', () => {
      const mockToken = 'test-token'
      mockGlobalStorage.get.mockReturnValue(mockToken)

      authLink.request(mockOperation, mockForward)

      expect(mockGlobalStorage.get).toHaveBeenCalledTimes(1)
      expect(mockGlobalStorage.get).toHaveBeenCalledWith('session')
    })
  })

  describe('request method without token', () => {
    it('should return null and log warning when no token exists', () => {
      mockGlobalStorage.get.mockReturnValue(null)

      const result = authLink.request(mockOperation, mockForward)

      expect(result).toBeNull()
      expect(mockGlobalStorage.get).toHaveBeenCalledWith('session')
      expect(console.warn).toHaveBeenCalledWith(
        'QuilttLink attempted to send an unauthenticated Query'
      )
      expect(mockSetContext).not.toHaveBeenCalled()
      expect(mockForward).not.toHaveBeenCalled()
    })

    it('should return null when token is undefined', () => {
      mockGlobalStorage.get.mockReturnValue(undefined)

      const result = authLink.request(mockOperation, mockForward)

      expect(result).toBeNull()
      expect(console.warn).toHaveBeenCalledWith(
        'QuilttLink attempted to send an unauthenticated Query'
      )
    })

    it('should return null when token is empty string', () => {
      mockGlobalStorage.get.mockReturnValue('')

      const result = authLink.request(mockOperation, mockForward)

      expect(result).toBeNull()
      expect(console.warn).toHaveBeenCalledWith(
        'QuilttLink attempted to send an unauthenticated Query'
      )
    })

    it('should handle falsy values correctly', () => {
      const falsyValues = [null, undefined, '', 0, false]

      falsyValues.forEach((falsyValue) => {
        vi.clearAllMocks()
        mockGlobalStorage.get.mockReturnValue(falsyValue)

        const result = authLink.request(mockOperation, mockForward)

        expect(result).toBeNull()
        expect(console.warn).toHaveBeenCalledWith(
          'QuilttLink attempted to send an unauthenticated Query'
        )
      })
    })
  })

  describe('integration scenarios', () => {
    it('should work in a typical authentication flow', () => {
      const sessionToken = 'valid-session-token-abc123'
      mockGlobalStorage.get.mockReturnValue(sessionToken)

      // Simulate a GraphQL query operation
      const queryOperation = {
        ...mockOperation,
        operationName: 'GetUserProfile',
        variables: { userId: '123' },
      }

      const result = authLink.request(queryOperation, mockForward)

      expect(result).not.toBeNull()
      expect(mockGlobalStorage.get).toHaveBeenCalledWith('session')
      expect(mockSetContext).toHaveBeenCalled()
      expect(mockForward).toHaveBeenCalledWith(queryOperation)

      // Verify the context was set correctly
      const contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
      const contextResult = contextFunction({
        headers: { accept: 'application/json' },
      })

      expect(contextResult).toEqual({
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${sessionToken}`,
        },
      })
    })

    it('should prevent unauthenticated requests from proceeding', () => {
      mockGlobalStorage.get.mockReturnValue(null)

      // Simulate a protected query
      const protectedOperation = {
        ...mockOperation,
        operationName: 'GetSensitiveData',
      }

      const result = authLink.request(protectedOperation, mockForward)

      expect(result).toBeNull()
      expect(mockSetContext).not.toHaveBeenCalled()
      expect(mockForward).not.toHaveBeenCalled()
      expect(console.warn).toHaveBeenCalledWith(
        'QuilttLink attempted to send an unauthenticated Query'
      )
    })
  })

  describe('token management scenarios', () => {
    it('should handle token rotation scenarios', () => {
      // First request with old token
      const oldToken = 'old-token-123'
      mockGlobalStorage.get.mockReturnValue(oldToken)

      authLink.request(mockOperation, mockForward)

      let contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
      let result = contextFunction({ headers: {} })

      expect(result.headers.authorization).toBe(`Bearer ${oldToken}`)

      // Clear mocks for second request
      vi.clearAllMocks()
      // Re-assign the mock since we cleared it
      mockOperation.setContext = mockSetContext as any

      // Second request with new token (simulating token refresh)
      const newToken = 'new-token-456'
      mockGlobalStorage.get.mockReturnValue(newToken)

      authLink.request(mockOperation, mockForward)

      contextFunction = mockSetContext.mock.calls[0][0] as (context: any) => any
      result = contextFunction({ headers: {} })

      expect(result.headers.authorization).toBe(`Bearer ${newToken}`)
    })

    it('should handle session expiry scenarios', () => {
      // First request succeeds
      mockGlobalStorage.get.mockReturnValue('valid-token')
      let result = authLink.request(mockOperation, mockForward)
      expect(result).not.toBeNull()

      // Clear mocks
      vi.clearAllMocks()
      // Re-assign the mock since we cleared it
      mockOperation.setContext = mockSetContext as any

      // Second request fails due to expired/cleared session
      mockGlobalStorage.get.mockReturnValue(null)
      result = authLink.request(mockOperation, mockForward)

      expect(result).toBeNull()
      expect(console.warn).toHaveBeenCalledWith(
        'QuilttLink attempted to send an unauthenticated Query'
      )
    })
  })

  describe('error handling', () => {
    it('should handle storage errors gracefully', () => {
      mockGlobalStorage.get.mockImplementation(() => {
        throw new Error('Storage not available')
      })

      expect(() => authLink.request(mockOperation, mockForward)).toThrow('Storage not available')
    })

    it('should handle setContext throwing errors', () => {
      const mockToken = 'test-token'
      mockGlobalStorage.get.mockReturnValue(mockToken)
      mockSetContext.mockImplementation(() => {
        throw new Error('SetContext failed')
      })

      expect(() => authLink.request(mockOperation, mockForward)).toThrow('SetContext failed')
    })

    it('should handle forward function errors', () => {
      const mockToken = 'test-token'
      mockGlobalStorage.get.mockReturnValue(mockToken)
      ;(mockForward as any).mockImplementation(() => {
        throw new Error('Forward failed')
      })

      expect(() => authLink.request(mockOperation, mockForward)).toThrow('Forward failed')
    })
  })

  describe('inheritance and Apollo Link compatibility', () => {
    it('should extend ApolloLink properly', () => {
      expect(authLink).toBeInstanceOf(AuthLink)
      expect(authLink.request).toBeInstanceOf(Function)
    })

    it('should return the correct type from forward', () => {
      const mockToken = 'test-token'
      const mockObservable = { subscribe: vi.fn() }

      mockGlobalStorage.get.mockReturnValue(mockToken)
      ;(mockForward as any).mockReturnValue(mockObservable)

      const result = authLink.request(mockOperation, mockForward)

      expect(result).toBe(mockObservable)
      expect(mockForward).toHaveBeenCalledWith(mockOperation)
    })
  })
})
