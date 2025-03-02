import { Linking } from 'react-native'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getErrorMessage } from '@/utils/error/getErrorMessage'
import { checkConnectorUrl, handleOAuthUrl, isQuilttEvent } from '@/utils/url-helpers'

// Mock Linking
vi.mock('react-native', () => ({
  Linking: { openURL: vi.fn() },
  Platform: { OS: 'ios', Version: '14.0' },
}))

// Mock Error Reporter
vi.mock('@/utils/error/ErrorReporter', () => ({
  ErrorReporter: class {
    send() {
      return Promise.resolve()
    }
  },
}))

// Mock getErrorMessage
vi.mock('@/utils/error/getErrorMessage', () => ({
  getErrorMessage: vi.fn(),
}))

describe('URL Helpers', () => {
  let fetchSpy: any

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch')
    vi.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true))
    vi.clearAllMocks()

    // Setup default mock for getErrorMessage
    vi.mocked(getErrorMessage).mockImplementation((status, error) =>
      status ? `HTTP Error ${status}` : (error?.message ?? 'error')
    )
  })

  describe('checkConnectorUrl', () => {
    it('should handle routable URL successfully', async () => {
      const mockResponse = { ok: true }
      fetchSpy.mockResolvedValue(mockResponse)

      const result = await checkConnectorUrl('https://test.quiltt.app')
      expect(result).toEqual({ checked: true })
    })

    it('should retry on failure', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('First failure')).mockResolvedValueOnce({ ok: true })

      const result = await checkConnectorUrl('https://test.quiltt.app')
      expect(result).toEqual({ checked: true })
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should handle non-routable URL with proper error', async () => {
      // Mock a 404 response
      const mockResponse = { ok: false, status: 404 }
      fetchSpy.mockResolvedValue(mockResponse)

      // Setup error message mock
      vi.mocked(getErrorMessage).mockReturnValue('The URL is not routable')

      const result = await checkConnectorUrl('https://nonexistent.quiltt.app')
      expect(result.checked).toBe(true)
      expect(result.error).toBeDefined()
      expect(result.error).toBe('The URL is not routable')
    })

    it('should give up after max retries', async () => {
      const mockError = new Error('Network failure')
      fetchSpy.mockRejectedValue(mockError)

      // Setup error message mock
      vi.mocked(getErrorMessage).mockReturnValue('Network failure')

      const result = await checkConnectorUrl('https://test.quiltt.app')
      expect(result.checked).toBe(true)
      expect(result.error).toBeDefined()
      expect(result.error).toBe('Network failure')

      // PREFLIGHT_RETRY_COUNT is 3, so we expect 4 calls (1 original + 3 retries)
      expect(fetchSpy).toHaveBeenCalledTimes(4)
    })
  })

  describe('handleOAuthUrl', () => {
    it('should open URL string via Linking', () => {
      const url = 'https://oauth.test.com'
      handleOAuthUrl(url)
      expect(Linking.openURL).toHaveBeenCalledWith(url)
    })

    it('should open URL object via Linking by converting to string', () => {
      const url = new URL('https://oauth.test.com')
      handleOAuthUrl(url)
      expect(Linking.openURL).toHaveBeenCalledWith(url.toString())
    })
  })

  describe('isQuilttEvent', () => {
    it('should return true for quilttconnector protocol URLs', () => {
      const url = new URL('quilttconnector://Load')
      expect(isQuilttEvent(url)).toBe(true)
    })

    it('should return false for http protocol URLs', () => {
      const url = new URL('https://quiltt.app')
      expect(isQuilttEvent(url)).toBe(false)
    })
  })
})
