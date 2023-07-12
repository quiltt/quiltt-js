import { ApolloLink } from '@apollo/client'

import { version } from '../../../configuration'

export const VersionLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'Quiltt-Client-Version': version,
    },
  }))
  return forward(operation)
})

export default VersionLink
