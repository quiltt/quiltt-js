import React from 'react'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getBrowserInfo, getPlatformInfo, getReactVersion, getUserAgent } from '@/utils/telemetry'

describe('React Telemetry', () => {
  describe('getReactVersion', () => {
    it('should return React version from React.version', () => {
      const version = getReactVersion()
      expect(version).toBe(React.version)
    })

    it('should return actual React version', () => {
      const version = getReactVersion()
      // Should be a version string like "19.2.3"
      expect(version).toMatch(/^\d+\.\d+\.\d+/)
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
  })

  describe('getPlatformInfo', () => {
    it('should combine React version and browser info', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
        configurable: true,
      })

      const platformInfo = getPlatformInfo()
      expect(platformInfo).toMatch(/^React\/\d+\.\d+\.\d+; Chrome\/120$/)
    })

    it('should handle Unknown browser', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const platformInfo = getPlatformInfo()
      expect(platformInfo).toMatch(/^React\/\d+\.\d+\.\d+; Unknown$/)
    })
  })

  describe('getUserAgent', () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
        configurable: true,
      })
    })

    it('should generate correct User-Agent string', () => {
      const userAgent = getUserAgent('4.5.1')
      expect(userAgent).toMatch(/^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; Chrome\/120\)$/)
    })

    it('should handle different SDK versions', () => {
      const userAgent = getUserAgent('5.0.0-beta.1')
      expect(userAgent).toMatch(/^Quiltt\/5\.0\.0-beta\.1 \(React\/\d+\.\d+\.\d+; Chrome\/120\)$/)
    })

    it('should work with Safari browser', () => {
      Object.defineProperty(global.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        writable: true,
        configurable: true,
      })

      const userAgent = getUserAgent('4.5.1')
      expect(userAgent).toMatch(/^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; Safari\/17\)$/)
    })
  })
})
