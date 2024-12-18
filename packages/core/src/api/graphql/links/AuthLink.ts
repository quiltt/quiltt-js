import { ApolloLink } from '@apollo/client/core/index.js'
import type { FetchResult, NextLink, Operation } from '@apollo/client/core'
import type { Observable } from '@apollo/client/utilities'

import { GlobalStorage } from '@/storage'

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
      console.warn('QuilttLink attempted to send an unauthenticated Query')
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
