import { ApolloLink } from '@apollo/client/core'
import { GraphQLError } from 'graphql'
import { Observable } from 'rxjs'

import { JsonWebTokenParse } from '@/JsonWebToken'
import { GlobalStorage } from '@/storage'

/**
 * Apollo Link that handles authentication and session expiration for GraphQL requests.
 *
 * Features:
 * - Automatically adds Bearer token to request headers
 * - Detects expired tokens and triggers proper error handling
 * - Clears expired sessions from storage (triggers React re-renders via observers)
 * - Emits GraphQL errors for consistent Apollo error handling
 */
export class AuthLink extends ApolloLink {
  request(
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction
  ): Observable<ApolloLink.Result> {
    const token = GlobalStorage.get('session')

    if (!token) {
      return new Observable((observer) => {
        observer.error(
          new GraphQLError('No session token available', {
            extensions: {
              code: 'UNAUTHENTICATED',
              reason: 'NO_TOKEN',
            },
          })
        )
      })
    }

    // Check if token is expired
    const jwt = JsonWebTokenParse(token)
    if (jwt?.claims.exp) {
      const nowInSeconds = Math.floor(Date.now() / 1000)
      if (jwt.claims.exp < nowInSeconds) {
        // Clear expired token - this triggers observers and React re-renders
        GlobalStorage.set('session', null)

        return new Observable((observer) => {
          observer.error(
            new GraphQLError('Session token has expired', {
              extensions: {
                code: 'UNAUTHENTICATED',
                reason: 'TOKEN_EXPIRED',
                expiredAt: jwt.claims.exp,
              },
            })
          )
        })
      }
    }

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }))

    return forward(operation)
  }
}

export default AuthLink
