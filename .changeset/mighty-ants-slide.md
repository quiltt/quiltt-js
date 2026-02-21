---
"@quiltt/react-native": minor
"@quiltt/react": minor
"@quiltt/core": minor
---

Rename `oauthRedirectUrl` to `appLauncherUrl` for mobile OAuth flows

This change introduces `appLauncherUrl` as the new preferred property name for specifying the Universal Link (iOS) or App Link (Android) that redirects users back to your app after OAuth authentication.

**Deprecation Warning:** The `oauthRedirectUrl` property is now deprecated but remains fully functional for backwards compatibility. Existing code using `oauthRedirectUrl` will continue to work without modifications.

**Migration:**

- Replace `oauthRedirectUrl` with `appLauncherUrl` in your component props
- The behavior remains identical; only the property name has changed

**Example:**

```tsx
// Before (deprecated, still works)
<QuilttConnector oauthRedirectUrl="https://myapp.com/callback" />

// After (recommended)
<QuilttConnector appLauncherUrl="https://myapp.com/callback" />
```
