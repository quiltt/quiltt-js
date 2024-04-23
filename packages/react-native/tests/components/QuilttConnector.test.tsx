import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react-native'
import { QuilttConnector } from '@/components/QuilttConnector'
import { handleOAuthUrl } from '@/utils/connector/handleOAuthUrl'
import { Linking } from 'react-native'

vi.mock('react-native', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-native')>()
  return {
    ...module,
    Linking: {
      ...module.Linking, // Preserve other methods of Linking if there are any
      openURL: vi.fn(),
    },
    Platform: {
      ...module.Platform,
      OS: vi.fn(() => 'ios'), // Mock the OS as necessary
      Version: vi.fn(() => '14.0'), // Mock the Version as necessary
    },
    NativeModules: {
      ...module.NativeModules, // Preserve other native modules
      BlobModule: {
        // Add or mock specific properties expected by your dependencies
        BLOB_URI_SCHEME: 'content',
        BLOB_URI_HOST: 'localhost',
      },
    },
    StyleSheet: module.StyleSheet,
    View: module.View,
    ActivityIndicator: module.ActivityIndicator,
    SafeAreaView: module.SafeAreaView,
    Text: module.Text,
    Pressable: module.Pressable,
  }
})

vi.mock('react-native-webview', () => ({
  WebView: 'WebView',
}))

// Mocking the checkConnectorUrl function directly
vi.mock('@/utils/connector/checkConnectorUrl', () => ({
  checkConnectorUrl: vi.fn(() => ({
    checked: false,
    error: 'Error occurred',
  })),
}))

describe('QuilttConnector', () => {
  const props = {
    connectorId: 'test-connector',
    oauthRedirectUrl: 'https://oauth.test.com',
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

  it('should initiate pre-flight check and render loading screen if not checked', async () => {
    const { getByTestId } = render(<QuilttConnector testId="quiltt-connector" {...props} />)
    expect(getByTestId('loading-screen')).toBeTruthy()
  })

  // it('should render error screen when pre-flight check fails', async () => {
  //   vi.mock('@/utils/connector/checkConnectorUrl', () => ({
  //     checkConnectorUrl: vi.fn(() => Promise.resolve({ checked: true, error: 'Network Error' })),
  //   }))
  //   const { getByTestId } = render(<QuilttConnector testId="quiltt-connector" {...props} />)
  //   expect(getByTestId('error-screen')).toBeTruthy()
  // })

  // it('should render WebView when pre-flight check succeeds', async () => {
  //   vi.mock('@/utils/connector/checkConnectorUrl', () => ({
  //     checkConnectorUrl: vi.fn(() => Promise.resolve({ checked: true })),
  //   }))
  //   const { getByTestId } = render(<QuilttConnector testId="quiltt-connector" {...props} />)
  //   expect(getByTestId('webview')).toBeTruthy() // You might need to adjust this if your WebView does not use testId
  // })

  it('should handle OAuth redirection', async () => {
    // Assuming `handleOAuthUrl` is correctly wired and exposed for testing
    const url = new URL('https://oauth.test.com/')
    handleOAuthUrl(url)
    expect(Linking.openURL).toHaveBeenCalledWith('https://oauth.test.com/')
  })

  // it('should call onLoad when the WebView loads', () => {
  //   // Simulate the WebView onLoad event
  //   handleQuilttEvent(new URL('quilttconnector://Load'))
  //   expect(props.onLoad).toHaveBeenCalled()
  // })

  // it('should configure WebView with the correct origin whitelist and source', () => {
  //   const { getByTestId } = render(<QuilttConnector testId="quiltt-connector" {...props} />)
  //   const webView = getByTestId('webview') // Assuming you have set testId on your WebView
  //   expect(webView.props.originWhitelist).toEqual(['*'])
  //   expect(webView.props.source).toEqual({ uri: expect.stringContaining('https://') })
  // })
})
