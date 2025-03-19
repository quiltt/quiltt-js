import { render, waitFor } from '@testing-library/react-native'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'

import { Linking, Platform } from 'react-native'

import { QuilttConnector, checkConnectorUrl, handleOAuthUrl } from '@/components/QuilttConnector'

// Store WebView props for testing
let capturedWebViewProps: any = null

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
    return null
  },
}))

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

// Helper to create a mock Response
const createMockResponse = (status: number, body: any): Response => {
  return new Response(JSON.stringify(body), {
    status: status,
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

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    vi.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true))
    capturedWebViewProps = null

    // Mock successful fetch for all tests by default
    fetchSpy.mockResolvedValue(createMockResponse(200, { ok: true }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('WebView Platform-Specific Props', () => {
    beforeEach(() => {
      // Mock successful fetch for all WebView tests
      fetchSpy.mockResolvedValue(createMockResponse(200, { ok: true }))

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

    it('should render ErrorScreen on pre-flight check failure', async () => {
      // Mock fetch to reject with a specific error after retries
      fetchSpy.mockRejectedValue(new Error('Network error'))

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
  })

  describe('URL Checking', () => {
    it('should handle routable URL successfully', async () => {
      fetchSpy.mockResolvedValue(createMockResponse(200, { ok: true }))
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
  })

  describe('OAuth Handling', () => {
    it('should handle OAuth redirection', () => {
      const url = new URL('https://oauth.test.com/callback')
      handleOAuthUrl(url)
      expect(Linking.openURL).toHaveBeenCalledWith(url.toString())
    })
  })
})
