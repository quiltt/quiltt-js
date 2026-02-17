import React from 'react'

import { getUserAgent as coreGetUserAgent, getBrowserInfo } from '@quiltt/core/utils'

// Re-export getBrowserInfo
export { getBrowserInfo }

/**
 * Gets the React version from the runtime
 */
export const getReactVersion = (): string => {
  return React.version || 'unknown'
}

/**
 * Generates platform information string for React web
 * Format: React/<version>; <browser>/<version>
 */
export const getPlatformInfo = (): string => {
  const reactVersion = getReactVersion()
  const browserInfo = getBrowserInfo()

  return `React/${reactVersion}; ${browserInfo}`
}

/**
 * Generates User-Agent string for React SDK
 * Format: Quiltt/<sdk-version> (React/<react-version>; <browser>/<version>)
 */
export const getUserAgent = (sdkVersion: string): string => {
  const platformInfo = getPlatformInfo()
  return coreGetUserAgent(sdkVersion, platformInfo)
}
