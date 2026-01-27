/**
 * Generates a User-Agent string following standard format
 * Format: Quiltt/<version> (<platform-info>)
 */
export const getUserAgent = (sdkVersion: string, platformInfo: string): string => {
  return `Quiltt/${sdkVersion} (${platformInfo})`
}

/**
 * Detects browser information from user agent string
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
