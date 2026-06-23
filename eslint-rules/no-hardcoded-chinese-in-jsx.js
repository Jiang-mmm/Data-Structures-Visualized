/**
 * @fileoverview 禁止在 JSX 文本与受控字符串字面量中使用硬编码中文字符串（v19 M3 + v20 M7-5 扩展）
 *
 * 规则目的：
 * - 防止新增硬编码中文字符串到 UI 组件
 * - 推动所有 UI 文本走 t() / i18n 系统
 * - 与 v19 i18n 渐进迁移（M4-M7）配合使用
 * - v20 M7-5 扩展：对 src/configs/learning/** 中除保留属性外的字符串字面量进行检查
 *
 * 范围：
 * - 检查 JSX 文本节点（JSXText）的 value
 * - 不检查 JSX 属性（aria-label / data-* 等）中的中文
 * - 不检查 JSX 表达式（{...}）内的内容
 * - 可选：检查受控对象属性中的字符串字面量 Literal（v20 M7-5 扩展）
 *   - 仅在开启 checkStringLiterals 时生效
 *   - 仅检查属性名在 stringLiteralPropertiesToCheck 列表中的字面量
 *   - 跳过属性名在 stringLiteralPropertiesAllowList 列表中的字面量
 *
 * 配置：
 * - minLength: 触发报告的最短连续中文字符数（默认 2）
 * - allowList: 白名单字符串（数组 / 字符串前缀）
 * - checkStringLiterals: 是否启用字符串字面量检查（v20 M7-5 扩展，默认 false）
 * - stringLiteralPropertiesToCheck: 启用字面量检查时需检查的属性名（默认 []）
 * - stringLiteralPropertiesAllowList: 启用字面量检查时跳过的属性名（默认 []）
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
 *
 *   @example v20 M7-5 扩展（configs 字符串字面量）
 *   // 不报告（codeSnippet 保留：M7-D4 设计决策）
 *   { title: tStatic('...'), codeSnippet: '// 中文注释保留' }
 *
 *   // 报告（title 字段硬编码中文）
 *   { title: '硬编码' }  // 警告：字符串字面量中发现硬编码中文字符串
 *
 *   // 不报告（algorithmKey 不在检查列表）
 *   { algorithmKey: '数组' }
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
      hardcodedChineseLiteral:
        '字符串字面量（属性 "{{property}}"）中发现硬编码中文字符串："{{text}}"。请使用 tStatic() / t() 从 locales 读取。',
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
          checkStringLiterals: {
            type: 'boolean',
            default: false,
            description: '是否启用字符串字面量检查（v20 M7-5 扩展）',
          },
          stringLiteralPropertiesToCheck: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: '启用字面量检查时需检查的属性名列表（v20 M7-5 扩展）',
          },
          stringLiteralPropertiesAllowList: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: '启用字面量检查时跳过的属性名列表（v20 M7-5 扩展）',
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
    const checkStringLiterals = options.checkStringLiterals ?? false
    const propertiesToCheck = new Set(options.stringLiteralPropertiesToCheck ?? [])
    const propertiesAllowList = new Set(options.stringLiteralPropertiesAllowList ?? [])

    /**
     * v20 M7-5 扩展：检查 Literal 节点（字符串字面量）
     * 仅当父节点是 Property 且 key 在 propertiesToCheck 中时报告
     * 跳过 key 在 propertiesAllowList 中的属性
     */
    function checkStringLiteral(node) {
      if (!node || typeof node.value !== 'string') return
      const text = node.value
      if (!text) return
      const segments = findChineseSegments(text, minLength)
      if (segments.length === 0) return
      const violations = segments.filter((s) => !isAllowListed(s, allowList))
      if (violations.length === 0) return

      // 检查父节点是否为 Property 且 key 匹配
      const parent = node.parent
      if (!parent || parent.type !== 'Property') return
      const keyNode = parent.key
      if (!keyNode) return
      const keyName = keyNode.name ?? (keyNode.value && typeof keyNode.value === 'string' ? keyNode.value : null)
      if (!keyName) return

      // 不在检查列表中 → 跳过
      if (!propertiesToCheck.has(keyName)) return
      // 在 allowList 中 → 跳过
      if (propertiesAllowList.has(keyName)) return

      context.report({
        node,
        messageId: 'hardcodedChineseLiteral',
        data: { property: keyName, text: violations[0] },
      })
    }

    const visitors = {
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

    // v20 M7-5 扩展：仅在 checkStringLiterals=true 时注册 Literal 访问器
    if (checkStringLiterals) {
      visitors.Literal = checkStringLiteral
    }

    return visitors
  },
}
