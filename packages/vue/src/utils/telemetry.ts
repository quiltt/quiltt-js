import { version as vueVersion } from 'vue'

import { getBrowserInfo, getUserAgent as coreGetUserAgent } from '@quiltt/core/utils'

// Re-export getBrowserInfo
export { getBrowserInfo }

/**
 * Gets the Vue version from the runtime
 */
export const getVueVersion = (): string => {
  return vueVersion || 'unknown'
}

/**
 * Generates platform information string for Vue web
 * Format: Vue/<version>; <browser>/<version>
 */
export const getPlatformInfo = (): string => {
  const versionStr = getVueVersion()
  const browserInfo = getBrowserInfo()

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
