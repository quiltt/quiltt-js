import { ApolloLink } from '@apollo/client/core'
import { Observable } from 'rxjs'

import { validateSessionToken } from '@/utils/token-validation'

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
  override request(
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction
  ): Observable<ApolloLink.Result> {
    const validation = validateSessionToken()

    if (!validation.valid) {
      return new Observable((observer) => {
        observer.error(validation.error)
      })
    }

    const { token } = validation

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }))

    return forward(operation)
  }
}
