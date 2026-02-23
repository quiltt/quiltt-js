import React from 'react'
import { Platform } from 'react-native'

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock react-native-device-info
vi.mock('react-native-device-info', () => ({
  default: {
    getModel: vi.fn(),
  },
}))

import DeviceInfo from 'react-native-device-info'

import {
  getDeviceModel,
  getOSInfo,
  getPlatformInfo,
  getPlatformInfoSync,
  getReactNativeVersion,
  getReactVersion,
  getSDKAgent,
} from '@/utils/telemetry'

describe('React Native Telemetry', () => {
  beforeEach(() => {
    // Reset and set default mock behavior
    vi.mocked(DeviceInfo.getModel).mockClear()
    vi.mocked(DeviceInfo.getModel).mockResolvedValue('iPhone14,2')
  })

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
      expect(osInfo).toBe('iOS/17.0')
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
    it('should return device model from DeviceInfo', async () => {
      const model = await getDeviceModel()
      expect(model).toBe('iPhone14,2')
    })

    it('should return Unknown if getModel returns null or empty', async () => {
      vi.mocked(DeviceInfo.getModel).mockResolvedValueOnce('')

      const model = await getDeviceModel()
      expect(model).toBe('Unknown')
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(DeviceInfo.getModel).mockRejectedValueOnce(new Error('Mock error'))
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const model = await getDeviceModel()
      expect(model).toBe('Unknown')
      expect(consoleWarnSpy).toHaveBeenCalled()

      consoleWarnSpy.mockRestore()
    })
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
      // Device model comes from mocked DeviceInfo
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; iOS\/17\.0; iPhone14,2$/
      )
    })

    it('should handle Unknown values gracefully', async () => {
      Object.defineProperty(Platform, 'constants', {
        value: {},
        configurable: true,
      })

      const platformInfo = await getPlatformInfo()
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/unknown; iOS\/17\.0; iPhone14,2$/
      )
    })
  })

  describe('getPlatformInfoSync', () => {
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

    it('should combine platform information synchronously with Unknown device', () => {
      const platformInfo = getPlatformInfoSync()
      // Device model is always 'Unknown' in sync version
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; iOS\/17\.0; Unknown$/
      )
    })

    it('should work for Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        configurable: true,
      })
      Object.defineProperty(Platform, 'Version', {
        value: 33,
        configurable: true,
      })

      const platformInfo = getPlatformInfoSync()
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Android\/33; Unknown$/
      )
    })

    it('should handle missing React Native version', () => {
      Object.defineProperty(Platform, 'constants', {
        value: {},
        configurable: true,
      })

      const platformInfo = getPlatformInfoSync()
      expect(platformInfo).toMatch(
        /^React\/\d+\.\d+\.\d+; ReactNative\/unknown; iOS\/17\.0; Unknown$/
      )
    })
  })

  describe('getSDKAgent', () => {
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

    it('should generate correct Quiltt-SDK-Agent string for iOS', async () => {
      const sdkAgent = await getSDKAgent('4.5.1')
      // Device model comes from mocked DeviceInfo
      expect(sdkAgent).toMatch(
        /^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; iOS\/17\.0; iPhone14,2\)$/
      )
    })

    it('should generate correct Quiltt-SDK-Agent string for Android', async () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        configurable: true,
      })
      Object.defineProperty(Platform, 'Version', {
        value: 33,
        configurable: true,
      })

      // Override mock to return Android device model
      vi.mocked(DeviceInfo.getModel).mockResolvedValueOnce('SM-G998B')

      const sdkAgent = await getSDKAgent('4.5.1')
      expect(sdkAgent).toMatch(
        /^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; Android\/33; SM-G998B\)$/
      )
    })

    it('should handle different SDK versions', async () => {
      const sdkAgent = await getSDKAgent('5.0.0-beta.1')
      expect(sdkAgent).toMatch(
        /^Quiltt\/5\.0\.0-beta\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; iOS\/17\.0; iPhone14,2\)$/
      )
    })

    it('should handle device model errors gracefully', async () => {
      vi.mocked(DeviceInfo.getModel).mockRejectedValueOnce(new Error('Mock error'))
      vi.spyOn(console, 'warn').mockImplementation(() => {})

      const sdkAgent = await getSDKAgent('4.5.1')
      expect(sdkAgent).toMatch(
        /^Quiltt\/4\.5\.1 \(React\/\d+\.\d+\.\d+; ReactNative\/0\.73\.0; iOS\/17\.0; Unknown\)$/
      )
    })
  })
})
