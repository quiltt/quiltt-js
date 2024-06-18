import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
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
        '**/browser.ts', // Ignored as we are only exporting types and interfaces for the browser
        '**/src/api/graphql/links/actioncable/**', // ActionCable files
      ],
    },
  },
})
