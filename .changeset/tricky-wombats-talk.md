---
"@quiltt/react-native": patch
"@quiltt/android": patch
"@quiltt/capacitor": patch
"@quiltt/core": patch
"@quiltt/flutter": patch
"@quiltt/ios": patch
"@quiltt/react": patch
"@quiltt/vue": patch
---

Fix dark mode background flashes in the React Native Connector

When using `themeMode="dark"`, the native wrapper around the Quiltt Connector WebView now uses transparent backgrounds instead of hardcoded light ones. This eliminates white flashes and white safe-area insets during loading.

- **Android**: SafeAreaView wrapper background set to `transparent` to prevent white bleed in the status bar area
- **iOS**: WebView background set to `transparent` and native loading spinner disabled (`startInLoadingState: false`), since Quiltt renders its own branded loader inside the WebView HTML
