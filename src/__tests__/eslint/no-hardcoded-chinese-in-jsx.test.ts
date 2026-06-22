/**
 * v19 M3 — no-hardcoded-chinese-in-jsx ESLint 规则测试
 *
 * 测试 ESLint 规则在 JSX 中检测硬编码中文字符串的能力。
 * 用 RuleTester 加载规则，验证：
 * - 应报告 JSX 文本中的中文
 * - 应允许 JSX 文本中的英文/数字/标点
 * - 应允许 JSX 属性中的字符串（如 aria-label）
 * - 应允许 JSX 表达式（如 {t('key')}）
 * - 应允许 allowList 中的字符串
 * - 应跳过 src/i18n/ / src/__tests__/ / e2e/ 等目录
 */

import { describe } from 'vitest'
import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
// @ts-expect-error - 本地 ESLint 规则 .js 无 .d.ts（运行时正常）
import rule from '../../../eslint-rules/no-hardcoded-chinese-in-jsx.js'

// RuleTester 配置：使用 TypeScript parser + JSX 支持
const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
})

describe('eslint rule — no-hardcoded-chinese-in-jsx', () => {
  ruleTester.run('no-hardcoded-chinese-in-jsx', rule, {
    valid: [
      // 1. 纯英文文本
      { code: 'const x = <div>Hello</div>' },

      // 2. 数字文本
      { code: 'const x = <div>123</div>' },

      // 3. 标点文本
      { code: 'const x = <div>...</div>' },

      // 4. JSX 表达式（变量插值）
      { code: 'const x = <div>{name}</div>' },

      // 5. JSX 表达式（函数调用）
      { code: 'const x = <div>{t("common.ok")}</div>' },

      // 6. JSX 表达式（条件）
      { code: 'const x = <div>{condition ? "yes" : "no"}</div>' },

      // 7. JSX 属性中的英文（aria-label）
      { code: 'const x = <button aria-label="Click me">x</button>' },

      // 8. JSX 属性中的中文应该被允许（属性不是 UI 文本）
      // 注意：规则只检查 JSX 文本 children，不检查属性
      { code: 'const x = <div data-foo="你好">Hello</div>' },

      // 9. 模板字符串（不在 JSX 内的）
      { code: 'const x = `Hello ${name}`' },

      // 10. minLength 阈值：单字符不应报告（minLength: 2）
      {
        code: 'const x = <div>a 你 b</div>',
        options: [{ minLength: 2 }],
      },

      // 11. 允许英文字符 + 数字混合（无连续中文）
      { code: 'const x = <div>Hello 2024</div>' },

      // 12. 嵌套 JSX 全部使用表达式
      { code: 'const x = <div><span>{value}</span><b>{label}</b></div>' },
    ],

    invalid: [
      // 1. JSX 文本中的中文字符串（默认 minLength: 2）
      {
        code: 'const x = <div>你好</div>',
        errors: [{ messageId: 'hardcodedChinese' }],
      },

      // 2. 多个中文字符
      {
        code: 'const x = <h1>数据结构学习助手</h1>',
        errors: [{ messageId: 'hardcodedChinese' }],
      },

      // 3. 中文 + 英文混在文本中
      {
        code: 'const x = <p>Hello 世界</p>',
        errors: [{ messageId: 'hardcodedChinese' }],
      },

      // 4. 嵌套 JSX 中的中文
      {
        code: 'const x = <div><span>中文文本</span></div>',
        errors: [{ messageId: 'hardcodedChinese' }],
      },

      // 5. minLength 阈值生效
      {
        code: 'const x = <div>你好世界</div>',
        options: [{ minLength: 3 }],
        errors: [{ messageId: 'hardcodedChinese' }],
      },
    ],
  })
})

// 单独测试 allowList 配置（避免在 invalid 中造成冲突）
describe('eslint rule — no-hardcoded-chinese-in-jsx allowList', () => {
  ruleTester.run('no-hardcoded-chinese-in-jsx', rule, {
    valid: [
      // allowList 中的字符串不报告
      {
        code: 'const x = <div>术语</div>',
        options: [{ allowList: ['术语'] }],
      },
    ],
    invalid: [
      // 不在 allowList 中的字符串仍报告
      {
        code: 'const x = <div>其他中文</div>',
        options: [{ allowList: ['术语'] }],
        errors: [{ messageId: 'hardcodedChinese' }],
      },
    ],
  })
})

// 测试 minLength 边界值
describe('eslint rule — no-hardcoded-chinese-in-jsx minLength', () => {
  ruleTester.run('no-hardcoded-chinese-in-jsx', rule, {
    valid: [
      // minLength: 3 时，"你好"（2 字符）不报告
      {
        code: 'const x = <div>你好</div>',
        options: [{ minLength: 3 }],
      },
    ],
    invalid: [
      // minLength: 3 时，"你好世界"（4 字符）报告
      {
        code: 'const x = <div>你好世界</div>',
        options: [{ minLength: 3 }],
        errors: [{ messageId: 'hardcodedChinese' }],
      },
    ],
  })
})
