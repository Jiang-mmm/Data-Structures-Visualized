/**
 * @fileoverview 禁止在 JSX 文本中使用硬编码中文字符串（v19 M3）
 *
 * 规则目的：
 * - 防止新增硬编码中文字符串到 UI 组件
 * - 推动所有 UI 文本走 t() / i18n 系统
 * - 与 v19 i18n 渐进迁移（M4-M7）配合使用
 *
 * 范围：
 * - 检查 JSX 文本节点（JSXText）的 value
 * - 不检查 JSX 属性（aria-label / data-* 等）中的中文
 * - 不检查 JSX 表达式（{...}）内的内容
 * - 不检查字符串字面量（在 JSX 外）
 *
 * 配置：
 * - minLength: 触发报告的最短连续中文字符数（默认 2）
 * - allowList: 白名单字符串（数组 / 字符串前缀）
 *
 * 配套工程：
 * - 使用 lint 严重性为 'warn'（v17 GA 已有大量硬编码，逐步迁移）
 * - 在 src/i18n/**, src/__tests__/**, e2e/** 等目录自动跳过
 *   （通过 eslint.config.js 的 ignores 配置实现）
 *
 * @example
 *   // 不报告（无中文）
 *   <div>Hello</div>
 *
 *   // 报告（硬编码中文）
 *   <div>你好</div>  // 警告：JSX 文本中发现硬编码中文字符串：你好
 *
 *   // 不报告（属性中的中文，不在 JSX 文本范围）
 *   <div aria-label="你好">Hello</div>
 *
 *   // 不报告（JSX 表达式）
 *   <div>{t('common.ok')}</div>
 */

// CJK Unified Ideographs 基本平面 + 扩展 A
// 范围：U+4E00 - U+9FFF（一-鿿）
const CJK_REGEX = /[一-鿿]+/g

/**
 * 检查文本是否含 minLength 个以上连续中文字符
 */
function findChineseSegments(text, minLength) {
  if (!text) return []
  const matches = text.match(CJK_REGEX) || []
  return matches.filter((m) => m.length >= minLength)
}

/**
 * 判断 match 是否在 allowList 中（精确匹配或前缀匹配）
 */
function isAllowListed(match, allowList) {
  for (const item of allowList) {
    if (match === item) return true
    if (match.startsWith(item)) return true
  }
  return false
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded Chinese strings in JSX text',
      category: 'i18n',
      recommended: false,
    },
    messages: {
      hardcodedChinese:
        'JSX 文本中发现硬编码中文字符串："{{text}}"。请使用 t() 函数从 locales 读取。',
    },
    schema: [
      {
        type: 'object',
        properties: {
          minLength: {
            type: 'number',
            default: 2,
            minimum: 1,
            description: '触发报告的最短连续中文字符数（默认 2）',
          },
          allowList: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: '白名单字符串（精确匹配或前缀匹配）',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const minLength = options.minLength ?? 2
    const allowList = options.allowList ?? []

    return {
      // 监听 JSX 文本节点
      JSXText(node) {
        const text = node.value
        if (!text) return

        // 跳过纯空白
        if (text.trim().length === 0) return

        // 提取连续中文字符段
        const segments = findChineseSegments(text, minLength)
        if (segments.length === 0) return

        // 跳过 allowList 中的字符串
        const violations = segments.filter((s) => !isAllowListed(s, allowList))
        if (violations.length === 0) return

        // 报告第一个违规（每个节点报告一次，避免刷屏）
        context.report({
          node,
          messageId: 'hardcodedChinese',
          data: { text: violations[0] },
        })
      },
    }
  },
}
