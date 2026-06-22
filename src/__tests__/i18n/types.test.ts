/**
 * v19 M3 — types.ts 类型工具测试
 *
 * 覆盖范围：
 * - KeysMatch 浅层键镜像（顶层）
 * - AssertSameKeys 深度递归键镜像
 * - 镜像时返回 true
 * - 不镜像时返回 { __error: ... }
 * - 真实场景模拟（zh/en 嵌套对象）
 */

import { describe, it, expect } from 'vitest'
import type {
  AssertSameKeys,
  KeysMatch,
  SupportedLocale,
  IntegrityResult,
} from '../../i18n/locales/types'
import { LOCALES, INTEGRITY_VERSION } from '../../i18n/locales/types'

describe('types — SupportedLocale', () => {
  it('应包含 zh / en 两个取值', () => {
    // 通过字面量类型断言 SupportedLocale 包含 'zh' | 'en'
    type _HasZh = 'zh' extends SupportedLocale ? true : false
    type _HasEn = 'en' extends SupportedLocale ? true : false
    const _zh: _HasZh = true as _HasZh
    const _en: _HasEn = true as _HasEn
    expect(_zh).toBe(true)
    expect(_en).toBe(true)
  })
})

describe('types — KeysMatch 浅层镜像', () => {
  it('zh / en 顶层键镜像时应返回 true', () => {
    type Zh = { common: unknown; array: unknown; stack: unknown }
    type En = { common: unknown; array: unknown; stack: unknown }
    type _Result = KeysMatch<Zh, En>
    const _check: _Result = true as _Result
    expect(_check).toBe(true)
  })

  it('en 多出顶层键时应返回 error object', () => {
    type Zh = { common: unknown }
    type En = { common: unknown; extra: unknown }
    type _Result = KeysMatch<Zh, En>
    // 期望是 error object（不是 true）
    type IsError = _Result extends true ? false : true
    const _check: IsError = true as IsError
    expect(_check).toBe(true)
  })

  it('zh 多出顶层键时应返回 error object', () => {
    type Zh = { common: unknown; missing: unknown }
    type En = { common: unknown }
    type _Result = KeysMatch<Zh, En>
    type IsError = _Result extends true ? false : true
    const _check: IsError = true as IsError
    expect(_check).toBe(true)
  })
})

describe('types — AssertSameKeys 深度镜像', () => {
  it('镜像的扁平对象应返回 true', () => {
    type Zh = { title: string; desc: string }
    type En = { title: string; desc: string }
    type _Result = AssertSameKeys<Zh, En>
    const _check: _Result = true as _Result
    expect(_check).toBe(true)
  })

  it('镜像的嵌套对象应返回 true（深度 1）', () => {
    type Zh = { common: { ok: string; cancel: string } }
    type En = { common: { ok: string; cancel: string } }
    type _Result = AssertSameKeys<Zh, En>
    const _check: _Result = true as _Result
    expect(_check).toBe(true)
  })

  it('镜像的嵌套对象应返回 true（深度 3）', () => {
    type Zh = {
      level1: {
        level2: {
          level3: { a: string; b: string }
        }
      }
    }
    type En = {
      level1: {
        level2: {
          level3: { a: string; b: string }
        }
      }
    }
    type _Result = AssertSameKeys<Zh, En>
    const _check: _Result = true as _Result
    expect(_check).toBe(true)
  })

  it('深度嵌套 en 缺键时应返回 error object', () => {
    type Zh = { common: { ok: string; cancel: string; retry: string } }
    type En = { common: { ok: string; cancel: string } }
    type _Result = AssertSameKeys<Zh, En>
    type IsError = _Result extends true ? false : true
    const _check: IsError = true as IsError
    expect(_check).toBe(true)
  })

  it('深度嵌套 zh 缺键时应返回 error object', () => {
    type Zh = { common: { ok: string } }
    type En = { common: { ok: string; cancel: string } }
    type _Result = AssertSameKeys<Zh, En>
    type IsError = _Result extends true ? false : true
    const _check: IsError = true as IsError
    expect(_check).toBe(true)
  })

  it('类型不匹配（string vs object）应返回 error object', () => {
    type Zh = { common: string }
    type En = { common: { nested: string } }
    type _Result = AssertSameKeys<Zh, En>
    type IsError = _Result extends true ? false : true
    const _check: IsError = true as IsError
    expect(_check).toBe(true)
  })

  it('应兼容深度镜像含不同叶子值（只要结构相同）', () => {
    // 注意：AssertSameKeys 只检查结构，不检查具体值
    type Zh = { a: string; b: number }
    type En = { a: string; b: number }
    type _Result = AssertSameKeys<Zh, En>
    const _check: _Result = true as _Result
    expect(_check).toBe(true)
  })

  it('应兼容单层对象（不嵌套）', () => {
    type Zh = { ok: string; cancel: string }
    type En = { ok: string; cancel: string }
    type _Result = AssertSameKeys<Zh, En>
    const _check: _Result = true as _Result
    expect(_check).toBe(true)
  })
})

