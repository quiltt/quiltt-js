# @quiltt/android

## 6.0.0

## 5.3.0

### Minor Changes

- [#470](https://github.com/quiltt/quiltt-sdks/pull/470) [`0669bd0`](https://github.com/quiltt/quiltt-sdks/commit/0669bd08048010791008f62b5368ee3a5beeb7d0) Thanks [@zubairaziz](https://github.com/zubairaziz)! - Expose `themeMode` prop on all Connector SDK components

  Add a new `themeMode` prop (`'light' | 'dark' | 'auto'`) to control the Connector UI color scheme across all SDKs. Passed as `quiltt-theme-mode` HTML attribute (web) or `theme_mode` URL parameter (mobile). Resolves with priority: SDK override → Dashboard default → `'light'`.

### Patch Changes

- [#469](https://github.com/quiltt/quiltt-sdks/pull/469) [`292fc83`](https://github.com/quiltt/quiltt-sdks/commit/292fc8313e2c1dcb58156d5d44ca135857b1f40c) Thanks [@zubairaziz](https://github.com/zubairaziz)! - ## Vue: Add feature parity with React package

  - **New `QuilttContainer` component** — renders the connector inline, matching the React package API. Deprecates `QuilttConnector` in favor of this component.
  - **New `useQuilttConnector` composable** — provides SDK loading, connector lifecycle management, and session-based authentication outside of components.
  - **`QuilttButton` enhancements** — added `@click` event passthrough with `event.preventDefault()` support, `forceRemountOnConnectionChange` prop, and `quiltt-connection` / `quiltt-app-launcher-uri` attributes.
  - **Additional connector events** — added `@open`, `@exit`, and `@event` emits to `QuilttButton` and `QuilttContainer`.
  - **Force remount mechanism** — new `forceRemountOnConnectionChange` prop on `QuilttButton`, `QuilttContainer`, and `QuilttConnector` forces a complete remount when `connectionId` changes, useful for ensuring clean connector state.
  - **Deprecation check workflow** — CI check that validates deprecated component usage (`.github/actions/check-deprecations`).

## 5.2.5

### Patch Changes

- [#460](https://github.com/quiltt/quiltt-sdks/pull/460) [`30d2745`](https://github.com/quiltt/quiltt-sdks/commit/30d2745186a38356ec6ecdce32dc70577c4262a3) Thanks [@zubairaziz](https://github.com/zubairaziz)! - Fix OAuth URL double-encoding validation bug in Android and iOS SDKs. URLs arriving double-encoded from OAuth providers now normalize correctly before HTTPS validation, allowing OAuth flows to launch successfully in the browser.

## 5.2.4

### Patch Changes

- [#451](https://github.com/quiltt/quiltt-sdks/pull/451) [`e8179ce`](https://github.com/quiltt/quiltt-sdks/commit/e8179ce5dd340b0804da1836c97aec62604d91f2) Thanks [@zubairaziz](https://github.com/zubairaziz)! - Fix SDK Release

## 5.2.3

### Patch Changes

- [#448](https://github.com/quiltt/quiltt-sdks/pull/448) [`f5968c6`](https://github.com/quiltt/quiltt-sdks/commit/f5968c65bd5de1bf421d96bc371473f1e9ba4763) Thanks [@zubairaziz](https://github.com/zubairaziz)! - Empty-token early return and no-session revoke guard in useQuilttSession

## 5.2.2

### Patch Changes

- [#444](https://github.com/quiltt/quiltt-sdks/pull/444) [`ac582f5`](https://github.com/quiltt/quiltt-sdks/commit/ac582f5313c206765b17ebaacd6d50327130a552) Thanks [@zubairaziz](https://github.com/zubairaziz)! - Trigger manual release

## 5.2.1

### Patch Changes

- [#436](https://github.com/quiltt/quiltt-sdks/pull/436) [`4062b87`](https://github.com/quiltt/quiltt-sdks/commit/4062b87e6868b253bd2e878a2d64c754ed9dbf41) Thanks [@zubairaziz](https://github.com/zubairaziz)! - Added integration tests across all SDK packages (React, Vue, Capacitor React/Vue, React Native, Android, Flutter, and iOS) and validated consistent connector behavior
