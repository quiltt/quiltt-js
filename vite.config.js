import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['json', 'lcov'],
      include: ['**/src/**/*.ts', '**/src/**/*.tsx'],
      exclude: [
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
      ],
    },
  },
});
