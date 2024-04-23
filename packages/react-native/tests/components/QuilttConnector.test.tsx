import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react-native'
import { QuilttConnector, checkConnectorUrl } from '@/components/QuilttConnector'

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
  }
})

vi.mock('react-native-webview', () => ({
  WebView: 'WebView',
}))

// Mocking the checkConnectorUrl function directly
vi.mock('checkConnectorUrl', () => {
  return {
    checked: false,
    error: 'Error occurred',
  }
})

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
    await expect(getByTestId('loading-screen')).toBeTruthy()
  })

  //   it('should display error screen when pre-flight check fails', async () => {
  //     const { getByTestId } = render(<QuilttConnector testId="quiltt-connector" {...props} />)

  //     vi.spyOn(checkConnectorUrl, '')
  //     expect(checkConnectorUrl).toHaveBeenCalled()
  //     expect(await getByTestId('error-screen')).toBeTruthy()
  //   })
})
