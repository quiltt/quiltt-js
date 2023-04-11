import type { FetchResult, NextLink, Observable, Operation, ServerError } from '@apollo/client/index.js'
import { ApolloLink } from '@apollo/client/index.js'

export type UnauthorizedCallback = (token: string) => void

/**
 * unauthorizedCallback only triggers in the event the the token is present, and
 * returns the token; This allows sessions to be forgotten without race conditions
 * causing null sessions to kill valid sessions, or invalid sessions for killing
 * valid sessions during rotation and networking weirdness.
 */
export class AuthLink extends ApolloLink {
  token: undefined | string
  unauthorizedCallback: undefined | UnauthorizedCallback

  constructor(token: string | undefined, unauthorizedCallback?: UnauthorizedCallback) {
    super();
    this.token = token
    this.unauthorizedCallback = unauthorizedCallback
  }

  request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    if (!this.token) {
      console.warn(`QuilttLink attempted to send an unauthenticated Query`)
      return null
    }

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${this.token}`,
      },
    }))

    const observable = forward(operation)

    observable.subscribe({ error: ({ networkError }: { networkError: ServerError }) => {
      if (networkError?.statusCode === 401 && this.unauthorizedCallback) {
        this.unauthorizedCallback(this.token as string)
      }
    }})

    return observable
  }
}

export default AuthLink
