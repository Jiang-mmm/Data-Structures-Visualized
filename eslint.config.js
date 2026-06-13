import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.agents', 'coverage', 'node_modules']),
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
  {
    files: ['src/__tests__/**', 'src/__tests__/*'],
    languageOptions: {
      globals: { ...globals.browser, beforeEach: true, afterEach: true, describe: true, it: true, expect: true, vi: true },
    },
  },
  {
    files: ['e2e/**', 'e2e/*'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, process: true },
    },
    rules: {
      'no-empty': 'off',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    },
  },
])
