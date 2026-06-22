import type { IntegrityResult, SupportedLocale } from './types'
import { INTEGRITY_VERSION } from './types'

// Re-export 便于外部统一从 integrity 模块引用
export { INTEGRITY_VERSION } from './types'

/**
 * v19 M2 — i18n 完整性校验工具
 *
 * 提供 zh/en 键镜像的运行时检查，作为编译时 `KeysMatch` 浅层断言的补充。
 * 编译时只检查顶层键；运行时可递归检查所有叶子字符串路径。
 *
 * 用法：
 * ```ts
 * import { checkIntegrity, assertIntegrity } from './locales/integrity'
 * const result = checkIntegrity(zh, en)
 * if (!result.valid) {
 *   console.error('i18n drift detected', result)
 * }
 * ```
 *
 * 设计原则：
 * - 不依赖 React，可在 Node 测试环境运行
 * - 不修改入参对象（pure function）
 * - 失败时不抛错，由调用方决定（assertIntegrity 抛错版用于测试）
 */

type AnyRecord = Record<string, unknown>

/**
 * 深度遍历对象，收集所有「叶子字符串」的 dotted path。
 *
 * 行为：
 * - 遇到 string → 收集 `${prefix}`
 * - 遇到 object → 递归 `${prefix}.${key}`
 * - 遇到 array → 收集 `${prefix}[${i}]`
 * - 遇到 null / undefined / number / boolean → 跳过（不视为可翻译叶子）
 */
export function collectLeafPaths(obj: unknown, prefix = ''): string[] {
  const out: string[] = []
  if (obj === null || obj === undefined) return out
  if (typeof obj === 'string') {
    if (prefix) out.push(prefix)
    return out
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const next = prefix ? `${prefix}[${i}]` : `[${i}]`
      out.push(...collectLeafPaths(item, next))
    })
    return out
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as AnyRecord)) {
      const next = prefix ? `${prefix}.${k}` : k
      out.push(...collectLeafPaths(v, next))
    }
  }
  return out
}

/**
 * 收集叶子字符串的值（与路径配对）
 */
export function collectLeafStrings(
  obj: unknown,
  prefix = '',
): Array<{ path: string; value: string }> {
  const out: Array<{ path: string; value: string }> = []
  if (obj === null || obj === undefined) return out
  if (typeof obj === 'string') {
    if (prefix) out.push({ path: prefix, value: obj })
    return out
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const next = prefix ? `${prefix}[${i}]` : `[${i}]`
      out.push(...collectLeafStrings(item, next))
    })
    return out
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as AnyRecord)) {
      const next = prefix ? `${prefix}.${k}` : k
      out.push(...collectLeafStrings(v, next))
    }
  }
  return out
}

/**
 * 统计叶子字符串数量（用于完整性报告）
 */
export function countLeaves(obj: unknown): number {
  return collectLeafPaths(obj).length
}

/**
 * 检查两个 locale 对象之间的镜像一致性
 *
 * 行为：
 * - 收集 zh / en 所有叶子路径
 * - 找出 missingInEn（zh 有但 en 没有）
 * - 找出 missingInZh（en 有但 zh 没有）
 * - 检查顶层 key 类型不匹配（防 string vs object）
 * - valid = missingInEn.length === 0 && missingInZh.length === 0 && typeMismatches.length === 0
 */
export function checkIntegrity(
  zh: unknown,
  en: unknown,
  options: { version?: number; locales?: readonly SupportedLocale[] } = {},
): IntegrityResult {
  const version = options.version ?? INTEGRITY_VERSION
  const zhPaths = new Set(collectLeafPaths(zh))
  const enPaths = new Set(collectLeafPaths(en))
  const zhArr = [...zhPaths]
  const enArr = [...enPaths]

  const missingInEn = zhArr.filter((k) => !enPaths.has(k)).sort()
  const missingInZh = enArr.filter((k) => !zhPaths.has(k)).sort()

  // 顶层类型不匹配（防 string vs object）
  const typeMismatches: string[] = []
  if (zh && en && typeof zh === 'object' && typeof en === 'object' && !Array.isArray(zh) && !Array.isArray(en)) {
    const zhKeys = new Set(Object.keys(zh as AnyRecord))
    const enKeys = new Set(Object.keys(en as AnyRecord))
    for (const k of zhKeys) {
      if (!enKeys.has(k)) continue
      const a = (zh as AnyRecord)[k]
      const b = (en as AnyRecord)[k]
      if (typeof a !== typeof b) {
        typeMismatches.push(k)
      }
    }
  }

  const valid =
    missingInEn.length === 0 && missingInZh.length === 0 && typeMismatches.length === 0

  return {
    valid,
    missingInEn,
    missingInZh,
    typeMismatches,
    totalKeysZh: zhPaths.size,
    totalKeysEn: enPaths.size,
    version,
  }
}

