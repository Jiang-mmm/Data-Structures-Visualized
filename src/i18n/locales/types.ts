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
 * v19 M3 — 深度键镜像编译时断言
 *
 * 递归检查 zh/en 任意嵌套深度的键集合是否完全一致。
 * - 镜像 → `true`
 * - 不镜像 → `{ readonly __error: '...' }`
 *
 * 用法：
 * ```ts
 * import type { AssertSameKeys } from './locales/types'
 * // eslint-disable-next-line @typescript-eslint/no-unused-vars
 * type _DeepCheck = AssertSameKeys<typeof zh, typeof en>
 * ```
 *
 * 实现要点：
 * - 使用 mapped type + 条件类型递归
 * - 类型深度限制 ~10（TypeScript depth limit）
 * - 叶子判定：string-literal ↔ string-literal 算镜像
 * - 对象 ↔ 对象 递归；类型不匹配返回 error object
 */
export type AssertSameKeys<Zh, En> = AssertSameKeysImpl<Zh, En, ''>

/**
 * 内部实现：递归检查 + 路径追踪
 */
type AssertSameKeysImpl<Zh, En, Path extends string> = AssertSameKeysImplHelper<
  Zh,
  En,
  Path
>

/**
 * 内部 helper：避免直接 indexed access 类型推导陷阱
 */
type AssertSameKeysImplHelper<Zh, En, Path extends string> =
  // 顶层键集合必须双向一致
  keyof Zh extends keyof En
    ? keyof En extends keyof Zh
      ? // 双向键一致后，对每个 zh 键递归检查
        {
          [K in keyof Zh]: K extends keyof En
            ? _CheckLeaf<Zh[K], En[K], _JoinPath<Path, K>>
            : { readonly __error: `Key missing in en at ${Path}.${string & K}` }
        }[keyof Zh] extends true
        ? // 检查 en 多出的键
          {
            [K in Exclude<keyof En, keyof Zh>]: {
              readonly __error: `Extra key in en at ${Path}.${string & K}`
            }
          }[Exclude<keyof En, keyof Zh>] extends never
          ? true
          : { readonly __error: `Extra keys in en at ${Path}` }
        : { readonly __error: `Type mismatch at ${Path}` }
      : { readonly __error: `Extra keys in en at top level (not in zh)` }
    : { readonly __error: `Keys missing in en at top level` }

/**
 * 路径拼接（避免空路径时出现前导点）
 */
type _JoinPath<Base extends string, K extends PropertyKey> = Base extends ''
  ? string & K
  : `${Base}.${string & K}`

/**
 * 叶子类型检查
 */
type _CheckLeaf<Z, E, P extends string> = _IsPlainObject<Z> extends true
  ? _IsPlainObject<E> extends true
    ? // 双对象 → 递归
      AssertSameKeysImpl<Z & Record<string, unknown>, E & Record<string, unknown>, P>
    : { readonly __error: `Type mismatch at ${P}: zh is object, en is not` }
  : _IsPlainObject<E> extends true
    ? { readonly __error: `Type mismatch at ${P}: en is object, zh is not` }
    : _IsStringLiteral<Z> extends true
      ? _IsStringLiteral<E> extends true
        ? true
        : { readonly __error: `Type mismatch at ${P}: zh is string literal, en is not` }
      : true

/**
 * 内部类型守卫：是否为「纯对象」（非 string/number/boolean/null）
 */
type _IsPlainObject<T> = T extends Record<string, unknown>
  ? T extends string | number | boolean | null | undefined
    ? false
    : true
  : false

/**
 * 内部类型守卫：是否为 string literal（不是泛型 string）
 */
type _IsStringLiteral<T> = T extends string ? (string extends T ? false : true) : false

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
