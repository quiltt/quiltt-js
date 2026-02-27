/**
 * @quiltt/capacitor/react - React components for Quiltt Connector in Capacitor apps
 *
 * This entry point provides React components and hooks for Capacitor apps.
 * Requires React 16.8+ and @quiltt/react as peer dependencies.
 *
 * For non-React apps (Vue, Angular, Svelte), import from '@quiltt/capacitor' instead.
 *
 * @example
 * ```tsx
 * import { QuilttConnector, useQuilttSession } from '@quiltt/capacitor/react'
 *
 * function App() {
 *   return (
 *     <QuilttConnector
 *       connectorId="<CONNECTOR_ID>"
 *       onExitSuccess={({ connectionId }) => console.log(connectionId)}
 *     />
 *   )
 * }
 * ```
 */

// Re-export all @quiltt/react functionality for convenience
export * from '@quiltt/react'

// Export Capacitor-specific QuilttConnector component
export type { QuilttConnectorHandle } from './components'
export { QuilttConnector } from './components'
// Export plugin type definitions
export * from './definitions'
// Export native plugin for advanced use cases
export { QuilttConnector as QuilttConnectorPlugin } from './plugin'
