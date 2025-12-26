const { withProjectBuildGradle } = require('expo/config-plugins')

/**
 * Config plugin to add packagingOptions to resolve duplicate native library conflicts
 * This is needed for Detox E2E testing with React Native
 *
 * The fix must be applied to ALL subprojects (not just :app) because library modules
 * like react-native-gesture-handler also build test APKs that encounter the same conflict.
 *
 * We use allprojects with afterEvaluate at the TOP of build.gradle so it registers
 * before any project evaluation happens.
 */
const withPackagingOptions = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const allprojectsBlock = `allprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                packagingOptions {
                    pickFirst 'lib/arm64-v8a/libfbjni.so'
                    pickFirst 'lib/armeabi-v7a/libfbjni.so'
                    pickFirst 'lib/x86/libfbjni.so'
                    pickFirst 'lib/x86_64/libfbjni.so'
                    pickFirst 'lib/arm64-v8a/libc++_shared.so'
                    pickFirst 'lib/armeabi-v7a/libc++_shared.so'
                    pickFirst 'lib/x86/libc++_shared.so'
                    pickFirst 'lib/x86_64/libc++_shared.so'
                }
            }
        }
    }
}

`
      // Prepend allprojects block at the very beginning of the root build.gradle
      if (!config.modResults.contents.includes("pickFirst 'lib/arm64-v8a/libfbjni.so'")) {
        config.modResults.contents = allprojectsBlock + config.modResults.contents
      }
    }
    return config
  })
}

module.exports = withPackagingOptions
