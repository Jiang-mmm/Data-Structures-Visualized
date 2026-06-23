/**
 * v19 M2 — 统一导出层
 *
 * 作为 `src/i18n/locales/*` 内部模块的对外统一出口。
 * 历史入口 `src/i18n/locales.ts` 仍保留（向后兼容），但物理位置在 locales/ 目录下。
 *
 * 当前 M2 阶段导出：
 * - 类型工具：types.ts（IntegrityResult / SupportedLocale / LOCALES / KeysMatch）
 * - 完整性校验：integrity.ts（checkIntegrity / assertIntegrity / collectLeafPaths / countLeaves / diffKeys / hasEmptyLeaf / formatIntegrityReport）
 * - 伪语言：pseudoLocale.ts（pseudoLocalize / pseudoLocalizeTree / createPseudoLocaleLoader / PSEUDO_LOCALE_CODE）
 *
 * M3+ 阶段将新增：
 * - AssertSameKeys 编译时断言
 * - zh/en 顶层聚合（locales/{zh,en}/index.ts）
 */

// Types
export type {
  SupportedLocale,
  LocaleMetadata,
  KeysMatch,
  IntegrityResult,
} from './types'
export { LOCALES, INTEGRITY_VERSION } from './types'

// Integrity (runtime)
export {
  collectLeafPaths,
  collectLeafStrings,
  countLeaves,
  checkIntegrity,
  assertIntegrity,
  hasEmptyLeaf,
  diffKeys,
  formatIntegrityReport,
} from './integrity'
export type { HasEmptyLeafOptions, HasEmptyLeafResult, KeyDiff } from './integrity'

// Pseudo Locale (E2E / test)
export {
  pseudoLocalize,
  pseudoLocalizeTree,
  createPseudoLocaleLoader,
  isPseudoLocalized,
  PSEUDO_LOCALE_CODE,
  PSEUDO_LOCALE_NAME,
} from './pseudoLocale'
export type { PseudoLocalizeOptions } from './pseudoLocale'
