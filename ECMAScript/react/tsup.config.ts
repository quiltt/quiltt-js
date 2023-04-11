import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/**/*.ts'],
  target: 'es6',
  format: ['cjs', 'esm'],
  splitting: false,
  treeshake: false,
  clean: true,
  sourcemap: !options.watch,
  minify: !options.watch,
  external: ['react', 'react-dom'],
  dts: true,
  tsconfig: './tsconfig.json'
}))
