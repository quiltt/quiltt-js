/**
 * @quiltt/capacitor/vue - Vue 3 components for Quiltt Connector in Capacitor apps
 *
 * This entry point provides Vue 3 components and composables for Capacitor apps.
 * Requires Vue 3.3+ and @quiltt/vue as peer dependencies.
 *
 * For non-framework apps in plain JS (Vue, Angular, Svelte, etc.), you can also use
 * the framework-agnostic import from '@quiltt/capacitor' directly.
 *
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import { QuilttPlugin } from '@quiltt/capacitor/vue'
 *
 * const app = createApp(App)
 * app.use(QuilttPlugin, { token: '<SESSION_TOKEN>' })
 * app.mount('#app')
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { QuilttConnector, useQuilttSession } from '@quiltt/capacitor/vue'
 * </script>
 *
 * <template>
 *   <QuilttConnector
 *     connector-id="<CONNECTOR_ID>"
 *     @exit-success="handleSuccess"
 *     @navigate="handleNavigate"
 *   />
 * </template>
 * ```
 */

// Re-export all @quiltt/vue functionality
export * from '@quiltt/vue'

// Export plugin type definitions
export * from './definitions'

// Export native plugin for OAuth handling
export { QuilttConnector as QuilttConnectorPlugin } from './plugin'
