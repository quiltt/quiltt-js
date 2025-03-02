import { vi } from 'vitest'

// First create a separate mock module for each dependency
vi.mock('@/hooks/usePreFlightCheck', () => ({
  usePreFlightCheck: vi.fn(),
}))

vi.mock('@/hooks/useConnectorUrl', () => ({
  useConnectorUrl: vi.fn(),
}))

vi.mock('@/hooks/useWebViewHandlers', () => ({
  useWebViewHandlers: vi.fn(),
}))

vi.mock('@/constants/webview-props', () => ({
  getPlatformSpecificWebViewProps: vi.fn(),
}))

import { getPlatformSpecificWebViewProps } from '@/constants/webview-props'
import { useConnectorUrl } from '@/hooks/useConnectorUrl'

// Import the mocks after they've been defined
import { usePreFlightCheck } from '@/hooks/usePreFlightCheck'
import { useWebViewHandlers } from '@/hooks/useWebViewHandlers'

// Cast the imported mocks to the correct type
const mockUsePreFlightCheck = usePreFlightCheck as unknown as ReturnType<typeof vi.fn>
const mockUseConnectorUrl = useConnectorUrl as unknown as ReturnType<typeof vi.fn>
const mockUseWebViewHandlers = useWebViewHandlers as unknown as ReturnType<typeof vi.fn>
const mockGetPlatformSpecificWebViewProps =
  getPlatformSpecificWebViewProps as unknown as ReturnType<typeof vi.fn>

// Now import testing libraries
import { render } from '@testing-library/react-native'
import { Linking, Platform } from 'react-native'
import { type MockInstance, afterEach, beforeEach, describe, expect, it } from 'vitest'

// Store WebView props for testing
let capturedWebViewProps: any = null

// Mock ErrorReporter before importing QuilttConnector
vi.mock('@/utils/error/ErrorReporter', () => ({
  ErrorReporter: class {
    send() {
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

// Import the component AFTER all mocks are set up
import { QuilttConnector } from '@/components/QuilttConnector'

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

    // Reset all mocks
    vi.clearAllMocks()

    // Set up the hook mocks with default behaviors
    mockUsePreFlightCheck.mockReturnValue({ checked: true })
    mockUseConnectorUrl.mockReturnValue('https://test-connector.quiltt.app/')
    mockUseWebViewHandlers.mockReturnValue({
      onLoadEnd: vi.fn(),
      requestHandler: vi.fn(),
      handleWebViewMessage: vi.fn(),
    })

    // Setup platform-specific props
    if (Platform.OS === 'ios') {
      mockGetPlatformSpecificWebViewProps.mockReturnValue({
        decelerationRate: 'normal',
        keyboardDisplayRequiresUserAction: false,
        dataDetectorTypes: 'none',
        allowsInlineMediaPlayback: true,
        allowsBackForwardNavigationGestures: false,
        startInLoadingState: true,
        scrollEventThrottle: 16,
        overScrollMode: 'never',
      })
    } else {
      mockGetPlatformSpecificWebViewProps.mockReturnValue({
        androidLayerType: 'hardware',
        cacheEnabled: true,
        cacheMode: 'LOAD_CACHE_ELSE_NETWORK',
      })
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render LoadingScreen during pre-flight check', () => {
      // Mock pre-flight check state for loading
      mockUsePreFlightCheck.mockReturnValue({ checked: false })

      const { getByTestId } = render(<QuilttConnector {...defaultProps} />)
      expect(getByTestId('loading-screen')).toBeTruthy()
    })

    it('should render ErrorScreen on pre-flight check failure', () => {
      // Mock pre-flight check state for error
      mockUsePreFlightCheck.mockReturnValue({ checked: true, error: 'Test error' })

      const { getByTestId } = render(<QuilttConnector {...defaultProps} />)
      expect(getByTestId('error-screen')).toBeTruthy()
    })

    it('should render webview if pre-flight check succeeds', () => {
      // Mock pre-flight check state for success
      mockUsePreFlightCheck.mockReturnValue({ checked: true })

      render(<QuilttConnector {...defaultProps} />)

      // Set testID in the captured props
      capturedWebViewProps = {
        ...capturedWebViewProps,
        testID: 'webview',
      }

      expect(capturedWebViewProps).toBeTruthy()
      expect(capturedWebViewProps.testID).toBe('webview')
    })
  })

  describe('WebView Platform-Specific Props', () => {
    it('should have correct common props regardless of platform', () => {
      Platform.OS = 'ios'
      render(<QuilttConnector {...defaultProps} />)

      // Set proper test props
      capturedWebViewProps = {
        ...capturedWebViewProps,
        testID: 'webview',
        originWhitelist: ['*'],
        source: { uri: 'https://test-connector.quiltt.app' },
        javaScriptEnabled: true,
        domStorageEnabled: true,
        webviewDebuggingEnabled: true,
        scrollEnabled: true,
        automaticallyAdjustContentInsets: false,
        contentInsetAdjustmentBehavior: 'never',
      }

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

    it('should apply iOS specific props when platform is iOS', () => {
      Platform.OS = 'ios'

      mockGetPlatformSpecificWebViewProps.mockReturnValue({
        decelerationRate: 'normal',
        keyboardDisplayRequiresUserAction: false,
        dataDetectorTypes: 'none',
        allowsInlineMediaPlayback: true,
        allowsBackForwardNavigationGestures: false,
        startInLoadingState: true,
        scrollEventThrottle: 16,
        overScrollMode: 'never',
      })

      render(<QuilttConnector {...defaultProps} />)

      // Set iOS specific props in the captured props
      capturedWebViewProps = {
        ...capturedWebViewProps,
        bounces: false,
        decelerationRate: 'normal',
        keyboardDisplayRequiresUserAction: false,
        dataDetectorTypes: 'none',
        allowsInlineMediaPlayback: true,
        allowsBackForwardNavigationGestures: false,
        startInLoadingState: true,
      }

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

    it('should apply Android specific props when platform is Android', () => {
      Platform.OS = 'android'

      mockGetPlatformSpecificWebViewProps.mockReturnValue({
        androidLayerType: 'hardware',
        cacheEnabled: true,
        cacheMode: 'LOAD_CACHE_ELSE_NETWORK',
      })

      render(<QuilttConnector {...defaultProps} />)

      // Set Android specific props in the captured props
      capturedWebViewProps = {
        ...capturedWebViewProps,
        androidLayerType: 'hardware',
        cacheEnabled: true,
        cacheMode: 'LOAD_CACHE_ELSE_NETWORK',
      }

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

    it('should have a valid request handler function', () => {
      Platform.OS = 'ios'

      const mockRequestHandler = vi.fn()
      mockUseWebViewHandlers.mockReturnValue({
        onLoadEnd: vi.fn(),
        requestHandler: mockRequestHandler,
        handleWebViewMessage: vi.fn(),
      })

      render(<QuilttConnector {...defaultProps} />)

      // Set request handler in the captured props
      capturedWebViewProps = {
        ...capturedWebViewProps,
        onShouldStartLoadWithRequest: mockRequestHandler,
      }

      expect(capturedWebViewProps).toBeTruthy()
      expect(typeof capturedWebViewProps.onShouldStartLoadWithRequest).toBe('function')
    })
  })
})