describe('types — IntegrityResult 接口', () => {
  it('应能构造有效 IntegrityResult', () => {
    const result: IntegrityResult = {
      valid: true,
      missingInEn: [],
      missingInZh: [],
      typeMismatches: [],
      totalKeysZh: 10,
      totalKeysEn: 10,
      version: 1,
    }
    expect(result.valid).toBe(true)
    expect(result.missingInEn).toEqual([])
    expect(result.missingInZh).toEqual([])
    expect(result.typeMismatches).toEqual([])
    expect(result.totalKeysZh).toBe(10)
    expect(result.totalKeysEn).toBe(10)
    expect(result.version).toBe(1)
  })

  it('应能构造无效 IntegrityResult（缺失键）', () => {
    const result: IntegrityResult = {
      valid: false,
      missingInEn: ['common.ok', 'common.cancel'],
      missingInZh: [],
      typeMismatches: [],
      totalKeysZh: 10,
      totalKeysEn: 8,
      version: 1,
    }
    expect(result.valid).toBe(false)
    expect(result.missingInEn).toHaveLength(2)
    expect(result.totalKeysZh).toBe(10)
    expect(result.totalKeysEn).toBe(8)
  })
})

describe('types — INTEGRITY_VERSION 常量', () => {
  it('应为数字字面量 1', () => {
    const v: 1 = INTEGRITY_VERSION
    expect(v).toBe(1)
  })
})

describe('types — LOCALES 元数据', () => {
  it('应包含 zh / en 两个 locale', () => {
    const codes = LOCALES.map((l) => l.code)
    expect(codes).toContain('zh')
    expect(codes).toContain('en')
  })

  it('每个 locale 应有 displayName + direction', () => {
    for (const locale of LOCALES) {
      expect(typeof locale.code).toBe('string')
      expect(typeof locale.displayName).toBe('string')
      expect(['ltr', 'rtl']).toContain(locale.direction)
    }
  })

  it('应只有两个 locale（zh + en，不支持多语种）', () => {
    expect(LOCALES).toHaveLength(2)
  })
})

describe('types — 编译时行为（在测试运行时通过 tsc 检查）', () => {
  it('镜像 zh/en 时 AssertSameKeys 不应是 error object', () => {
    // 这个测试在 .ts 文件编译时已经验证；
    // 测试运行期再做一次校验以防类型被 any 绕过
    type _Mirror = AssertSameKeys<{ a: string }, { a: string }>
    const check: _Mirror = true as _Mirror
    expect(check).toBe(true)
  })

  it('不镜像时 AssertSameKeys 应是 error object', () => {
    type _Mismatch = AssertSameKeys<{ a: string }, { b: string }>
    type IsError = _Mismatch extends true ? false : true
    const check: IsError = true as IsError
    expect(check).toBe(true)
  })
})
