import React from 'react'

/**
 * Gets the React version from the runtime
 */
export const getReactVersion = (): string => {
  return React.version || 'unknown'
}

/**
 * Detects browser information from user agent string
 */
export const getBrowserInfo = (): string => {
  if (typeof navigator === 'undefined' || !navigator.userAgent) {
    return 'Unknown'
  }

  const ua = navigator.userAgent

  // Edge (must be checked before Chrome)
  if (ua.includes('Edg/')) {
    const version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown'
    return `Edge/${version}`
  }

  // Chrome
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    const version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
    return `Chrome/${version}`
  }

  // Safari (must be checked after Chrome)
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    const version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
    return `Safari/${version}`
  }

  // Firefox
  if (ua.includes('Firefox/')) {
    const version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
    return `Firefox/${version}`
  }

  return 'Unknown'
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
  return `Quiltt/${sdkVersion} (${platformInfo})`
}
