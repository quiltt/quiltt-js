/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import reactNative from 'vitest-react-native'

export default defineConfig({
  test: {
    setupFiles: ['./setupTests.tsx'],
    globals: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    environment: 'node',
    server: {
      deps: {
        inline: ['react-native-url-polyfill'],
      },
    },
  },
  plugins: [reactNative(), tsconfigPaths()],
})
