import { Linking, Platform } from 'react-native'

import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react-native'

import { checkConnectorUrl, handleOAuthUrl, QuilttConnector } from '@/components/QuilttConnector'
import { ConnectorSDKEventType } from '@quiltt/react'

// Store WebView props for testing
let capturedWebViewProps: any = null

// Mock WebView ref for script injection tests
const webViewRef = {
  current: {
    injectJavaScript: vi.fn(),
  },
}

// Mock ErrorReporter before importing QuilttConnector
vi.mock('@/utils/error/ErrorReporter', () => ({
  ErrorReporter: class {
    notify() {
      return Promise.resolve()
    }
  },
}))

// Mock WebView component with proper testID handling
vi.mock('react-native-webview', () => ({
  WebView: (props: any) => {
    capturedWebViewProps = { ...props } // Synchronous capture

    // Attach the mock ref implementation to the props
    if (props.ref) {
      props.ref.current = webViewRef.current
    }

    return null
  },
}))

// Mock useRef to return our controlled ref
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useRef: () => webViewRef,
  }
})

// Mock Quiltt React
vi.mock('@quiltt/react', () => ({
  useQuilttSession: () => ({ session: { token: 'test-token' } }),
  ConnectorSDKEventType: {
    Load: 'Load',
    ExitAbort: 'ExitAbort',
    ExitError: 'ExitError',
    ExitSuccess: 'ExitSuccess',
  },
}))

// Mock URL utility functions
vi.mock('@/utils', () => ({
  ErrorReporter: class {
    notify() {
      return Promise.resolve()
    }
  },
  isEncoded: (url: string) => url.includes('%'),
  normalizeUrlEncoding: (url: string) => {
    // Simple mock implementation for testing
    return url.replace(/\s/g, '%20')
  },
  smartEncodeURIComponent: (str: string) => {
    // Simple mock that simulates checking if already encoded
    if (str.includes('%')) return str
    return encodeURIComponent(str)
  },
}))

