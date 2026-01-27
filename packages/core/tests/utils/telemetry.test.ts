import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBrowserInfo, getUserAgent } from '@/utils/telemetry'

describe('Core Telemetry', () => {
  describe('getUserAgent', () => {
    it('should generate correct User-Agent string', () => {
      const userAgent = getUserAgent('4.5.1', 'React/19.2.3; Chrome/120')
      expect(userAgent).toBe('Quiltt/4.5.1 (React/19.2.3; Chrome/120)')
    })

    it('should handle version with different formats', () => {
      const userAgent = getUserAgent('5.0.0-beta.1', 'Web')
      expect(userAgent).toBe('Quiltt/5.0.0-beta.1 (Web)')
    })

    it('should handle complex platform info', () => {
      const userAgent = getUserAgent(
        '4.5.1',
        'React/19.2.3; ReactNative/0.73.0; iOS/17.0; iPhone14,2'
      )
      expect(userAgent).toBe(
        'Quiltt/4.5.1 (React/19.2.3; ReactNative/0.73.0; iOS/17.0; iPhone14,2)'
      )
    })
  })

  describe('getBrowserInfo', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should detect Chrome browser', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
        configurable: true,
      })

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Chrome/120')
    })

    it('should detect Safari browser', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        writable: true,
        configurable: true,
      })

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Safari/17')
    })

    it('should detect Firefox browser', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
        writable: true,
        configurable: true,
      })

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Firefox/121')
    })

    it('should detect Edge browser', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        writable: true,
        configurable: true,
      })

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Edge/120')
    })

    it('should return Unknown for unrecognized browsers', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: 'Some Custom Browser/1.0',
        writable: true,
        configurable: true,
      })

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Unknown')
    })

    it('should return Unknown when navigator is undefined', () => {
      const originalNavigator = global.navigator
      // @ts-expect-error - testing undefined navigator
      delete global.navigator

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Unknown')

      global.navigator = originalNavigator
    })

    it('should return Unknown when userAgent is not available', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const browserInfo = getBrowserInfo()
      expect(browserInfo).toBe('Unknown')
    })
  })
})
