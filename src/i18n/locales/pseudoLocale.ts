/**
 * v19 M2 — 伪语言（Pseudo Locale）测试工具
 *
 * 用途：在 E2E / 集成测试中暴露"未翻译的硬编码英文"。
 * 原理：将英文每个字符替换为带变音符的形式（模拟非拉丁字符显示宽度），
 *       并在两端包裹 `[èn]…[/èn]` 标记，便于测试断言。
 *
 * 典型场景（E2E）：
 * 1. 切换语言到 PSEUDO_LOCALE_CODE（en-XA，模拟缅甸语变体）
 * 2. 渲染 UI
 * 3. 断言：所有英文文本都被 [èn] 包裹 → 翻译完整；否则 → 翻译缺失
 *
 * 设计参考：Chrome i18n 文档 / 行业实践（pseudo-locales for translation QA）
 *
 * ⚠️ 约束：
 * - 不在生产环境启用（仅 dev / test / E2E）
 * - 字符串膨胀比例建议 1.3-1.5（暴露按钮截断 / 布局问题）
 * - 包裹标记 `[èn]` 简单可识别
 */

/** 伪语言 locale code（用于测试/E2E） */
export const PSEUDO_LOCALE_CODE = 'en-XA'

/** 伪语言 locale 名称（人类可读） */
export const PSEUDO_LOCALE_NAME = 'Pseudo (Burmese-style)'

/**
 * 字符级变音符映射表（仅处理 ASCII a-z / A-Z）
 * 选取依据：模拟非拉丁文字符宽度，让 UI 布局问题暴露
 */
const DIACRITIC_MAP: Record<string, string> = {
  a: 'à', b: 'ƀ', c: 'ç', d: 'đ', e: 'è', f: 'ƒ', g: 'ğ', h: 'ĥ',
  i: 'ì', j: 'ĵ', k: 'ķ', l: 'ł', m: 'ɱ', n: 'ñ', o: 'ò', p: 'þ',
  q: 'ǫ', r: 'ŕ', s: 'š', t: 'ţ', u: 'ù', v: 'ṽ', w: 'ŵ', x: 'ẋ',
  y: 'ý', z: 'ž',
}

const DIACRITIC_MAP_UPPER: Record<string, string> = {
  A: 'À', B: 'Ɓ', C: 'Ç', D: 'Đ', E: 'È', F: 'Ƒ', G: 'Ğ', H: 'Ĥ',
  I: 'Ì', J: 'Ĵ', K: 'Ķ', L: 'Ł', M: 'Ṁ', N: 'Ñ', O: 'Ò', P: 'Þ',
  Q: 'Ǫ', R: 'Ŕ', S: 'Š', T: 'Ţ', U: 'Ù', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ',
  Y: 'Ý', Z: 'Ž',
}

/**
 * 单个 ASCII 字母 → 变音符形式
 */
function applyDiacritic(ch: string): string {
  if (DIACRITIC_MAP[ch]) return DIACRITIC_MAP[ch]
  if (DIACRITIC_MAP_UPPER[ch]) return DIACRITIC_MAP_UPPER[ch]
  return ch
}

/**
 * 检测字符串是否包含可伪化的 ASCII 字母
 * - 纯 CJK / 标点 / 数字 → false（直接返回原值）
 * - 包含 a-zA-Z → true
 */
function hasAsciiLetter(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
      return true
    }
  }
  return false
}

/**
 * 伪化单个字符串（英文 → Pseudo）
 *
 * 行为：
 * - 纯 CJK / 非 ASCII 输入 → 直接返回（不做变音处理）
 * - 空格、数字、标点保留
 * - 中日韩字符保留（不做变音处理）
 * - 字母 a-zA-Z 替换为带变音符形式
 * - 默认包裹 `[èn]…[/èn]` 标记
 * - 可选膨胀（默认 1.3x，模拟非拉丁文字符宽度；<=1.0 表示不膨胀）
 */
export interface PseudoLocalizeOptions {
  expandRatio?: number
  wrap?: boolean
}

export function pseudoLocalize(input: string, options: PseudoLocalizeOptions = {}): string {
  if (input.length === 0) return ''
  // 纯非 ASCII 字符串（无 a-zA-Z）→ 直接返回（避免破坏 CJK / 标点 / 数字）
  if (!hasAsciiLetter(input)) return input
  const { expandRatio = 1.3, wrap = true } = options

  // 仅对 ASCII 字母做变音处理
  const mapped: string[] = []
  for (const ch of input) {
    const code = ch.charCodeAt(0)
    if (code >= 0x41 && code <= 0x5a) {
      // A-Z
      mapped.push(applyDiacritic(ch))
    } else if (code >= 0x61 && code <= 0x7a) {
      // a-z
      mapped.push(applyDiacritic(ch))
    } else {
      // 数字 / 空格 / 标点 / CJK / 其他 → 保留
      mapped.push(ch)
    }
  }
  let core = mapped.join('')

  // 膨胀：插入额外空格模拟宽度（仅当 expandRatio > 1 时生效）
  if (expandRatio > 1) {
    const targetLen = Math.ceil(input.length * expandRatio)
    const currentLen = [...core].length
    if (targetLen > currentLen) {
      const padCount = targetLen - currentLen
      // 在中点插入空格（避免破坏原意）
      const mid = Math.floor([...core].length / 2)
      const arr = [...core]
      arr.splice(mid, 0, ' '.repeat(padCount))
      core = arr.join('')
    }
  }

  return wrap ? `[èn]${core}[/èn]` : core
}

/**
 * 树形对象伪化（递归遍历所有字符串叶子）
 *
 * 行为：
 * - 保留对象/数组结构
 * - 对每个字符串叶子应用 pseudoLocalize
 * - 数字 / 布尔 / null 保留原值
 */
export function pseudoLocalizeTree(input: unknown): unknown {
  if (input === null || input === undefined) return input
  if (typeof input === 'string') return pseudoLocalize(input)
  if (typeof input === 'number' || typeof input === 'boolean') return input
  if (Array.isArray(input)) {
    return input.map((v) => pseudoLocalizeTree(v))
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = pseudoLocalizeTree(v)
    }
    return out
  }
  return input
}

/**
 * 创建一个伪语言加载器（返回与 en 镜像的 pseudo 对象）
 *
 * 用途：在测试中以伪语言形式加载 en，验证 UI 是否完整翻译
 *
 * 注意：返回的对象**结构**与 en 一致（key path 镜像），但**值**经过伪化
 */
export function createPseudoLocaleLoader(
  source: unknown,
  // 预留 options 以便未来扩展（目前 pseudoLocalizeTree 已直接处理）
  _options: PseudoLocalizeOptions = {},
): Record<string, unknown> {
  return pseudoLocalizeTree(source) as Record<string, unknown>
}

/**
 * 检测一个字符串是否经过伪化（包含 [èn] 标记）
 */
export function isPseudoLocalized(s: string): boolean {
  return s.includes('[èn]') && s.includes('[/èn]')
}
