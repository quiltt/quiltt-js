import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    workspace: ['packages/*'],

    // Default configurations that packages can inherit
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

    // Coverage configuration (only available at root level)
    coverage: {
      provider: 'istanbul',
      reporter: ['json', 'lcov'],
      include: ['**/src/**/*.ts', '**/src/**/*.tsx'],
      exclude: [
        '**/src/**/index.ts', // Exclude barrel files
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
        '**/browser.ts', // Only exporting types and interfaces for the browser
        '**/src/api/graphql/links/actioncable/**', // ActionCable files
      ],
    },
  },
})
