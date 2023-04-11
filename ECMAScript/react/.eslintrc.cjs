const prettierConfig = require('./prettier.config.cjs')

const reactPatterns = {
  files: ['*.{jsx,tsx}'],
}

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
  overrides: [
    {
      files: reactPatterns.files,
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
      ],
      rules: {
        'sort-imports': 'off',
        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md
        'react/no-unescaped-entities': ['error', { forbid: ['>'] }],
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        // Fine-tune naming convention react typescript jsx (function components)
        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            ignoreRestSiblings: true,
            argsIgnorePattern: 'res|response|resolve|reject|done|next|err|error|^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
}
