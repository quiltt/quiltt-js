---
"@quiltt/react-native": patch
"@quiltt/android": patch
"@quiltt/flutter": patch
"@quiltt/ios": patch
---

Fix unhandled OAuth URL rejections across all mobile SDKs

- **react-native**: `handleOAuthUrl` is now `async`, await's `Linking.openURL()`,
  calls `Linking.canOpenURL()` as a preflight, and propagates failures through
  `onExitError` so host apps can surface error recovery UI.
- **iOS**: Added `UIApplication.shared.canOpenURL()` preflight and fires
  `onExitError` when the URL cannot be opened.
- **Android**: Added `Intent.resolveActivity()` preflight before `startActivity`
  and fires `onExitError` on failure.
- **Flutter**: Added `canLaunchUrlString()` preflight before `launchUrlString`,
  checks the launch result, and fires `onExitError` on failure.

Previously, failed OAuth URL opens (e.g. Plaid OAuth URLs the OS cannot handle)
surfaced as unhandled promise rejections or silent failures without notifying
the host app. The connector would appear to freeze after the user tapped
"Connect." Host apps can now listen to `onExitError` to show a recovery UI.
