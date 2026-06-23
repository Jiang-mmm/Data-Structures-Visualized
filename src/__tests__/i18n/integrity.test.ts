import { describe, it, expect } from 'vitest'
import { zh, en } from '../../i18n/locales'
import {
  collectLeafPaths,
  checkIntegrity,
  assertIntegrity,
  hasEmptyLeaf,
  countLeaves,
  diffKeys,
  INTEGRITY_VERSION,
} from '../../i18n/locales/integrity'

/**
 * v19 M2 — integrity.ts 单元测试
 *
 * 覆盖目标：
 * - collectLeafPaths: 深度优先遍历，输出所有叶子字符串的 dotted path
 * - checkIntegrity: 双向比对 zh/en，返回 IntegrityResult
 * - assertIntegrity: 同上但缺失键时抛错
 * - hasEmptyLeaf: 检测空字符串 / 仅空白
 * - countLeaves: 统计叶子数量
 * - diffKeys: 双向差异键
 *
 * 目标：i18n 完整性测试从 8 → 50+（M2 验收）
 */

describe('integrity — collectLeafPaths', () => {
  it('应返回所有叶子字符串的 dotted path', () => {
    const obj = { a: { b: 'x', c: 'y' }, d: 'z' }
    const paths = collectLeafPaths(obj)
    expect(paths).toContain('a.b')
    expect(paths).toContain('a.c')
    expect(paths).toContain('d')
    expect(paths).toHaveLength(3)
  })

  it('空对象返回空数组', () => {
    expect(collectLeafPaths({})).toEqual([])
  })

  it('null / undefined 输入安全降级', () => {
    expect(collectLeafPaths(null)).toEqual([])
    expect(collectLeafPaths(undefined)).toEqual([])
  })

  it('当前 locales.ts (zh) 应至少返回 200+ 叶子', () => {
    const paths = collectLeafPaths(zh)
    expect(paths.length).toBeGreaterThan(200)
  })

  it('当前 locales.ts (en) 应至少返回 200+ 叶子', () => {
    const paths = collectLeafPaths(en)
    expect(paths.length).toBeGreaterThan(200)
  })
})

describe('integrity — checkIntegrity', () => {
  it('zh 和 en 镜像时应返回 valid = true', () => {
    const result = checkIntegrity(zh, en)
    expect(result.valid).toBe(true)
    expect(result.missingInEn).toEqual([])
    expect(result.missingInZh).toEqual([])
    expect(result.typeMismatches).toEqual([])
  })

  it('en 缺失键时，missingInEn 应列出该键', () => {
    const partial = { common: { delete: 'Delete' } } // 故意不完整
    const result = checkIntegrity(zh, partial)
    expect(result.valid).toBe(false)
    expect(result.missingInEn.length).toBeGreaterThan(0)
    expect(result.missingInEn).toContain('common.search')
  })

  it('zh 缺失键时，missingInZh 应列出该键', () => {
    const partial = { common: { delete: '删除', search: '查找' } }
    const result = checkIntegrity(partial, en)
    expect(result.valid).toBe(false)
    expect(result.missingInZh.length).toBeGreaterThan(0)
  })

  it('类型不匹配（zh string vs en object）应记录到 typeMismatches', () => {
    const zhSide = { common: 'string-value' as unknown as Record<string, unknown> }
    const enSide = { common: { delete: 'Delete' } }
    const result = checkIntegrity(zhSide, enSide)
    expect(result.valid).toBe(false)
    expect(result.typeMismatches).toContain('common')
  })

  it('结果应包含 totalKeysZh 和 totalKeysEn', () => {
    const result = checkIntegrity(zh, en)
    expect(result.totalKeysZh).toBeGreaterThan(200)
    expect(result.totalKeysEn).toBeGreaterThan(200)
    expect(result.totalKeysZh).toBe(result.totalKeysEn)
  })

  it('结果应包含 INTEGRITY_VERSION', () => {
    const result = checkIntegrity(zh, en)
    expect(result.version).toBe(INTEGRITY_VERSION)
  })
})

describe('integrity — assertIntegrity', () => {
  it('zh / en 镜像时不应抛错', () => {
    expect(() => assertIntegrity(zh, en)).not.toThrow()
  })

  it('缺失键时抛错并包含缺失键路径', () => {
    // 构造部分 zh（缺 common 子树），让 en 是更广的对象
    const partialZh = { array: { title: '数组' } }
    const fullEn = { array: { title: 'Array' }, common: { search: 'Search' } }
    expect(() => assertIntegrity(partialZh, fullEn)).toThrow(/common\.search/)
  })

  it('抛错信息应同时包含 missingInEn / missingInZh 摘要', () => {
    // 构造让 en 缺失的输入（部分 en 缺 array 子树）
    const fullZh = { array: { title: '数组' }, common: { search: '搜索' } }
    const partialEn = { common: { search: 'Search' } }
    try {
      assertIntegrity(fullZh, partialEn)
      expect.fail('expected throw')
    } catch (e) {
      expect((e as Error).message).toMatch(/missing in en/i)
    }
  })
})

describe('integrity — hasEmptyLeaf', () => {
  it('所有叶子非空时应返回 false', () => {
    expect(hasEmptyLeaf(zh)).toBe(false)
    expect(hasEmptyLeaf(en)).toBe(false)
  })

  it('存在空字符串叶子时返回 true', () => {
    const obj = { a: { b: '' } }
    expect(hasEmptyLeaf(obj)).toBe(true)
  })

  it('存在仅空白叶子时返回 true', () => {
    const obj = { a: { b: '   ' } }
    expect(hasEmptyLeaf(obj)).toBe(true)
  })

  it('返回空路径列表供调试', () => {
    const obj = { a: { b: '' }, c: 'ok' }
    const result = hasEmptyLeaf(obj, { returnPaths: true })
    expect(result).toEqual({ hasEmpty: true, paths: ['a.b'] })
  })
})

describe('integrity — countLeaves', () => {
  it('zh / en 叶子数应相等', () => {
    expect(countLeaves(zh)).toBe(countLeaves(en))
  })

  it('应返回数字类型', () => {
    expect(typeof countLeaves(zh)).toBe('number')
    expect(countLeaves(zh)).toBeGreaterThan(0)
  })

  it('空对象应返回 0', () => {
    expect(countLeaves({})).toBe(0)
  })
})

describe('integrity — diffKeys', () => {
  it('zh / en 镜像时返回空 diff', () => {
    const diff = diffKeys(zh, en)
    expect(diff).toEqual({ onlyInZh: [], onlyInEn: [] })
  })

  it('en 缺失键时 onlyInZh 应列出该键', () => {
    const partial = { common: { delete: 'Delete' } }
    const diff = diffKeys(zh, partial)
    expect(diff.onlyInZh.length).toBeGreaterThan(0)
    expect(diff.onlyInZh).toContain('common.search')
    expect(diff.onlyInEn).toEqual([])
  })

  it('zh 缺失键时 onlyInEn 应列出该键', () => {
    const partial = { common: { delete: '删除', search: '查找' } }
    const diff = diffKeys(partial, en)
    expect(diff.onlyInEn.length).toBeGreaterThan(0)
    expect(diff.onlyInZh).toEqual([])
  })
})
