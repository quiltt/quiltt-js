/**
 * Checks if a string appears to be already URL encoded
 * @param str The string to check
 * @returns boolean indicating if the string appears to be URL encoded
 */
export const isEncoded = (str: string): boolean => {
  // Check for typical URL encoding patterns like %20, %3A, etc.
  const hasEncodedChars = /%[0-9A-F]{2}/i.test(str)

  // Check if double encoding has occurred (e.g., %253A instead of %3A)
  const hasDoubleEncoding = /%25[0-9A-F]{2}/i.test(str)

  // If we have encoded chars but no double encoding, it's likely properly encoded
  return hasEncodedChars && !hasDoubleEncoding
}

/**
 * Smart URL encoder that ensures a string is encoded exactly once
 * @param str The string to encode
 * @returns A properly URL encoded string
 */
export const smartEncodeURIComponent = (str: string): string => {
  if (!str) return str

  // If it's already encoded, return as is
  if (isEncoded(str)) {
    console.log('URL already encoded, skipping encoding')
    return str
  }

  // Otherwise, encode it
  const encoded = encodeURIComponent(str)
  console.log('URL encoded')
  return encoded
}

/**
 * Creates a URL with proper parameter encoding
 * @param baseUrl The base URL string
 * @param params Object containing key-value pairs to be added as search params
 * @returns A properly formatted URL string
 */
export const createUrlWithParams = (baseUrl: string, params: Record<string, string>): string => {
  try {
    const url = new URL(baseUrl)

    // Add each parameter without additional encoding
    // (URLSearchParams.append will encode them automatically)
    Object.entries(params).forEach(([key, value]) => {
      // Skip undefined or null values
      if (value == null) return

      // For oauth_redirect_url specifically, ensure it's not double encoded
      if (key === 'oauth_redirect_url' && isEncoded(value)) {
        // Decode once to counteract the automatic encoding that will happen
        const decodedOnce = decodeURIComponent(value)
        url.searchParams.append(key, decodedOnce)
      } else {
        url.searchParams.append(key, value)
      }
    })

    return url.toString()
  } catch (error) {
    console.error('Error creating URL with params:', error)
    return baseUrl
  }
}

/**
 * Checks if a string appears to be double-encoded
 */
const isDoubleEncoded = (str: string): boolean => {
  if (!str) return false
  return /%25[0-9A-F]{2}/i.test(str)
}

/**
 * Normalizes a URL string by decoding it once if it appears to be double-encoded
 */
export const normalizeUrlEncoding = (urlStr: string): string => {
  if (isDoubleEncoded(urlStr)) {
    console.log('Detected double-encoded URL:', urlStr)
    const normalized = decodeURIComponent(urlStr)
    console.log('Normalized to:', normalized)
    return normalized
  }
  return urlStr
}
