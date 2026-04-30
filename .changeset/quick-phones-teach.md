---
"@quiltt/android": patch
"@quiltt/ios": patch
"@quiltt/capacitor": patch
"@quiltt/core": patch
"@quiltt/flutter": patch
"@quiltt/react": patch
"@quiltt/react-native": patch
"@quiltt/vue": patch
---

Fix OAuth URL double-encoding validation bug in Android and iOS SDKs. URLs arriving double-encoded from OAuth providers now normalize correctly before HTTPS validation, allowing OAuth flows to launch successfully in the browser.
