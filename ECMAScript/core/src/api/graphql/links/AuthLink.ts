import type { ServerError } from '@apollo/client'
import { ApolloLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

export type UnauthorizedCallback = (token: string) => void

/**
 * unauthorizedCallback only triggers in the event the the token is present, and
 * returns the token; This allows sessions to be forgotten without race conditions
 * causing null sessions to kill valid sessions, or invalid sessions for killing
 * valid sessions during rotation and networking weirdness.
 */
export class AuthLink extends ApolloLink {
  constructor(token: string | undefined, unauthorizedCallback?: UnauthorizedCallback) {
    if (!token) {
      super(() => {
        console.warn(`QuilttLink attempted to send an unauthenticated Query`)
        return null
      })
    } else {
      super((operation, forward) => {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${token}`,
          },
        }))
        return forward(operation)
      })

      this.concat(
        onError(({ networkError }) => {
          if (networkError && (networkError as ServerError).statusCode === 401 && unauthorizedCallback) {
            unauthorizedCallback(token)
          }
        })
      )
    }
  }
}

export default AuthLink
