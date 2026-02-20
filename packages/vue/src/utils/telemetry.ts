import { version as vueVersion } from 'vue'

import { getBrowserInfo, getUserAgent as coreGetUserAgent } from '@quiltt/core/utils'

// Re-export getBrowserInfo
export { getBrowserInfo }

// Capacitor global type declaration
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean
      getPlatform: () => string
    }
  }
}

/**
 * Gets the Vue version from the runtime
 */
export const getVueVersion = (): string => {
  return vueVersion || 'unknown'
}

/**
 * Detects if running in a Capacitor native environment
 */
export const getCapacitorInfo = (): string | null => {
  if (typeof window === 'undefined') return null

  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      const platform = window.Capacitor.getPlatform?.() || 'native'
      // Map platform names to correct capitalization
      const platformNames: Record<string, string> = {
        ios: 'iOS',
        android: 'Android',
        web: 'Web',
      }
      const platformName = platformNames[platform.toLowerCase()] || platform
      return `Capacitor/${platformName}`
    }
  } catch {
    // Ignore errors
  }
  return null
}

/**
 * Generates platform information string for Vue web
 * Format: Vue/<version>; <browser>/<version>
 * Or with Capacitor: Vue/<version>; Capacitor/<platform>; <browser>/<version>
 */
export const getPlatformInfo = (): string => {
  const versionStr = getVueVersion()
  const capacitorInfo = getCapacitorInfo()
  const browserInfo = getBrowserInfo()

  if (capacitorInfo) {
    return `Vue/${versionStr}; ${capacitorInfo}; ${browserInfo}`
  }

  return `Vue/${versionStr}; ${browserInfo}`
}

/**
 * Generates User-Agent string for Vue SDK
 * Format: Quiltt/<sdk-version> (Vue/<vue-version>; <browser>/<version>)
 */
export const getUserAgent = (sdkVersion: string): string => {
  const platformInfo = getPlatformInfo()
  return coreGetUserAgent(sdkVersion, platformInfo)
}
