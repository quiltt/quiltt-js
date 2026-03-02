---
"@quiltt/capacitor": minor
"@quiltt/core": minor
"@quiltt/react": minor
"@quiltt/react-native": minor
"@quiltt/vue": minor
---

Add @quiltt/capacitor package for Ionic and Capacitor apps

- Framework-agnostic by default — works with Vue, Angular, Svelte, or vanilla JS
- Vue 3 components via `@quiltt/capacitor/vue` subpath
- React components via `@quiltt/capacitor/react` subpath
- Native iOS (Swift) and Android (Kotlin) plugins for OAuth deep linking
- Supports Capacitor 6, 7, and 8

Add @quiltt/vue package for Vue 3 applications

- `QuilttPlugin` for session management via Vue's provide/inject
- `useQuilttSession` composable for authentication
- `useQuilttConnector` composable for programmatic control
- `QuilttButton`, `QuilttConnector`, `QuilttContainer` components
- Add `@quiltt/capacitor/vue` entry point for Capacitor apps

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
