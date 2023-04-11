import type { ServerError } from '@apollo/client'
import { onError } from '@apollo/client/link/error/index'

export const ErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }

  if (networkError && (networkError as ServerError).statusCode !== 401) {
    console.warn('[Network error]:', networkError)
  }
})

export default ErrorLink
