import { describe, expect, it, vi } from 'vitest'

import { JsonWebTokenParse } from '@/JsonWebToken'
import type { JsonWebToken } from '@/JsonWebToken'

describe('JsonWebTokenParse', () => {
  it('parses a valid JWT token and returns a JsonWebToken object', () => {
    // Sample valid JWT token
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2p3dC5kb21haW4uY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInN1YiI6IkpvaG4gRG9lIiwibmJmIjoxNTE2MjM5MDIyLCJpYXQiOjE1MTYyMzkwMjJ9.cAeRHO4gcvfhFn77dXTiJvjq1Pn5fuWi9RfBcmfWJDI'

    // Call the function with the valid token
    const result = JsonWebTokenParse(validToken)

    // Define the expected claims without extra properties
    const expectedClaims = {
      iss: 'https://jwt.domain.com',
      iat: 1516239022,
      exp: 1516239022,
      sub: 'John Doe',
      nbf: 1516239022,
    }

    // Define the expected output with the adjusted claims
    const expected: JsonWebToken<{
      oid: string
      eid: string
      cid: string
      aid: string
      ver: number
    }> = {
      token: validToken,
      // @ts-expect-error
      claims: expectedClaims,
    }

    // Expect the result to match the expected output
    expect(result).toMatchObject(expected)
  })

  it('returns undefined for undefined or null input', () => {
    // Call the function with undefined input
    const undefinedResult = JsonWebTokenParse(undefined)

    // Call the function with null input
    const nullResult = JsonWebTokenParse(null)

    expect(undefinedResult).toBeUndefined()
    expect(nullResult).toBeNull()
  })

  it('returns undefined for invalid JWT token input', () => {
    // Sample invalid JWT token
    const invalidToken = 'invalid.token'

    // Call the function with the invalid token
    const result = JsonWebTokenParse(invalidToken)

    // Expect the result to be undefined
    expect(result).toBeUndefined()
  })

  it('logs an error message when catching an error while parsing the JWT token', () => {
    // Mock console.error to spy on it
    const originalConsoleError = console.error
    const consoleErrorSpy = vi.fn()
    console.error = consoleErrorSpy

    // Call the function with a token that will throw an error during parsing
    JsonWebTokenParse('invalid.token')

    // Expect console.error to have been called with the error message
    expect(consoleErrorSpy).toHaveBeenCalled()

    // Restore console.error to its original implementation
    console.error = originalConsoleError
  })
})
