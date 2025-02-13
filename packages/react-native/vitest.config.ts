import { defineProject } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import reactNative from 'vitest-react-native'

export default defineProject({
  plugins: [reactNative(), tsconfigPaths()],
  test: {
    setupFiles: ['./vitest.setup.tsx'],
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
})
