import { HttpLink as ApolloHttpLink } from '@apollo/client/link/http/index.js'
import crossfetch from 'cross-fetch'

// Use `cross-fetch` only if `fetch` is not available on the `globalThis` object
const effectiveFetch = typeof fetch === 'undefined' ? crossfetch : fetch

import { endpointGraphQL } from '../../../configuration'

export const HttpLink = new ApolloHttpLink({
  uri: endpointGraphQL,
  fetch: effectiveFetch,
})

export default HttpLink
