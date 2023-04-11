import { ApolloLink } from '@apollo/client/index.js'

import { version } from '../../../../../config'

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
