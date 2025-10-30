---
"@quiltt/react": patch
"@quiltt/core": patch
"@quiltt/react-native": patch
---

Hardened React SDK against unstable prop references by implementing ref-based callback wrappers and deep equality checks, eliminating unnecessary re-renders, event handler churn, and API calls without requiring customers to use useCallback.
