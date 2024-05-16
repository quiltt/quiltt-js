/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import reactNative from 'vitest-react-native'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    server: {
      deps: {
        inline: ['react-native-url-polyfill', 'react-native-safari-web-auth'],
      },
    },
  },
  plugins: [reactNative(), tsconfigPaths()],
})
