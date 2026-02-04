import { describe, expect, it, vi } from 'vitest'

import type { Claims, JsonWebToken } from '@/auth'
import { JsonWebTokenParse } from '@/auth'

describe('JsonWebTokenParse', () => {
  it('parses a valid JWT token and returns a JsonWebToken object', () => {
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2p3dC5kb21haW4uY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsInN1YiI6IkpvaG4gRG9lIiwibmJmIjoxNTE2MjM5MDIyLCJpYXQiOjE1MTYyMzkwMjJ9.cAeRHO4gcvfhFn77dXTiJvjq1Pn5fuWi9RfBcmfWJDI'

    const result = JsonWebTokenParse(validToken)

    const expectedClaims = {
      // aud: 'https://jwt.domain.com',
      exp: 1516239022,
      iat: 1516239022,
      iss: 'https://jwt.domain.com',
      // jti: 'abc123',
      nbf: 1516239022,
      sub: 'John Doe',
    }

    const expected: JsonWebToken<{
      aud: string
      exp: number
      iat: number
      iss: string
      jti: string
      nbf: number
      sub: string
    }> = {
      token: validToken,
      claims: expectedClaims as unknown as Claims<typeof expectedClaims>,
    }

    expect(result).toMatchObject(expected)
  })

  it('returns undefined for undefined or null input', () => {
    const undefinedResult = JsonWebTokenParse(undefined)
    const nullResult = JsonWebTokenParse(null)

    expect(undefinedResult).toBeUndefined()
    expect(nullResult).toBeNull()
  })

  it('returns undefined for invalid JWT token input', () => {
    const invalidToken = 'invalid.token'
    const result = JsonWebTokenParse(invalidToken)

    expect(result).toBeUndefined()
  })

  it('logs an error for tokens that fail regex validation', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const invalidToken = 'invalid.token'
    const result = JsonWebTokenParse(invalidToken)

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).toHaveBeenCalledWith(`Invalid Session Token: ${invalidToken}`)

    consoleErrorSpy.mockRestore()
  })

  it('logs an error and returns undefined when payload fails JSON parsing', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 'aW52YWxpZA' is valid base64 but decodes to 'invalid' which isn't valid JSON
    const tokenWithInvalidPayload = 'header.aW52YWxpZA.signature'

    const result = JsonWebTokenParse(tokenWithInvalidPayload)

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid Session Token:'))

    consoleErrorSpy.mockRestore()
  })
})
