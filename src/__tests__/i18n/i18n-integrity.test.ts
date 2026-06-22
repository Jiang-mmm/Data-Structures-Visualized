import { describe, it, expect } from 'vitest'
import { zh, en, type Locale } from '../../i18n/locales'

/**
 * 遍历 Locale 对象，收集所有「叶子字符串」键路径 + 字符串值。
 * 用于校验 zh / en 两侧键的完整性（两边都不能为空字符串或仅空白）。
 */
function collectLeafStrings(obj: unknown, prefix = ''): Array<{ path: string; value: string }> {
  const out: Array<{ path: string; value: string }> = []
  if (obj === null || obj === undefined) return out
  if (typeof obj === 'string') {
    out.push({ path: prefix, value: obj })
    return out
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out.push(...collectLeafStrings(v, prefix ? `${prefix}.${k}` : k))
    }
  }
  return out
}

describe('i18n locale integrity', () => {
  it('zh 和 en 应该有完全相同的键路径集合', () => {
    const zhKeys = new Set(collectLeafStrings(zh).map((l) => l.path))
    const enKeys = new Set(collectLeafStrings(en).map((l) => l.path))
    expect(zhKeys.size).toBeGreaterThan(0)

    const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k))
    const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k))
    expect(missingInEn).toEqual([])
    expect(missingInZh).toEqual([])
  })

  it('complexity 命名空间 zh 包含所有 13 个键', () => {
    const required: Array<keyof Locale['complexity']> = [
      'title', 'name', 'useCase', 'time', 'space', 'best', 'average', 'worst',
      'glossaryTitle', 'glossarySubtitle', 'emptyHint', 'showMore', 'showLess',
    ]
    for (const k of required) {
      expect(zh.complexity[k], `zh.complexity.${k}`).toBeTruthy()
    }
  })

  it('complexity 命名空间 en 包含所有 13 个键', () => {
    const required: Array<keyof Locale['complexity']> = [
      'title', 'name', 'useCase', 'time', 'space', 'best', 'average', 'worst',
      'glossaryTitle', 'glossarySubtitle', 'emptyHint', 'showMore', 'showLess',
    ]
    for (const k of required) {
      expect(en.complexity[k], `en.complexity.${k}`).toBeTruthy()
    }
  })

  it('algorithms 命名空间应至少覆盖 16 个数据结构', () => {
    const algoKeys = Object.keys(zh.algorithms)
    expect(algoKeys.length).toBeGreaterThanOrEqual(16)
    expect(Object.keys(en.algorithms).length).toBe(algoKeys.length)
  })

  it('algorithms 每个条目在 zh 和 en 都包含 7 个字段且非空', () => {
    const requiredFields: Array<keyof Locale['algorithms']['array']> = [
      'name', 'description', 'useCase', 'best', 'average', 'worst', 'space',
    ]
    for (const key of Object.keys(zh.algorithms) as Array<keyof Locale['algorithms']>) {
      for (const f of requiredFields) {
        const zhVal = zh.algorithms[key][f]
        const enVal = en.algorithms[key][f]
        expect(zhVal, `zh.algorithms.${key}.${f}`).toBeTruthy()
        expect(enVal, `en.algorithms.${key}.${f}`).toBeTruthy()
      }
    }
  })

  it('关键算法术语应包含预期条目（防回归）', () => {
    const required = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree',
      'redBlackTree', 'bTree', 'segmentTree', 'heap', 'trie', 'hash', 'graph',
      'skipList', 'unionFind', 'sort']
    for (const k of required) {
      expect(zh.algorithms[k as keyof Locale['algorithms']]).toBeDefined()
      expect(en.algorithms[k as keyof Locale['algorithms']]).toBeDefined()
    }
  })

  it('zh 数组算法的复杂度字段应符合预期', () => {
    // 抽样验证：数组访问 O(1) 必有
    expect(zh.algorithms.array.best).toBe('O(1)')
    expect(en.algorithms.array.best).toBe('O(1)')
    // 排序平均复杂度
    expect(zh.algorithms.sort.average).toBe('O(n log n)')
    expect(en.algorithms.sort.average).toBe('O(n log n)')
  })

  it('所有叶子字符串非空（zh + en）', () => {
    const zhLeaves = collectLeafStrings(zh)
    const enLeaves = collectLeafStrings(en)
    for (const { path, value } of zhLeaves) {
      expect(value.trim().length, `zh.${path} should be non-empty`).toBeGreaterThan(0)
    }
    for (const { path, value } of enLeaves) {
      expect(value.trim().length, `en.${path} should be non-empty`).toBeGreaterThan(0)
    }
  })
})
