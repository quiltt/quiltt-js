import React from 'react'

import { getSDKAgent as coreGetSDKAgent, getBrowserInfo } from '@quiltt/core/utils'

// Re-export getBrowserInfo
export { getBrowserInfo }

// Capacitor global type declaration
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean
      getPlatform?: () => string
    }
  }
}

/**
 * Gets the React version from the runtime
 */
export const getReactVersion = (): string => {
  return React.version || 'unknown'
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
 * Generates platform information string for React web
 * Format: React/<version>; <browser>/<version>
 * Or with Capacitor: React/<version>; Capacitor/<platform>; <browser>/<version>
 */
export const getPlatformInfo = (): string => {
  const reactVersion = getReactVersion()
  const capacitorInfo = getCapacitorInfo()
  const browserInfo = getBrowserInfo()

  if (capacitorInfo) {
    return `React/${reactVersion}; ${capacitorInfo}; ${browserInfo}`
  }

  return `React/${reactVersion}; ${browserInfo}`
}

/**
 * Generates Quiltt-SDK-Agent string for React SDK
 * Format: Quiltt/<sdk-version> (React/<react-version>; <browser>/<version>)
 */
export const getSDKAgent = (sdkVersion: string): string => {
  const platformInfo = getPlatformInfo()
  return coreGetSDKAgent(sdkVersion, platformInfo)
}
