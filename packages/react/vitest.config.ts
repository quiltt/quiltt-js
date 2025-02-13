import { defineProject } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineProject({
  plugins: [react(), tsconfigPaths()],
  test: {
    setupFiles: ['./vitest.setup.tsx'],
    environment: 'happy-dom',
  },
})
