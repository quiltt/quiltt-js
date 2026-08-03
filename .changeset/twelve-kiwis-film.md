---
"@quiltt/core": patch
"@quiltt/react": patch
"@quiltt/vue": patch
---

Mark `FetchResponse<T>.data` as `T | null` to match runtime reality — `fetchWithRetry` already returns `null` when `response.json()` fails (empty or malformed bodies).

Add optional chaining guards across `react` and `vue` session, institutions, and resolvable hooks to prevent `Cannot read properties of null` crashes. Previously `data.token` or `data.message` would throw when the response body was unparseable. Now those paths safely short-circuit.
