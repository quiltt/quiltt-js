import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { MockInstance } from 'vitest'
import { checkConnectorUrl } from '@/utils/connector/checkConnectorUrl'
import { ErrorReporter } from '@/utils/error'

// Helper to create a mock Response
const createMockResponse = (status: number, body: any): Response => {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Mock the necessary parts
vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '14.4',
  },
}))

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
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Network failure'))
      expect(consoleLogSpy).toHaveBeenCalledWith('Retrying... Attempt number 1')
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    }
  })

  // it('should report non-404 errors', async () => {
  //   fetchSpy.mockResolvedValueOnce(createMockResponse(500, {}))
  //   const result = await checkConnectorUrl('http://test.com')
  //   expect(result.checked).toBe(false)
  //   expect(result.error).toBeDefined()
  //   expect(errorReporterSpy).toHaveBeenCalled()
  //   expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('500'))
  // })

  // it('should retry when URL is not routable', async () => {
  //   fetchSpy.mockResolvedValue(createMockResponse(500, { ok: false }))

  //   const result = await checkConnectorUrl('http://test.com')

  //   expect(result).toEqual({ checked: true })
  //   expect(consoleLogSpy).toHaveBeenCalledWith('Retrying... Attempt number 1')
  //   expect(fetchSpy).toHaveBeenCalledTimes(2)
  // })
})
