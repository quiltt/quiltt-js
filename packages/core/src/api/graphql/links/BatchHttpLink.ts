import { BatchHttpLink as ApolloHttpLink } from '@apollo/client/link/batch-http/index.js'

import fetch from 'cross-fetch'

import { endpointGraphQL } from '../../../configuration'

export const BatchHttpLink = new ApolloHttpLink({
  uri: endpointGraphQL,
  fetch,
})

export default BatchHttpLink
