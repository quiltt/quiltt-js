import type { ApolloLink } from '@apollo/client/core'
import { BatchHttpLink as ApolloBatchHttpLink } from '@apollo/client/link/batch-http'
import crossfetch from 'cross-fetch'

import { endpointGraphQL } from '@/config'

// Use `cross-fetch` only if `fetch` is not available on the `globalThis` object
const effectiveFetch = typeof fetch === 'undefined' ? crossfetch : fetch

/**
 * Separate close operations from other operations to prevent a non-close request
 * from being co-batched with a close that has `keepalive: true`. This ensures
 * the batch body stays within the keepalive quota (~64 KiB) when the close is
 * sent during unload.
 */
const batchKey = (operation: ApolloLink.Operation): string => {
  return /Close$/.test(operation.operationName ?? '') ? 'close' : 'default'
}

export const BatchHttpLink = new ApolloBatchHttpLink({
  uri: endpointGraphQL,
  fetch: effectiveFetch,
  batchKey,
})
