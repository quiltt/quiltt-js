import { RetryLink as ApolloRetryLink } from '@apollo/client/link/retry'

export const RetryLink = new ApolloRetryLink({
  attempts: {
    retryIf: (error, _operation) => {
      if (!error) return false
      const statusCode = 'statusCode' in error ? (error as any).statusCode : undefined
      return !statusCode || statusCode >= 500
    },
  },
})

export default RetryLink
