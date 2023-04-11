import type { ServerError } from '@apollo/client'
import { RetryLink as ApolloRetryLink } from '@apollo/client/link/retry'

export const RetryLink = new ApolloRetryLink({
  attempts: {
    retryIf: (error: ServerError, _operation) => error.statusCode >= 500,
  },
})

export default RetryLink
