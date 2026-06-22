/**
 * v19 i18n 类型定义
 *
 * 提供 v19 渐进迁移所需的类型工具：
 * - `SupportedLocale` 支持的语言联合类型
 * - `LocaleMetadata` 语言元数据
 * - `KeysMatch` zh/en 键镜像浅层编译时断言
 * - `IntegrityResult` integrity.ts 校验返回类型
 * - `LOCALES` 语言元数据常量
 *
 * ⚠️ 注意：现有 `interface Locale`（在 locales.ts 中）保持不变，本文件
 * 只新增工具类型，避免破坏 50+ 命名空间的现有导入。
 *
 * 📌 zh/en 键镜像校验策略：
 * 编译时通过 `KeysMatch` 类型做浅层（顶层）提示；运行时由 integrity.ts
 * 在测试中做完整深度校验。compile-time 深度递归会拖慢 tsc，不推荐。
 */

/**
 * 支持的语言联合类型
 * - 'zh'：中文（默认）
 * - 'en'：英文
 */
export type SupportedLocale = 'zh' | 'en'

/**
 * 语言元数据
 */
export interface LocaleMetadata {
  code: SupportedLocale
  displayName: string
  direction: 'ltr' | 'rtl'
}

/**
 * 语言元数据常量（运行时）
 * 用于 UI 语言切换器 + integrity.ts 启动时遍历
 */
export const LOCALES: readonly LocaleMetadata[] = [
  { code: 'zh', displayName: '中文', direction: 'ltr' },
  { code: 'en', displayName: 'English', direction: 'ltr' },
] as const

/**
 * 浅层键镜像编译时断言（顶层）
 *
 * 用法（在 locales.ts 末尾添加）：
 * ```ts
 * import type { KeysMatch } from './locales/types'
 * // eslint-disable-next-line @typescript-eslint/no-unused-vars
 * type _TopLevelCheck = KeysMatch<typeof zh, typeof en>
 * ```
 *
 * 限制：仅检查顶层键。深度嵌套键的校验由 integrity.ts 在测试时完成。
 */
export type KeysMatch<Zh, En> = keyof Zh extends keyof En
  ? keyof En extends keyof Zh
    ? true
    : { readonly __error: 'Extra keys in En not present in Zh at top level' }
  : { readonly __error: 'Keys in Zh missing from En at top level' }

/**
 * integrity.ts 校验返回类型
 */
export interface IntegrityResult {
  valid: boolean
  missingInEn: readonly string[]
  missingInZh: readonly string[]
  typeMismatches: readonly string[]
  totalKeysZh: number
  totalKeysEn: number
  /** integrity 模块版本（与 INTEGRITY_VERSION 对齐） */
  version: number
}

/**
 * integrity 模块版本
 * 升级时同步更新测试
 */
export const INTEGRITY_VERSION = 1 as const
