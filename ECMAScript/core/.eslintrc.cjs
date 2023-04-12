const prettierConfig = require('./prettier.config.cjs')

export default {
  root: true,
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', prettierConfig],
  },
}
