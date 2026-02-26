import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorReporter } from '@/utils/error/ErrorReporter'
import { version } from '@/version'

// Create mock client object
const mockHoneybadgerClient = {
  setContext: vi.fn(),
  notify: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn(),
}

// Mock @honeybadger-io/react-native module
vi.mock('@honeybadger-io/react-native', () => ({
  default: {
    factory: vi.fn(() => mockHoneybadgerClient),
  },
}))

describe('ErrorReporter', () => {
  let errorReporter: ErrorReporter
  let consoleWarnSpy: MockInstance
  let consoleErrorSpy: MockInstance
  const testSDKAgent = `Quiltt/${version} (React/18.2.0; ReactNative/0.73.0; iOS/17.0; iPhone14,2)`

  beforeEach(() => {
    vi.clearAllMocks()
    errorReporter = new ErrorReporter(testSDKAgent)

    consoleWarnSpy = vi.spyOn(console, 'warn')
    consoleErrorSpy = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('initializes with correct Honeybadger configuration', async () => {
    const { default: Honeybadger } = await import('@honeybadger-io/react-native')

    expect(Honeybadger.factory).toHaveBeenCalledWith({
      apiKey: '',
      environment: testSDKAgent,
      revision: version,
      reportData: true,
      enableUncaught: false,
      enableUnhandledRejection: false,
    })
  })

  it('sends an error report with context correctly', async () => {
    const testError = new Error('Test error')
    const context = { additional: 'info', url: 'https://example.com' }

    await errorReporter.notify(testError, context)

    expect(mockHoneybadgerClient.setContext).toHaveBeenCalledWith(context)
    expect(mockHoneybadgerClient.notify).toHaveBeenCalledWith(testError)
    expect(mockHoneybadgerClient.clear).toHaveBeenCalled()
  })

  it('sends an error report without context correctly', async () => {
    const testError = new Error('Test error')

    await errorReporter.notify(testError)

    expect(mockHoneybadgerClient.setContext).not.toHaveBeenCalled()
    expect(mockHoneybadgerClient.notify).toHaveBeenCalledWith(testError)
    expect(mockHoneybadgerClient.clear).not.toHaveBeenCalled()
  })

  it('handles errors during error reporting gracefully', async () => {
    const notifyError = new Error('Notify failed')
    mockHoneybadgerClient.notify.mockRejectedValueOnce(notifyError)

    const testError = new Error('Test error')
    await errorReporter.notify(testError)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ErrorReporter: Failed to send error report',
      notifyError
    )
  })

  it('clears context even when notify fails', async () => {
    const notifyError = new Error('Notify failed')
    mockHoneybadgerClient.notify.mockRejectedValueOnce(notifyError)

    const testError = new Error('Test error')
    const context = { additional: 'info' }

    await errorReporter.notify(testError, context)

    // Context should be set
    expect(mockHoneybadgerClient.setContext).toHaveBeenCalledWith(context)
    // Clear should still be called even though notify failed
    expect(mockHoneybadgerClient.clear).toHaveBeenCalled()
  })

  it('handles case when Honeybadger client is not initialized', async () => {
    const { default: Honeybadger } = await import('@honeybadger-io/react-native')

    // Mock factory to return null to simulate initialization failure
    vi.mocked(Honeybadger.factory).mockReturnValueOnce(null as any)

    const uninitializedReporter = new ErrorReporter(testSDKAgent)
    const testError = new Error('Test error')

    await uninitializedReporter.notify(testError)

    expect(consoleWarnSpy).toHaveBeenCalledWith('ErrorReporter: Honeybadger client not initialized')
    expect(mockHoneybadgerClient.notify).not.toHaveBeenCalled()
  })
})
