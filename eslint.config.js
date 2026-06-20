import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.agents', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
  {
    files: ['src/__tests__/**', 'src/__tests__/*'],
    languageOptions: {
      globals: { ...globals.browser, beforeEach: true, afterEach: true, describe: true, it: true, expect: true, vi: true },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    files: ['e2e/**', 'e2e/*', 'scripts/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, process: true },
    },
    rules: {
      'no-empty': 'off',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
)
