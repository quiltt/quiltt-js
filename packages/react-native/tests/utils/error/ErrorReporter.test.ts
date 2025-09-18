import type { MockInstance } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorReporter } from '@/utils/error/ErrorReporter'

import { version } from '../../../package.json'

// Mock fetch in the global environment
global.fetch = vi.fn()

// Helper to create a mock Response
const createMockResponse = (status: number, body: any): Response => {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('ErrorReporter', () => {
  let errorReporter: ErrorReporter
  let consoleInfoSpy: MockInstance
  let consoleWarnSpy: MockInstance
  let consoleErrorSpy: MockInstance

  beforeEach(() => {
    vi.resetAllMocks()
    errorReporter = new ErrorReporter('test-platform')

    consoleInfoSpy = vi.spyOn(console, 'info')
    consoleWarnSpy = vi.spyOn(console, 'warn')
    consoleErrorSpy = vi.spyOn(console, 'error')
  })

  afterEach(() => {
    // Clear spies if needed after each test
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('initializes with correct properties', async () => {
    const error = new Error('Test')
    const payload = await errorReporter.buildPayload(error)

    expect(payload).toMatchObject({
      notifier: {
        name: 'Quiltt React Native SDK Reporter',
        version: version.toString(),
        url: 'https://www.quiltt.dev/connector/sdk/react-native',
      },
      server: {
        environment_name: `react-native-sdk ${version.toString()}; test-platform`,
      },
    })

    const testError = new Error('Test')
    const mockResponse = createMockResponse(201, { id: '12345' })
    vi.mocked(global.fetch).mockResolvedValue(mockResponse)

    await errorReporter.notify(testError)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.honeybadger.io/v1/notices',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': `react-native-sdk ${version.toString()}; test-platform`,
          'X-API-Key': '',
        }),
      })
    )
  })

  it('builds the correct payload for an error', async () => {
    const testError = new Error('Test error')
    const context = { additional: 'info' }
    const payload = await errorReporter.buildPayload(testError, context)

    expect(payload?.notifier).toBeDefined()
    expect(payload?.error?.class).toBe('Error')
    expect(payload?.error?.message).toBe('Test error')
    expect(payload?.request?.context).toEqual(context)
  })

  it('sends an error report correctly', async () => {
    const mockResponse = createMockResponse(201, { id: '12345' })

    vi.mocked(global.fetch).mockResolvedValue(mockResponse)

    const testError = new Error('Test error')
    await errorReporter.notify(testError)

    expect(fetch).toHaveBeenCalledWith(
      'https://api.honeybadger.io/v1/notices',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      })
    )
  })

  it('logs an info message when the error report is successfully sent', async () => {
    try {
      const mockResponse = createMockResponse(201, { id: '12345' })
      vi.mocked(global.fetch).mockResolvedValue(mockResponse)

      const testError = new Error('Test error')
      await errorReporter.notify(testError) // Ensure this await is effectively waiting for completion
    } catch (_error) {
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'Error report sent ⚡ https://app.honeybadger.io/notice/12345'
      )
    }
  })

  it('warns if the error report fails to send', async () => {
    try {
      const mockResponse = createMockResponse(500, { error: 'Server Error' })
      vi.mocked(global.fetch).mockResolvedValue(mockResponse)

      const testError = new Error('Test error')
      await errorReporter.notify(testError)
    } catch (_error) {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error report failed: unknown response from server. code=500'
      )
    }
  })

  it('handles fetch throwing an exception', async () => {
    try {
      const error = new Error('Network failure')
      vi.mocked(global.fetch).mockRejectedValue(error)
    } catch (error) {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Network error occurred while sending error report:',
        error
      )
    }
  })
})
