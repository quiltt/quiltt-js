import { renderHook } from '@testing-library/react-hooks'
import { Platform } from 'react-native'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useWebViewHandlers } from '@/hooks/useWebViewHandlers'
import { handleOAuthUrl } from '@/utils/url-helpers'

// Mock URL helpers properly
vi.mock('@/utils/url-helpers', () => ({
  handleOAuthUrl: vi.fn(),
  isQuilttEvent: vi.fn((url) => url.protocol === 'quilttconnector:'),
}))

describe('useWebViewHandlers', () => {
  const mockRef = { current: { injectJavaScript: vi.fn() } }
  const mockCallbacks = {
    connectorId: 'test-connector',
    connectionId: 'test-connection',
    institution: 'test-bank',
    sessionToken: 'test-token',
    onEvent: vi.fn(),
    onLoad: vi.fn(),
    onExit: vi.fn(),
    onExitSuccess: vi.fn(),
    onExitAbort: vi.fn(),
    onExitError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return handler functions', () => {
    const { result } = renderHook(() =>
      useWebViewHandlers({ webViewRef: mockRef as any, ...mockCallbacks })
    )

    expect(result.current.onLoadEnd).toBeInstanceOf(Function)
    expect(result.current.requestHandler).toBeInstanceOf(Function)
    expect(result.current.handleWebViewMessage).toBeInstanceOf(Function)
  })

  it('should inject header script on iOS when onLoadEnd is called', () => {
    Platform.OS = 'ios'
    const { result } = renderHook(() =>
      useWebViewHandlers({ webViewRef: mockRef as any, ...mockCallbacks })
    )

    result.current.onLoadEnd()
    expect(mockRef.current.injectJavaScript).toHaveBeenCalled()
  })

  it('should not inject header script on Android when onLoadEnd is called', () => {
    Platform.OS = 'android'
    const { result } = renderHook(() =>
      useWebViewHandlers({ webViewRef: mockRef as any, ...mockCallbacks })
    )

    result.current.onLoadEnd()
    expect(mockRef.current.injectJavaScript).not.toHaveBeenCalled()
  })

  it('should handle WebView messages correctly', () => {
    const { result } = renderHook(() =>
      useWebViewHandlers({ webViewRef: mockRef as any, ...mockCallbacks })
    )

    const mockEvent = {
      nativeEvent: {
        data: JSON.stringify({
          type: 'Navigate',
          action: 'popup',
          url: 'https://test.auth.com',
        }),
      },
    }

    result.current.handleWebViewMessage(mockEvent)
    expect(handleOAuthUrl).toHaveBeenCalled()
  })
})
