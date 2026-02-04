import { GraphQLError } from 'graphql'

import { JsonWebTokenParse } from '@/JsonWebToken'
import { GlobalStorage } from '@/storage'

/**
 * Result of token validation
 */
export type TokenValidationResult =
  | { valid: true; token: string }
  | { valid: false; error: GraphQLError }

/**
 * Validates the session token from GlobalStorage.
 *
 * This function:
 * - Checks if a session token exists
 * - Validates token expiration
 * - Clears expired tokens from storage (triggers observers and React re-renders)
 * - Returns appropriate GraphQL errors for authentication failures
 *
 * @param errorMessagePrefix - Optional prefix for error messages (e.g., "for subscription")
 * @returns TokenValidationResult indicating whether the token is valid or providing an error
 */
export function validateSessionToken(errorMessagePrefix = ''): TokenValidationResult {
  const token = GlobalStorage.get('session')

  if (!token) {
    return {
      valid: false,
      error: new GraphQLError(
        `No session token available${errorMessagePrefix ? ` ${errorMessagePrefix}` : ''}`,
        {
          extensions: {
            code: 'UNAUTHENTICATED',
            reason: 'NO_TOKEN',
          },
        }
      ),
    }
  }

  // Check if token is expired
  const jwt = JsonWebTokenParse(token)
  if (jwt?.claims.exp) {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    if (jwt.claims.exp < nowInSeconds) {
      // Clear expired token - this triggers observers and React re-renders
      GlobalStorage.set('session', null)

      return {
        valid: false,
        error: new GraphQLError('Session token has expired', {
          extensions: {
            code: 'UNAUTHENTICATED',
            reason: 'TOKEN_EXPIRED',
            expiredAt: jwt.claims.exp,
          },
        }),
      }
    }
  }

  return { valid: true, token }
}
