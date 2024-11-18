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
        type: 'iPhone 16 Pro',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
  },
}
