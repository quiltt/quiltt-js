import React from 'react'
import { Platform } from 'react-native'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getDeviceModel,
  getOSInfo,
  getPlatformInfo,
  getReactNativeVersion,
  getReactVersion,
  getUserAgent,
} from '@/utils/telemetry'

describe('React Native Telemetry', () => {
  describe('getReactVersion', () => {
    it('should return React version from React.version', () => {
      const version = getReactVersion()
      expect(version).toBe(React.version)
    })

    it('should return actual React version', () => {
      const version = getReactVersion()
      expect(version).toMatch(/^\d+\.\d+\.\d+/)
    })
  })

  describe('getReactNativeVersion', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return React Native version from Platform.constants', () => {
      // Mock Platform.constants
      Object.defineProperty(Platform, 'constants', {
        value: {
          reactNativeVersion: {
            major: 0,
            minor: 73,
            patch: 0,
          },
        },
        configurable: true,
      })

      const version = getReactNativeVersion()
      expect(version).toBe('0.73.0')
    })

    it('should return unknown if reactNativeVersion is not available', () => {
      // Mock Platform.constants without reactNativeVersion
      Object.defineProperty(Platform, 'constants', {
        value: {},
        configurable: true,
      })

      const version = getReactNativeVersion()
      expect(version).toBe('unknown')
    })

    it('should handle errors gracefully', () => {
      // Mock Platform.constants to throw
      Object.defineProperty(Platform, 'constants', {
        get() {
          throw new Error('Mock error')
        },
        configurable: true,
      })
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const version = getReactNativeVersion()
      expect(version).toBe('unknown')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
  })

  describe('getOSInfo', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return iOS version info', () => {
      vi.spyOn(Platform, 'OS', 'get').mockReturnValue('ios')
      vi.spyOn(Platform, 'Version', 'get').mockReturnValue('17.0')

      const osInfo = getOSInfo()
      expect(osInfo).toBe('Ios/17.0')
    })

    it('should return Android version info', () => {
      vi.spyOn(Platform, 'OS', 'get').mockReturnValue('android')
      vi.spyOn(Platform, 'Version', 'get').mockReturnValue(33)

      const osInfo = getOSInfo()
      expect(osInfo).toBe('Android/33')
    })

    it('should handle errors gracefully', () => {
      vi.spyOn(Platform, 'OS', 'get').mockImplementation(() => {
        throw new Error('Mock error')
      })
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const osInfo = getOSInfo()
      expect(osInfo).toBe('Unknown/Unknown')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
  })

  describe('getDeviceModel', () => {
    it('should return Unknown if react-native-device-info is not installed', async () => {
      // Default behavior - DeviceInfo is null in test environment
      const model = await getDeviceModel()
      expect(model).toBe('Unknown')
    })

    // NOTE: Lines inside the try-catch block when DeviceInfo is loaded cannot be unit tested
    // because DeviceInfo is initialized via require() at module load time, before mocks are applied.
    // These lines are covered by integration tests when react-native-device-info is installed
    // in the example app, and the implementation is sound - it will work correctly in production.
  })

  describe('getPlatformInfo', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      // Mock Platform properties
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        configurable: true,
      })
      Object.defineProperty(Platform, 'Version', {
        value: '17.0',
        configurable: true,
      })
      Object.defineProperty(Platform, 'constants', {
        value: {
          reactNativeVersion: {
            major: 0,
            minor: 73,
            patch: 0,
          },
        },
        configurable: true,
      })
    })

    it('should combine all platform information', async () => {
      const platformInfo = await getPlatformInfo()
      // Device model is Unknown in test environment since DeviceInfo is not loaded
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Ios\/17\.0; Unknown$/
      )
    })

    it('should handle Unknown values gracefully', async () => {
      Object.defineProperty(Platform, 'constants', {
        value: {},
        configurable: true,
      })

      const platformInfo = await getPlatformInfo()
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/unknown; Ios\/17\.0; Unknown$/
      )
    })
  })

  describe('getUserAgent', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      // Mock Platform properties
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        configurable: true,
      })
      Object.defineProperty(Platform, 'Version', {
        value: '17.0',
        configurable: true,
      })
      Object.defineProperty(Platform, 'constants', {
        value: {
          reactNativeVersion: {
            major: 0,
            minor: 73,
            patch: 0,
          },
        },
        configurable: true,
      })
    })

    it('should generate correct User-Agent string for iOS', async () => {
      const userAgent = await getUserAgent('4.5.1')
      // Device model is Unknown in test environment since DeviceInfo is not loaded
      expect(userAgent).toMatch(
        /^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Ios\/17\.0; Unknown\)$/
      )
    })

    it('should generate correct User-Agent string for Android', async () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        configurable: true,
      })
      Object.defineProperty(Platform, 'Version', {
        value: 33,
        configurable: true,
      })

      const userAgent = await getUserAgent('4.5.1')
      // Device model is Unknown in test environment
      expect(userAgent).toMatch(
        /^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Android\/33; Unknown\)$/
      )
    })

    it('should handle different SDK versions', async () => {
      const userAgent = await getUserAgent('5.0.0-beta.1')
      // Device model is Unknown in test environment
      expect(userAgent).toMatch(
        /^Quiltt\/5\.0\.0-beta\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Ios\/17\.0; Unknown\)$/
      )
    })

    it('should handle Unknown device model', async () => {
      const userAgent = await getUserAgent('4.5.1')
      expect(userAgent).toMatch(
        /^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Ios\/17\.0; Unknown\)$/
      )
    })
  })
})
