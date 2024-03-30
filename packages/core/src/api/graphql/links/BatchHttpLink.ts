import { BatchHttpLink as ApolloHttpLink } from '@apollo/client/link/batch-http/index.js'
import crossfetch from 'cross-fetch'

// Use `cross-fetch` only if `fetch` is not available on the `globalThis` object
const effectiveFetch = typeof fetch === 'undefined' ? crossfetch : fetch

import { endpointGraphQL } from '../../../configuration'

export const BatchHttpLink = new ApolloHttpLink({
  uri: endpointGraphQL,
  fetch: effectiveFetch,
})

export default BatchHttpLink
