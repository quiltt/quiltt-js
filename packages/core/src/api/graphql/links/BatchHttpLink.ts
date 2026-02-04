import { BatchHttpLink as ApolloBatchHttpLink } from '@apollo/client/link/batch-http'
import crossfetch from 'cross-fetch'

import { endpointGraphQL } from '@/config'

// Use `cross-fetch` only if `fetch` is not available on the `globalThis` object
const effectiveFetch = typeof fetch === 'undefined' ? crossfetch : fetch

export const BatchHttpLink = new ApolloBatchHttpLink({
  uri: endpointGraphQL,
  fetch: effectiveFetch,
})

export default BatchHttpLink
