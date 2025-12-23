const { withAppBuildGradle } = require('expo/config-plugins')

/**
 * Config plugin to add packagingOptions to resolve duplicate native library conflicts
 * This is needed for Detox E2E testing with React Native
 */
const withPackagingOptions = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const packagingOptions = `
    packagingOptions {
        pickFirst 'lib/arm64-v8a/libfbjni.so'
        pickFirst 'lib/armeabi-v7a/libfbjni.so'
        pickFirst 'lib/x86/libfbjni.so'
        pickFirst 'lib/x86_64/libfbjni.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
    }`

      // Insert packagingOptions inside the android { } block
      // Find the android { block and add packagingOptions before the closing brace
      if (!config.modResults.contents.includes('packagingOptions')) {
        config.modResults.contents = config.modResults.contents.replace(
          /android\s*\{/,
          `android {${packagingOptions}`
        )
      }
    }
    return config
  })
}

module.exports = withPackagingOptions
