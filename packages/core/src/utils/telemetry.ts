import { version as PACKAGE_VERSION } from '../../package.json'

/**
 * Extracts version number from formatted version string
 * @param formattedVersion - Formatted version like "@quiltt/core: v4.5.1"
 * @returns Version number like "4.5.1" or "unknown" if not found
 */
export const extractVersionNumber = (formattedVersion: string): string => {
  // Find the 'v' prefix and extract version after it
  const vIndex = formattedVersion.indexOf('v')
  if (vIndex === -1) return 'unknown'

  const versionPart = formattedVersion.substring(vIndex + 1)
  const parts = versionPart.split('.')

  // Validate we have at least major.minor.patch
  if (parts.length < 3) return 'unknown'

  // Extract numeric parts (handles cases like "4.5.1-beta")
  const major = parts[0].match(/^\d+/)?.[0]
  const minor = parts[1].match(/^\d+/)?.[0]
  const patch = parts[2].match(/^\d+/)?.[0]

  if (!major || !minor || !patch) return 'unknown'

  return `${major}.${minor}.${patch}`
}

/**
 * Generates a custom SDK Agent string following standard format
 * Format: Quiltt/<version> (<platform-info>)
 */
export const getSDKAgent = (sdkVersion: string, platformInfo: string): string => {
  return `Quiltt/${sdkVersion} (${platformInfo})`
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

/**
 * Detects browser information from Browser's user agent string
 * Returns browser name and version, or 'Unknown' if not detected
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
