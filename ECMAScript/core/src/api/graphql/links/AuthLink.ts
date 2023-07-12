import type { FetchResult, NextLink, Observable, Operation } from '@apollo/client'
import { ApolloLink } from '@apollo/client'

import { GlobalStorage } from '@/Storage'

/**
 * unauthorizedCallback only triggers in the event the token is present, and
 * returns the token; This allows sessions to be forgotten without race conditions
 * causing null sessions to kill valid sessions, or invalid sessions for killing
 * valid sessions during rotation and networking weirdness.
 */
export class AuthLink extends ApolloLink {
  request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    const token = GlobalStorage.get('session')

    if (!token) {
      console.warn(`QuilttLink attempted to send an unauthenticated Query`)
      return null
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
