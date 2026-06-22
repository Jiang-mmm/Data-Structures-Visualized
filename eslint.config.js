import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import noHardcodedChineseInJsx from './eslint-rules/no-hardcoded-chinese-in-jsx.js'

// v19 M3 — 本地 ESLint 规则聚合（plugin: 'local'）
const localPlugin = {
  rules: {
    'no-hardcoded-chinese-in-jsx': noHardcodedChineseInJsx,
  },
}

export default tseslint.config(
  { ignores: ['dist', '.agents', 'coverage', 'node_modules', 'eslint-rules/**'] },
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
  // v19 M3 — local plugin 注册：no-hardcoded-chinese-in-jsx
  // 范围：src/{pages,components,visualizers,layouts}/**
  // 跳过：i18n / tests / hooks / utils / configs（历史硬编码密度大，按 M4-M7 顺序迁移）
  {
    files: ['src/pages/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/visualizers/**/*.{ts,tsx}'],
    plugins: { local: localPlugin },
    rules: {
      // 默认 'warn'，避免 v17 GA 现有硬编码全部 fail；M4 阶段逐步迁移后可调整为 'error'
      'local/no-hardcoded-chinese-in-jsx': ['warn', { minLength: 2, allowList: [] }],
    },
  },
)
