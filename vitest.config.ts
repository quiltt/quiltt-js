import { defineConfig, mergeConfig } from 'vitest/config'

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import reactNative from 'vitest-react-native'

export default defineConfig({
  test: {
    projects: [
      // core
      mergeConfig(
        { plugins: [tsconfigPaths()] },
        {
          test: {
            extends: true,
            name: 'core',
            include: ['packages/core/**/*.test.{ts,tsx}'],
            environment: 'happy-dom',
          },
        }
      ),
      // react
      mergeConfig(
        { plugins: [tsconfigPaths(), react()] },
        {
          test: {
            extends: true,
            name: 'react',
            include: ['packages/react/**/*.test.{ts,tsx}'],
            setupFiles: ['packages/react/vitest.setup.tsx'],
            environment: 'happy-dom',
          },
        }
      ),
      // react-native
      mergeConfig(
        { plugins: [tsconfigPaths(), reactNative()] },
        {
          test: {
            extends: true,
            name: 'react-native',
            include: ['packages/react-native/**/*.test.{ts,tsx}'],
            setupFiles: ['packages/react-native/vitest.setup.tsx'],
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
        }
      ),
    ],

    // Shared configurations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environment: 'node',
    isolate: false,
    includeTaskLocation: true,
    globals: true,
    chaiConfig: {
      truncateThreshold: 80,
    },

    coverage: {
      provider: 'istanbul',
      reporter: ['json', 'lcov'],
      include: ['**/src/**/*.ts', '**/src/**/*.tsx'],
      exclude: [
        '**/src/**/index.ts',
        '**/node_modules/**',
        '**/test/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.config.js',
        '**/*.config.ts',
        '**/*.workspace.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/example/**/*',
        '**/examples/**/*',
        '**/browser.ts',
      ],
    },
  },
})
