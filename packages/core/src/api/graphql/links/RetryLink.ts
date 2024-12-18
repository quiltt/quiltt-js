import { RetryLink as ApolloRetryLink } from '@apollo/client/link/retry'

export const RetryLink = new ApolloRetryLink({
  attempts: {
    retryIf: (error, _operation) => !!error && (!error.statusCode || error.statusCode >= 500),
  },
})

export default RetryLink
