// Re-export all @quiltt/react functionality for convenience
// This allows Capacitor users to import everything from @quiltt/capacitor
export * from '@quiltt/react'

export type { QuilttConnectorHandle } from './components'
// Export Capacitor-specific QuilttConnector component
export { QuilttConnector } from './components'
// Export plugin type definitions
export * from './definitions'
// Export native plugin for advanced use cases
export { QuilttConnector as QuilttConnectorPlugin } from './plugin'
