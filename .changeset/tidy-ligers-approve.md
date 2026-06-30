---
'@quiltt/capacitor': minor
'@quiltt/vue': minor
---

Add Capacitor Vue QuilttConnector bridge component with tests and examples

- **Capacitor**: Add `components/vue/QuilttConnector.ts` — a Vue 3 `defineComponent` bridge that embeds the Quiltt Connector in an iframe and handles OAuth flows via Capacitor native plugins (mirrors the existing React `QuilttConnector` component)
- **Capacitor**: Update `vue.ts` to export the new `QuilttConnector` component from `@quiltt/capacitor/vue`
- **Capacitor**: Add `vue-QuilttConnector.test.ts` with 7 tests covering iframe rendering, URL building, theme mode, OAuth callback exposure, deep link lifecycle, and error states
- **Capacitor**: Add `components/vue/index.ts` entry point and update module-loads test coverage
- **Examples**: Update `capacitor-vue` example app to use `QuilttConnector` bridge component (replaces `QuilttContainer` for the inline panel), matching the React example pattern
- **Examples**: Update capacitor-vue e2e tests (`home.spec.ts`, `connector-flow.spec.ts`) to target the new iframe-based component
