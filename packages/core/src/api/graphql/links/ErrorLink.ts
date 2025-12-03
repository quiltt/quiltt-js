import type { ServerError } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error/index.js'

import { GlobalStorage } from '@/storage'

export const ErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path, extensions }) => {
      const formattedPath = Array.isArray(path) ? path.join('.') : (path ?? 'N/A')
      const parts = [`[Quiltt][GraphQL Error]: ${message}`, `Path: ${formattedPath}`]

      if (extensions) {
        if (extensions.code) parts.push(`Code: ${extensions.code}`)
        if (extensions.errorId) parts.push(`Error ID: ${extensions.errorId}`)
      }

      console.warn(parts.join(' | '))
    })
  }

  if (networkError) {
    if ((networkError as ServerError).statusCode === 401) {
      console.warn('[Quiltt][Authentication Error]:', networkError)
      GlobalStorage.set('session', null)
    } else {
      console.warn('[Quiltt][Network Error]:', networkError)
    }
  }
})

export default ErrorLink
