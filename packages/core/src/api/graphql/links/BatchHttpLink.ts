import { BatchHttpLink as ApolloHttpLink } from '@apollo/client/link/batch-http'
import crossfetch from 'cross-fetch'

import { endpointGraphQL } from '@/configuration'

// Use `cross-fetch` only if `fetch` is not available on the `globalThis` object
const effectiveFetch = typeof fetch === 'undefined' ? crossfetch : fetch

export const BatchHttpLink = new ApolloHttpLink({
  uri: endpointGraphQL,
  fetch: effectiveFetch,
})

export default BatchHttpLink
