import type { ServerError } from '@apollo/client/index.js'
import { RetryLink as ApolloRetryLink } from '@apollo/client/link/retry/index.js'

export const RetryLink = new ApolloRetryLink({
  attempts: {
    retryIf: (error: ServerError, _operation) => error.statusCode >= 500,
  },
})

export default RetryLink
