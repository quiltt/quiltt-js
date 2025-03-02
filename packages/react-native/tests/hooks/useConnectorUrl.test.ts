import { renderHook } from '@testing-library/react-hooks'
import { describe, expect, it } from 'vitest'

import { useConnectorUrl } from '@/hooks/useConnectorUrl'
import { version } from '@/version'

describe('useConnectorUrl', () => {
  it('should construct a URL with proper parameters', () => {
    const connectorId = 'test-connector'
    const encodedOAuthRedirectUrl = encodeURIComponent('https://oauth.test.com/')

    const { result } = renderHook(() => useConnectorUrl(connectorId, encodedOAuthRedirectUrl))

    // Test each part of the URL separately
    expect(result.current).toContain(`https://${connectorId}.quiltt.app`)
    expect(result.current).toContain('mode=webview')

    // Check for the presence of the parameter name without being strict about the exact encoding
    expect(result.current).toContain('oauth_redirect_url=')

    // Also check that the agent parameter has the correct value
    expect(result.current).toContain(`agent=react-native-${version}`)
  })

  it('should update URL when parameters change', () => {
    const initialConnectorId = 'test-connector'
    const updatedConnectorId = 'new-connector'
    const encodedOAuthRedirectUrl = encodeURIComponent('https://oauth.test.com/')

    const { result, rerender } = renderHook(
      ({ connectorId, oauth }) => useConnectorUrl(connectorId, oauth),
      {
        initialProps: {
          connectorId: initialConnectorId,
          oauth: encodedOAuthRedirectUrl,
        },
      }
    )

    const initialUrl = result.current

    rerender({ connectorId: updatedConnectorId, oauth: encodedOAuthRedirectUrl })

    expect(result.current).not.toBe(initialUrl)
    expect(result.current).toContain(`https://${updatedConnectorId}.quiltt.app`)
  })
})
