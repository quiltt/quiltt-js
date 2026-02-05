import { ErrorLink as ApolloErrorLink } from '@apollo/client/link/error'
import type { GraphQLFormattedError } from 'graphql'

import { GlobalStorage } from '@/storage'

export const ErrorLink = new ApolloErrorLink(({ error, result }) => {
  // In Apollo Client 4, errors are consolidated to the 'error' and 'result' properties

  // Handle GraphQL errors from result
  if (result?.errors) {
    result.errors.forEach((graphQLError: GraphQLFormattedError) => {
      const { message, path, extensions } = graphQLError
      const formattedPath = Array.isArray(path) ? path.join('.') : (path ?? 'N/A')
      const parts = [`[Quiltt][GraphQL Error]: ${message}`, `Path: ${formattedPath}`]

      if (extensions) {
        if (extensions.code) parts.push(`Code: ${extensions.code}`)
        if (extensions.errorId) parts.push(`Error ID: ${extensions.errorId}`)
        if (extensions.instruction) parts.push(`Instruction: ${extensions.instruction}`)
        if (extensions.documentationUrl) {
          parts.push(`Docs: ${extensions.documentationUrl}`)
        }
      }

      console.warn(parts.join(' | '))
    })
  }

  // Handle network/server errors
  if (error) {
    if ('statusCode' in error && error.statusCode === 401) {
      console.warn('[Quiltt][Authentication Error]:', error)
      GlobalStorage.set('session', null)
    } else if ('statusCode' in error) {
      console.warn('[Quiltt][Server Error]:', error)
    } else {
      console.warn('[Quiltt][Network Error]:', error)
    }
  }
})

export default ErrorLink