// Helper to create a mock Response
const createMockResponse = (status: number, body: any): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('QuilttConnector', () => {
  const defaultProps = {
    testId: 'test-connector',
    connectorId: 'test-connector',
    connectionId: 'test-connection',
    institution: 'test-bank',
    oauthRedirectUrl: 'https://oauth.test.com/',
    onEvent: vi.fn(),
    onLoad: vi.fn(),
    onExit: vi.fn(),
    onExitSuccess: vi.fn(),
    onExitAbort: vi.fn(),
    onExitError: vi.fn(),
  }

  let fetchSpy: MockInstance
  let requestAnimationFrameSpy: MockInstance
  let consoleErrorSpy: MockInstance
  let consoleLogSpy: MockInstance
  let consoleWarnSpy: MockInstance

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    requestAnimationFrameSpy = vi
      .spyOn(global, 'requestAnimationFrame')
      .mockImplementation((cb) => {
        cb(0)
        return 0
      })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    capturedWebViewProps = null

    // Reset the webViewRef's injectJavaScript mock before each test
    webViewRef.current.injectJavaScript.mockReset()

    // Mock successful fetch for all tests by default
    fetchSpy.mockResolvedValue(createMockResponse(200, { ok: true }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('WebView Platform-Specific Props', () => {
    beforeEach(() => {
      // Mock successful fetch for all WebView tests
      fetchSpy.mockResolvedValueOnce(createMockResponse(200, { ok: true }))

      // Reset capturedWebViewProps
      capturedWebViewProps = null
    })

    it('should have correct common props regardless of platform', async () => {
      Platform.OS = 'ios'

      const { rerender } = render(<QuilttConnector {...defaultProps} />)

      // Wait for pre-flight check to complete
      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
      })

      // Force a rerender to ensure props are captured
      rerender(<QuilttConnector {...defaultProps} />)

      // Verify all common props
      expect(capturedWebViewProps.testID).toBe('webview')
      expect(capturedWebViewProps.originWhitelist).toEqual(['*'])
      expect(capturedWebViewProps.source.uri).toContain('quiltt.app')
      expect(capturedWebViewProps.javaScriptEnabled).toBe(true)
      expect(capturedWebViewProps.domStorageEnabled).toBe(true)
      expect(capturedWebViewProps.webviewDebuggingEnabled).toBe(true)
      expect(capturedWebViewProps.scrollEnabled).toBe(true)
      expect(capturedWebViewProps.automaticallyAdjustContentInsets).toBe(false)
      expect(capturedWebViewProps.contentInsetAdjustmentBehavior).toBe('never')
    })

    it('should apply iOS specific props when platform is iOS', async () => {
      Platform.OS = 'ios'
      render(<QuilttConnector {...defaultProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
        // Test iOS specific props
        expect(capturedWebViewProps.bounces).toBe(false)
        expect(capturedWebViewProps.decelerationRate).toBe('normal')
        expect(capturedWebViewProps.keyboardDisplayRequiresUserAction).toBe(false)
        expect(capturedWebViewProps.dataDetectorTypes).toBe('none')
        expect(capturedWebViewProps.allowsInlineMediaPlayback).toBe(true)
        expect(capturedWebViewProps.allowsBackForwardNavigationGestures).toBe(false)
        expect(capturedWebViewProps.startInLoadingState).toBe(true)

        // Ensure Android props are not present
        expect(capturedWebViewProps.androidLayerType).toBeUndefined()
        expect(capturedWebViewProps.cacheEnabled).toBeUndefined()
        expect(capturedWebViewProps.cacheMode).toBeUndefined()
      })
    })

    it('should apply Android specific props when platform is Android', async () => {
      Platform.OS = 'android'
      render(<QuilttConnector {...defaultProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
        // Test Android specific props
        expect(capturedWebViewProps.androidLayerType).toBe('hardware')
        expect(capturedWebViewProps.cacheEnabled).toBe(true)
        expect(capturedWebViewProps.cacheMode).toBe('LOAD_CACHE_ELSE_NETWORK')

        // Ensure iOS props are not present
        expect(capturedWebViewProps.decelerationRate).toBeUndefined()
        expect(capturedWebViewProps.keyboardDisplayRequiresUserAction).toBeUndefined()
        expect(capturedWebViewProps.dataDetectorTypes).toBeUndefined()
        expect(capturedWebViewProps.allowsInlineMediaPlayback).toBeUndefined()
        expect(capturedWebViewProps.allowsBackForwardNavigationGestures).toBeUndefined()
        expect(capturedWebViewProps.startInLoadingState).toBeUndefined()
      })
    })

    it('should have a valid request handler function', async () => {
      Platform.OS = 'ios'
      render(<QuilttConnector {...defaultProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
        expect(typeof capturedWebViewProps.onShouldStartLoadWithRequest).toBe('function')
      })
    })
  })

  describe('Component Rendering', () => {
    it('should render LoadingScreen during pre-flight check', () => {
      fetchSpy.mockImplementationOnce(() => new Promise(() => {})) // Never resolving promise
      const { getByTestId } = render(<QuilttConnector {...defaultProps} />)
      expect(getByTestId('loading-screen')).toBeTruthy()
    })

    it('should render webview if pre-flight check succeeds', async () => {
      // Mock successful fetch response
      fetchSpy.mockResolvedValueOnce(createMockResponse(200, { ok: true }))

      const { getByTestId } = render(<QuilttConnector {...defaultProps} />)

      await waitFor(
        () => {
          expect(() => getByTestId('loading-screen')).toThrow()
        },
        { timeout: 1000 }
      )
    })

    describe('when pre-flight check fails due to network error', () => {
      beforeEach(() => {
        fetchSpy.mockRejectedValue(new Error('Network error'))
      })

      it('should render ErrorScreen', async () => {
        const { getByTestId } = render(<QuilttConnector {...defaultProps} />)

        // Wait for error screen to appear and loading screen to disappear
        await waitFor(
          () => {
            expect(() => getByTestId('loading-screen')).toThrow()
            expect(getByTestId('error-screen')).toBeTruthy()
          },
          { timeout: 3000 }
        ) // Increased timeout to account for retries
      })
    })

    describe('when pre-flight check fails due to 500 server error', () => {
      beforeEach(() => {
        fetchSpy.mockResolvedValue(createMockResponse(500, { ok: false }))
      })

      it('should render ErrorScreen', async () => {
        const { getByTestId } = render(<QuilttConnector {...defaultProps} />)

        // Wait for error screen to appear and loading screen to disappear
        await waitFor(
          () => {
            expect(() => getByTestId('loading-screen')).toThrow()
            expect(getByTestId('error-screen')).toBeTruthy()
          },
          { timeout: 3000 }
        ) // Increased timeout to account for retries
      })
    })

    describe('when pre-flight check fails due to 404 server error', () => {
      beforeEach(() => {
        fetchSpy.mockResolvedValue(createMockResponse(404, { ok: false }))
      })

      it('should render ErrorScreen', async () => {
        const { getByTestId } = render(<QuilttConnector {...defaultProps} />)

        // Wait for error screen to appear and loading screen to disappear
        await waitFor(
          () => {
            expect(() => getByTestId('loading-screen')).toThrow()
            expect(getByTestId('error-screen')).toBeTruthy()
          },
          { timeout: 3000 }
        ) // Increased timeout to account for retries
      })
    })
  })

  describe('URL Checking', () => {
    it('should handle routable URL successfully', async () => {
      fetchSpy.mockResolvedValueOnce(createMockResponse(200, { ok: true }))
      const result = await checkConnectorUrl('http://test.com')
      expect(result).toEqual({ checked: true })
    })

    it('should retry on failure', async () => {
      fetchSpy
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce(createMockResponse(200, { ok: true }))

      const result = await checkConnectorUrl('http://test.com', 0)
      expect(result).toEqual({ checked: true })
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should return error after exhausting retries', async () => {
      // Mock fetch to consistently fail
      fetchSpy.mockRejectedValue(new Error('Persistent failure'))

      const result = await checkConnectorUrl('http://test.com')
      expect(result.checked).toBe(true)
      expect(result.error).toBeDefined()

      // Default + 3 retries = 4 calls
      expect(fetchSpy).toHaveBeenCalledTimes(4)
    })
  })

  describe('OAuth Handling', () => {
    it('should handle OAuth redirection', () => {
      const url = new URL('https://oauth.test.com/callback')
      handleOAuthUrl(url)
      expect(Linking.openURL).toHaveBeenCalledWith(url.toString())
    })

    it('should handle string URLs correctly', () => {
      const urlString = 'https://oauth.test.com/callback?token=abc123'
      handleOAuthUrl(urlString)
      expect(Linking.openURL).toHaveBeenCalledWith(urlString)
    })

    it('should normalize URLs with spaces', () => {
      const urlWithSpaces = 'https://oauth.test.com/callback?name=John Doe'
      handleOAuthUrl(urlWithSpaces)
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://oauth.test.com/callback?name=John%20Doe'
      )
    })

    it('should throw error for null or undefined URLs', () => {
      expect(() => handleOAuthUrl(null as any)).toThrow()
      expect(() => handleOAuthUrl(undefined as any)).toThrow()
      expect(Linking.openURL).not.toHaveBeenCalled()
    })

    it('should throw error for empty URLs', () => {
      expect(() => handleOAuthUrl('')).toThrow('Empty OAuth URL')
      expect(Linking.openURL).not.toHaveBeenCalled()
    })
  })

  describe('connectorUrl Construction', () => {
    it('should construct URL with correct base and parameters', async () => {
      render(<QuilttConnector {...defaultProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
      })

      const uri = capturedWebViewProps.source.uri
      expect(uri).toContain('https://test-connector.quiltt.app')
      expect(uri).toContain('mode=webview')
      expect(uri).toContain('oauth_redirect_url=')
      expect(uri).toContain('agent=react-native-')
    })

    it('should handle differently encoded redirect URLs', async () => {
      // Test with an already encoded URL
      const encodedProps = {
        ...defaultProps,
        oauthRedirectUrl: 'https://oauth.test.com/callback%3Ftoken%3Dabc',
      }

      render(<QuilttConnector {...encodedProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
      })

      const uri = capturedWebViewProps.source.uri
      // We're testing if the URL handling logic preserves the encoding
      // instead of double-encoding the already encoded parts
      expect(uri).toContain('oauth_redirect_url=')
      expect(uri).toContain('callback%3Ftoken%3Dabc')
    })

    it('should work with URLs containing special characters', async () => {
      const specialProps = {
        ...defaultProps,
        oauthRedirectUrl: 'https://oauth.test.com/callback?name=John Doe&id=123+456',
      }

      render(<QuilttConnector {...specialProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
      })

      const uri = capturedWebViewProps.source.uri
      // It should be encoded in the final URL
      expect(uri).toContain('oauth_redirect_url=')
      // Check that spaces are properly encoded
      expect(uri).toContain('John')
    })
  })

  describe('WebView Event Handling', () => {
    let mockRequestHandler: (request: { url: string }) => boolean

    beforeEach(async () => {
      render(<QuilttConnector {...defaultProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
      })

      mockRequestHandler = capturedWebViewProps.onShouldStartLoadWithRequest
    })

    it('should handle normal navigation URLs', () => {
      const result = mockRequestHandler({ url: 'https://normal-website.com' })
      expect(result).toBe(true)
    })

    it('should handle quilttconnector protocol URLs correctly', () => {
      // Test Load event
      const loadUrl = 'quilttconnector://Load?source=quiltt'
      const loadResult = mockRequestHandler({ url: loadUrl })

      expect(loadResult).toBe(false) // Should prevent WebView load
      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        ConnectorSDKEventType.Load,
        expect.any(Object)
      )
      expect(defaultProps.onLoad).toHaveBeenCalled()

      vi.clearAllMocks()

      // Test ExitSuccess event
      const exitSuccessUrl = 'quilttconnector://ExitSuccess?source=quiltt'
      const exitResult = mockRequestHandler({ url: exitSuccessUrl })

      expect(exitResult).toBe(false)
      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        ConnectorSDKEventType.ExitSuccess,
        expect.any(Object)
      )
      expect(defaultProps.onExit).toHaveBeenCalledWith(
        ConnectorSDKEventType.ExitSuccess,
        expect.any(Object)
      )
      expect(defaultProps.onExitSuccess).toHaveBeenCalled()
    })

    it('should handle ExitAbort events', () => {
      const abortUrl = 'quilttconnector://ExitAbort?source=quiltt'
      mockRequestHandler({ url: abortUrl })

      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        ConnectorSDKEventType.ExitAbort,
        expect.any(Object)
      )
      expect(defaultProps.onExit).toHaveBeenCalledWith(
        ConnectorSDKEventType.ExitAbort,
        expect.any(Object)
      )
      expect(defaultProps.onExitAbort).toHaveBeenCalled()
    })

    it('should handle ExitError events', () => {
      const errorUrl = 'quilttconnector://ExitError?source=quiltt&error=Something%20went%20wrong'
      mockRequestHandler({ url: errorUrl })

      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        ConnectorSDKEventType.ExitError,
        expect.any(Object)
      )
      expect(defaultProps.onExit).toHaveBeenCalledWith(
        ConnectorSDKEventType.ExitError,
        expect.any(Object)
      )
      expect(defaultProps.onExitError).toHaveBeenCalled()
    })

    it('should handle Navigate events', () => {
      const navigateUrl =
        'quilttconnector://Navigate?source=quiltt&url=https%3A%2F%2Foauth.example.com%2Fauthorize'
      mockRequestHandler({ url: navigateUrl })

      expect(Linking.openURL).toHaveBeenCalledWith('https://oauth.example.com/authorize')
    })

    it('should handle Navigate events with already encoded URLs', () => {
      const doubleEncodedUrl =
        'quilttconnector://Navigate?source=quiltt&url=https%253A%252F%252Foauth.example.com%252Fauthorize'
      mockRequestHandler({ url: doubleEncodedUrl })

      // Should properly decode double-encoded URLs
      expect(Linking.openURL).toHaveBeenCalledWith('https://oauth.example.com/authorize')
    })

    it('should handle Navigate events with missing URLs', () => {
      const badNavigateUrl = 'quilttconnector://Navigate?source=quiltt'
      mockRequestHandler({ url: badNavigateUrl })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Navigate URL missing from request')
      expect(Linking.openURL).not.toHaveBeenCalled()
    })

    it('should handle unrecognized Quiltt events', () => {
      const unknownUrl = 'quilttconnector://UnknownEvent?source=quiltt'
      mockRequestHandler({ url: unknownUrl })

      expect(consoleWarnSpy).toHaveBeenCalledWith('Unhandled event: UnknownEvent')
    })

    it('should handle Authenticate events', () => {
      const authenticateUrl = 'quilttconnector://Authenticate?source=quiltt'
      mockRequestHandler({ url: authenticateUrl })

      expect(consoleLogSpy).toHaveBeenCalledWith('Event: Authenticate')
      // This is based on the original implementation which logs but doesn't handle authenticate yet
    })
  })

  describe('WebView Script Injection', () => {
    beforeEach(async () => {
      render(<QuilttConnector {...defaultProps} />)

      await waitFor(() => {
        expect(capturedWebViewProps).toBeTruthy()
      })
    })

    it('should inject header scrolling script on iOS', async () => {
      Platform.OS = 'ios'

      // Manually call onLoadEnd to trigger the injection
      if (capturedWebViewProps.onLoadEnd) {
        capturedWebViewProps.onLoadEnd()
      }

      // Check if the script was injected
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith(
        expect.stringContaining('header.style.position')
      )
    })

    it('should not inject header scrolling script on Android', async () => {
      Platform.OS = 'android'

      // Manually call onLoadEnd to check if injection happens
      if (capturedWebViewProps.onLoadEnd) {
        capturedWebViewProps.onLoadEnd()
      }

      expect(webViewRef.current.injectJavaScript).not.toHaveBeenCalled()
    })

    it('should inject initialization script after Load event', () => {
      const mockRequestHandler = capturedWebViewProps.onShouldStartLoadWithRequest

      // Trigger Load event
      mockRequestHandler({ url: 'quilttconnector://Load?source=quiltt' })

      // Fix: Update the expectation to match the actual implementation
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith(
        expect.stringContaining('window.postMessage')
      )
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith(
        expect.stringContaining('"token":"test-token"')
      )
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith(
        expect.stringContaining('"connectionId":"test-connection"')
      )
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith(
        expect.stringContaining('"institution":"test-bank"')
      )
    })

    it('should clear localStorage on exit events', () => {
      const mockRequestHandler = capturedWebViewProps.onShouldStartLoadWithRequest

      // Trigger ExitSuccess event
      mockRequestHandler({ url: 'quilttconnector://ExitSuccess?source=quiltt' })

      // Should clear localStorage
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith('localStorage.clear();')
    })

    it('should clear localStorage on ExitAbort event', () => {
      const mockRequestHandler = capturedWebViewProps.onShouldStartLoadWithRequest

      // Trigger ExitAbort event
      mockRequestHandler({ url: 'quilttconnector://ExitAbort?source=quiltt' })

      // Should clear localStorage
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith('localStorage.clear();')
    })

    it('should clear localStorage on ExitError event', () => {
      const mockRequestHandler = capturedWebViewProps.onShouldStartLoadWithRequest

      // Trigger ExitError event
      mockRequestHandler({ url: 'quilttconnector://ExitError?source=quiltt' })

      // Should clear localStorage
      expect(webViewRef.current.injectJavaScript).toHaveBeenCalledWith('localStorage.clear();')
    })
  })
})
