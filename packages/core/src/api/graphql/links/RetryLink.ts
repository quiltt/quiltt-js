import { ServerParseError } from '@apollo/client/errors'
import { RetryLink as ApolloRetryLink } from '@apollo/client/link/retry'

export const RetryLink = new ApolloRetryLink({
  attempts: {
    retryIf: (error, operation) => {
      if (!error) return false

      // An empty body with a `200` is a transport failure wearing a success
      // status, typically an in-flight request killed when a (mobile) webview
      // navigates or backgrounds. The status code lies; retry it — except for
      // session-creating `*Initialize` mutations, which are not idempotent (a
      // retry could create a duplicate session if the first request reached the
      // server). Closes are idempotent and safe to retry, and they account for
      // nearly all of these failures, so we skip the retry for initialize here
      // rather than make it idempotent server-side. Scoped to `200` so genuine
      // server errors (5xx) — including a 5xx `ServerParseError` on initialize —
      // still follow the default retry path below.
      if (ServerParseError.is(error) && !error.bodyText && error.statusCode === 200) {
        // TODO: matching the operation-name suffix couples this generic SDK link to
        // connector naming conventions. A context/directive-driven opt-in (e.g. a
        // `retryable`/`idempotent` flag set on the operation context) would be a
        // cleaner long-term shape.
        return !/Initialize$/.test(operation.operationName ?? '')
      }

      const statusCode = 'statusCode' in error ? (error as any).statusCode : undefined
      return !statusCode || statusCode >= 500
    },
  },
})
