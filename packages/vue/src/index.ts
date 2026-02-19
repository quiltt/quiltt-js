// ============================================================================
// @quiltt/vue - Vue 3 Composables and Components for Quiltt
// ============================================================================
// This package provides Vue 3-specific composables and components for
// integrating Quiltt's financial data platform into Vue applications.
// It re-exports all @quiltt/core functionality plus Vue-specific features.
//
// Main exports:
// - All @quiltt/core modules (API clients, auth, config, storage, types)
// - Vue plugin (QuilttPlugin) for app-wide session management
// - Vue composables (useQuilttSession, useQuilttConnector)
// - Vue components (QuilttConnector, QuilttButton, QuilttContainer)
// ============================================================================

// ============================================================================
// Quiltt Core - Re-export all modules from @quiltt/core
// ============================================================================
// Re-export all core Quiltt functionality so users only need to install
// @quiltt/vue instead of both @quiltt/core and @quiltt/vue.
export * from '@quiltt/core/api'
export * from '@quiltt/core/auth'
export * from '@quiltt/core/config'
export * from '@quiltt/core/observables'
export * from '@quiltt/core/storage'
export * from '@quiltt/core/timing'
export * from '@quiltt/core/types'

// ============================================================================
// Vue-specific exports
// ============================================================================
// Quiltt Vue plugin, composables, and components for Vue 3 applications.
export * from './components'
export * from './composables'
export * from './plugin'
