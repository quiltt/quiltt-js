import { ApolloLink } from '@apollo/client/core'
import type { Subscription } from 'rxjs'
import { Observable } from 'rxjs'

export type HeadersLinkOptions = {
  /** Static headers to add to every request */
  headers?: Record<string, string>
  /** Dynamic headers function called on each request */
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>
}

/**
 * Apollo Link that adds custom headers to GraphQL requests.
 *
 * Headers can be provided statically or dynamically via a function.
 * These headers are added before the AuthLink, so they will be preserved
 * alongside the authorization header.
 */
export class HeadersLink extends ApolloLink {
  private headers: Record<string, string>
  private getHeaders?: () => Record<string, string> | Promise<Record<string, string>>

  constructor(options: HeadersLinkOptions = {}) {
    super()
    this.headers = options.headers ?? {}
    this.getHeaders = options.getHeaders
  }

  override request(
    operation: ApolloLink.Operation,
    forward: ApolloLink.ForwardFunction
  ): Observable<ApolloLink.Result> {
    // If we have a dynamic headers function, handle it
    if (this.getHeaders) {
      return new Observable((observer) => {
        let innerSubscription: Subscription | undefined
        let cancelled = false

        Promise.resolve(this.getHeaders!())
          .then((dynamicHeaders) => {
            // Guard against late resolution after unsubscribe
            if (cancelled) return

            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                ...this.headers,
                ...dynamicHeaders,
              },
            }))

            innerSubscription = forward(operation).subscribe({
              next: (value) => !cancelled && observer.next(value),
              error: (err) => !cancelled && observer.error(err),
              complete: () => !cancelled && observer.complete(),
            })
          })
          .catch((error) => {
            if (!cancelled) {
              observer.error(error)
            }
          })

        // Return teardown logic
        return () => {
          cancelled = true
          innerSubscription?.unsubscribe()
        }
      })
    }

    // Static headers only
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        ...this.headers,
      },
    }))

    return forward(operation)
  }
}

export default HeadersLink
