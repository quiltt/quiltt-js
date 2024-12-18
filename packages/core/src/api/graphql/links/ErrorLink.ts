import { GlobalStorage } from '@/storage'

import type { ServerError } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'

export const ErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }

  if (networkError) {
    if ((networkError as ServerError).statusCode === 401) {
      console.warn('[Authentication error]:', networkError)
      GlobalStorage.set('session', null)
    } else {
      console.warn('[Network error]:', networkError)
    }
  }
})

export default ErrorLink
