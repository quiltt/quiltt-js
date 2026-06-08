---
"@quiltt/core": patch
---

Retry empty-body `200` `ServerParseError` responses in `RetryLink`.

These occur when an in-flight GraphQL request is terminated by a (mobile) webview navigating or backgrounding — WebKit resolves the aborted request as a `200` with zero bytes, so `JSON.parse('')` throws and Apollo raises a `ServerParseError`. The misleading `200` status code previously caused the retry predicate to give up immediately. Session-creating `*Initialize` mutations are intentionally excluded from the retry since they are not idempotent — only the idempotent close mutations, which account for nearly all of these failures, are retried. Also adds a `KeepaliveLink` that sets `keepalive: true` on `*Close` mutations so they can still reach the server during page unload — scoped to closes rather than set link-wide, since `keepalive` requests share a small (~64 KiB) cumulative body budget that a large query or mutation could otherwise exceed.
