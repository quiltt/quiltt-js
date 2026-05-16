---
"@quiltt/flutter": patch
"@quiltt/vue": patch
"@quiltt/android": patch
"@quiltt/capacitor": patch
"@quiltt/core": patch
"@quiltt/ios": patch
"@quiltt/react": patch
"@quiltt/react-native": patch
---

## Vue: Add feature parity with React package

- **New `QuilttContainer` component** — renders the connector inline, matching the React package API. Deprecates `QuilttConnector` in favor of this component.
- **New `useQuilttConnector` composable** — provides SDK loading, connector lifecycle management, and session-based authentication outside of components.
- **`QuilttButton` enhancements** — added `@click` event passthrough with `event.preventDefault()` support, `forceRemountOnConnectionChange` prop, and `quiltt-connection` / `quiltt-app-launcher-uri` attributes.
- **Additional connector events** — added `@open`, `@exit`, and `@event` emits to `QuilttButton` and `QuilttContainer`.
- **Force remount mechanism** — new `forceRemountOnConnectionChange` prop on `QuilttButton`, `QuilttContainer`, and `QuilttConnector` forces a complete remount when `connectionId` changes, useful for ensuring clean connector state.
- **Deprecation check workflow** — CI check that validates deprecated component usage (`.github/actions/check-deprecations`).
