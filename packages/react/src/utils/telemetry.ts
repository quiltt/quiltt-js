import React from 'react'

import { getSDKAgent as coreGetSDKAgent, getBrowserInfo } from '@quiltt/core/utils'

import { version as PACKAGE_VERSION } from '../../package.json'

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
 * Generates Quiltt-SDK-Agent string for React SDK
 * Format: Quiltt/<sdk-version> (React/<react-version>; <browser>/<version>)
 */
export const getSDKAgent = (sdkVersion: string): string => {
  const platformInfo = getPlatformInfo()
  return coreGetSDKAgent(sdkVersion, platformInfo)
}

/**
 * @deprecated Renamed to `getSDKAgent`. Will be removed in v6.
 */
export const getUserAgent = (
  ...args: Parameters<typeof getSDKAgent>
): ReturnType<typeof getSDKAgent> => {
  if (Number(PACKAGE_VERSION.split('.')[0]) >= 6) {
    throw new Error('[Quiltt] `getUserAgent` was removed in v6. Use `getSDKAgent` instead.')
  }
  console.warn(
    '[Quiltt] `getUserAgent` is deprecated. Use `getSDKAgent` instead. This will be removed in v6.'
  )
  return getSDKAgent(...args)
}