/**
 * 镜像校验抛错版（用于启动时 / 关键测试）
 */
export function assertIntegrity(
  zh: unknown,
  en: unknown,
  options: { throwOnMismatch?: boolean; maxListed?: number } = {},
): void {
  const result = checkIntegrity(zh, en)
  if (result.valid) return
  if (options.throwOnMismatch === false) return
  const max = options.maxListed ?? 20
  const parts: string[] = []
  if (result.missingInEn.length) {
    const sample = result.missingInEn.slice(0, max)
    parts.push(
      `${result.missingInEn.length} keys missing in en: ${sample.join(', ')}${result.missingInEn.length > max ? ` …and ${result.missingInEn.length - max} more` : ''}`,
    )
  }
  if (result.missingInZh.length) {
    const sample = result.missingInZh.slice(0, max)
    parts.push(
      `${result.missingInZh.length} keys missing in zh: ${sample.join(', ')}${result.missingInZh.length > max ? ` …and ${result.missingInZh.length - max} more` : ''}`,
    )
  }
  if (result.typeMismatches.length) {
    parts.push(
      `${result.typeMismatches.length} type mismatches: ${result.typeMismatches.join(', ')}`,
    )
  }
  throw new Error(`[i18n integrity v${result.version}] ${parts.join(' | ')}`)
}

/**
 * 检测对象中是否存在空字符串 / 仅空白的叶子
 */
export interface HasEmptyLeafOptions {
  returnPaths?: boolean
}

export type HasEmptyLeafResult = boolean | { hasEmpty: boolean; paths: string[] }

export function hasEmptyLeaf(
  obj: unknown,
  options: HasEmptyLeafOptions = {},
): HasEmptyLeafResult {
  const leaves = collectLeafStrings(obj)
  const empty = leaves.filter((l) => l.value.trim().length === 0)
  if (options.returnPaths) {
    return { hasEmpty: empty.length > 0, paths: empty.map((l) => l.path) }
  }
  return empty.length > 0
}

/**
 * 双向 diff 键路径
 */
export interface KeyDiff {
  onlyInZh: string[]
  onlyInEn: string[]
}

export function diffKeys(zh: unknown, en: unknown): KeyDiff {
  const zhPaths = new Set(collectLeafPaths(zh))
  const enPaths = new Set(collectLeafPaths(en))
  const zhArr = [...zhPaths]
  const enArr = [...enPaths]
  return {
    onlyInZh: zhArr.filter((k) => !enPaths.has(k)).sort(),
    onlyInEn: enArr.filter((k) => !zhPaths.has(k)).sort(),
  }
}

/**
 * 便捷聚合：把 IntegrityResult 渲染为单行可读字符串（用于 console 输出）
 */
export function formatIntegrityReport(
  result: IntegrityResult & { version: number },
): string {
  const lines: string[] = []
  lines.push(
    `[i18n integrity v${result.version}] valid=${result.valid} zh=${result.totalKeysZh} en=${result.totalKeysEn}`,
  )
  if (result.missingInEn.length) {
    lines.push(`  missing in en (${result.missingInEn.length}):`)
    for (const k of result.missingInEn.slice(0, 20)) lines.push(`    - ${k}`)
    if (result.missingInEn.length > 20) lines.push(`    …and ${result.missingInEn.length - 20} more`)
  }
  if (result.missingInZh.length) {
    lines.push(`  missing in zh (${result.missingInZh.length}):`)
    for (const k of result.missingInZh.slice(0, 20)) lines.push(`    - ${k}`)
    if (result.missingInZh.length > 20) lines.push(`    …and ${result.missingInZh.length - 20} more`)
  }
  if (result.typeMismatches.length) {
    lines.push(`  type mismatches (${result.typeMismatches.length}):`)
    for (const k of result.typeMismatches) lines.push(`    - ${k}`)
  }
  return lines.join('\n')
}
