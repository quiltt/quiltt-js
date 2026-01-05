/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 50000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ios/reactnativeexpo.xcworkspace -scheme reactnativeexpo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build SWIFT_VERSION=5.0 -quiet COMPILER_INDEX_STORE_ENABLE=NO',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/reactnativeexpo.app',
    },
    'android.debug': {
      type: 'android.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    },
  },
  behavior: {
    init: {
      exposeGlobals: true,
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_API_34_AOSP',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emulator.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
}
