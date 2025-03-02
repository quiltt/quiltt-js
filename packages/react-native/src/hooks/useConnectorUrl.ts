import { useMemo } from 'react'
import { URL } from 'react-native-url-polyfill'

import { version } from '@/version'

/**
 * Helper function to determine if a string is already URL encoded
 * This checks if the string contains any URL encoded characters (%xx)
 */
const isUrlEncoded = (str: string): boolean => {
  // A simple way to check is to see if the string contains % followed by two hex digits
  return /%[0-9A-Fa-f]{2}/.test(str)
}

/**
 * Helper function to safely append a URL parameter without double-encoding
 * Uses a different approach based on whether the value is already encoded
 */
const safeAppendParam = (url: URL, name: string, value: string): void => {
  if (isUrlEncoded(value)) {
    // If already encoded, directly manipulate the search string to avoid re-encoding
    const searchParams = url.searchParams
    const currentParams = searchParams.toString()
    const newParamPart = `${name}=${value}`
    const newParams = currentParams ? `${currentParams}&${newParamPart}` : newParamPart
    url.search = newParams
  } else {
    // If not encoded, let searchParams.append() handle the encoding
    url.searchParams.append(name, value)
  }
}

/**
 * Hook that creates a connector URL with proper parameters
 * Handles both encoded and non-encoded OAuth redirect URLs
 */
export const useConnectorUrl = (connectorId: string, oauthRedirectUrl: string) => {
  return useMemo(() => {
    const url = new URL(`https://${connectorId}.quiltt.app`)

    // These parameters don't need special handling
    url.searchParams.append('mode', 'webview')
    url.searchParams.append('agent', `react-native-${version}`)

    // Use our special handling for the OAuth redirect URL
    safeAppendParam(url, 'oauth_redirect_url', oauthRedirectUrl)

    return url.toString()
  }, [connectorId, oauthRedirectUrl])
}
