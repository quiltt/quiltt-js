import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/**/index.ts'],
  target: 'es6',
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: false,
  clean: true,
  sourcemap: !options.watch,
  minify: !options.watch,
  external: ['react', 'react-native'],
  dts: true,
  tsconfig: './tsconfig.json',
}))
