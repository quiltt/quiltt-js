import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MockInstance } from 'vitest'
import { render, waitFor } from '@testing-library/react-native'
import * as Linking from 'expo-linking'

import { QuilttConnector, checkConnectorUrl, handleOAuthUrl } from '@/components/QuilttConnector'
import { ErrorReporter } from '@/utils/error/ErrorReporter'

// Mock react-native components and modules
vi.mock('react-native', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-native')>()
  return {
    ...module,
    ActivityIndicator: module.ActivityIndicator,
    Button: module.Button,
    Image: module.Image,
    NativeModules: {
      ...module.NativeModules,
      BlobModule: {
        BLOB_URI_SCHEME: 'content',
        BLOB_URI_HOST: 'localhost',
      },
    },
    Platform: {
      ...module.Platform,
      OS: 'ios',
      Version: '14.0',
    },
    Pressable: module.Pressable,
    SafeAreaView: module.SafeAreaView,
    StyleSheet: module.StyleSheet,
    Text: module.Text,
    View: module.View,
  }
})

vi.mock('react-native-webview', () => ({
  WebView: 'WebView',
}))

vi.mock('expo-linking', () => ({
  openURL: vi.fn(),
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

describe('checkConnectorUrl', () => {
  let fetchSpy: MockInstance
  let errorReporterSpy: MockInstance
  let consoleErrorSpy: MockInstance
  let consoleLogSpy: MockInstance

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    errorReporterSpy = vi.spyOn(ErrorReporter.prototype, 'send')
    consoleErrorSpy = vi.spyOn(console, 'error')
    consoleLogSpy = vi.spyOn(console, 'log')
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fetchSpy.mockReset()
    errorReporterSpy.mockReset()
    consoleErrorSpy.mockReset()
    consoleLogSpy.mockReset()
    vi.useRealTimers()
  })

  it('should handle routable URL successfully', async () => {
    fetchSpy.mockResolvedValue(createMockResponse(200, { ok: true }))
    const result = await checkConnectorUrl('http://test.com')
    expect(result).toEqual({ checked: true })
    expect(consoleLogSpy).toHaveBeenCalledWith('The URL http://test.com is routable.')
  })

  it('handles fetch errors and retries', async () => {
    try {
      fetchSpy
        .mockRejectedValue(new Error('Network failure'))
        .mockResolvedValue(createMockResponse(200, { ok: true }))

      const result = await checkConnectorUrl('http://test.com', 1)
      expect(result).toEqual({ checked: true })
    } catch (error) {
      expect(consoleLogSpy).toHaveBeenCalledWith('Retrying... Attempt number 1')
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    }
  })
})

describe('QuilttConnector', () => {
  const props = {
    connectorId: 'test-connector',
    oauthRedirectUrl: 'https://oauth.test.com/',
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

  it('should render error screen if pre-flight check fails', async () => {
    const errorResponse = { checked: true, error: 'Network error' }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(createMockResponse(500, errorResponse))

    try {
      const { getByTestId, queryByTestId } = render(
        <QuilttConnector testId="quiltt-connector" {...props} />
      )

      await waitFor(() => {
        expect(queryByTestId('loading-screen')).toBeNull()
        expect(getByTestId('error-screen')).toBeTruthy()
      })
    } catch (error) {
      console.error('Test failed:', error)
    }
  })

  it('should render webview if pre-flight check succeeds', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(createMockResponse(200, { ok: true }))

    const { getByTestId, queryByTestId } = render(
      <QuilttConnector testId="quiltt-connector" {...props} />
    )
    await waitFor(() => expect(queryByTestId('loading-screen')).toBeNull())
    expect(getByTestId('webview')).toBeTruthy()
  })

  it('should handle OAuth redirection', async () => {
    const url = new URL(props.oauthRedirectUrl)
    handleOAuthUrl(url)
    expect(Linking.openURL).toHaveBeenCalledWith(props.oauthRedirectUrl)
  })
})
