---
"@quiltt/react": patch
"@quiltt/vue": patch
---

Prevent an unhandled promise rejection in `QuilttAuthProvider` when the session changes. `resetStore()` cancels in-flight queries while clearing data cached under the previous session, and can reject while doing so — the provider now catches and ignores this expected rejection, matching the handling already in the `vue` plugin.
