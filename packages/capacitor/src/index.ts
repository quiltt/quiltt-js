/**
 * @quiltt/capacitor - Framework-agnostic Capacitor plugin for Quiltt Connector
 *
 * This entry point provides the native Capacitor plugin without any
 * framework dependencies. Works with Vue, Angular, Svelte, vanilla JS, etc.
 *
 * For React apps, import from '@quiltt/capacitor/react' instead.
 *
 * @example
 * ```typescript
 * import { QuilttConnector } from '@quiltt/capacitor'
 *
 * // Open OAuth URL in system browser
 * await QuilttConnector.openUrl({ url: 'https://...' })
 *
 * // Listen for deep link callbacks
 * await QuilttConnector.addListener('deepLink', ({ url }) => {
 *   console.log('OAuth callback:', url)
 * })
 * ```
 */

// Export type definitions
export type {
  DeepLinkEvent,
  DeepLinkListener,
  OpenUrlOptions,
  QuilttConnectorPlugin,
} from './definitions'
// Export native plugin
export { QuilttConnector } from './plugin'
