---
"@quiltt/react-native": minor
"@quiltt/capacitor": minor
"@quiltt/android": minor
"@quiltt/flutter": minor
"@quiltt/react": minor
"@quiltt/core": minor
"@quiltt/ios": minor
"@quiltt/vue": minor
---

Expose `themeMode` prop on all Connector SDK components

Add a new `themeMode` prop (`'light' | 'dark' | 'auto'`) to control the Connector UI color scheme across all SDKs. Passed as `quiltt-theme-mode` HTML attribute (web) or `theme_mode` URL parameter (mobile). Resolves with priority: SDK override → Dashboard default → `'light'`.
