import { ApolloLink } from '@apollo/client/core'

/**
 * Sets `keepalive: true` on `*Close` mutations so the request can outlive page
 * unload — closes commonly fire as a (mobile) webview navigates or the host app
 * backgrounds, and `keepalive` lets the browser still deliver the request to the
 * server.
 *
 * Scoped to closes only: `keepalive` requests share a small (~64 KiB) cumulative
 * body budget across all in-flight requests, so enabling it link-wide could make
 * a large query or mutation throw a `TypeError`. Close bodies are tiny (just
 * identifiers), so the quota is never a concern here.
 */
export const KeepaliveLink = new ApolloLink((operation, forward) => {
  // TODO: matching the operation-name suffix couples this generic SDK link to
  // connector naming conventions. A context/directive-driven opt-in (e.g. a
  // `keepalive` flag set on the operation context) would be a cleaner long-term
  // shape.
  if (/Close$/.test(operation.operationName ?? '')) {
    operation.setContext(({ fetchOptions = {} }) => ({
      fetchOptions: { ...fetchOptions, keepalive: true },
    }))
  }

  return forward(operation)
})
