import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAlgorithmGlossary } from '../../hooks/useAlgorithmGlossary'

vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({
    t: (key: string) => {
      // 用「键」当作解析结果，便于断言键路径被正确访问
      if (key === 'algorithms.array.name') return 'Array'
      if (key === 'algorithms.array.description') return 'desc'
      if (key === 'algorithms.array.useCase') return 'use'
      if (key === 'algorithms.array.best') return 'O(1)'
      if (key === 'algorithms.array.average') return 'O(n)'
      if (key === 'algorithms.array.worst') return 'O(n)'
      if (key === 'algorithms.array.space') return 'O(n)'
      return key
    },
  }),
}))

describe('useAlgorithmGlossary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该返回 16 个算法条目', () => {
    const { result } = renderHook(() => useAlgorithmGlossary())
    expect(result.current).toHaveLength(16)
  })

  it('每条应包含 id / name / description / useCase / complexity 字段', () => {
    const { result } = renderHook(() => useAlgorithmGlossary())
    for (const item of result.current) {
      expect(item.id).toBeTypeOf('string')
      expect(item.name).toBeTypeOf('string')
      expect(item.description).toBeTypeOf('string')
      expect(item.useCase).toBeTypeOf('string')
      expect(item.complexity.best).toBeTypeOf('string')
      expect(item.complexity.average).toBeTypeOf('string')
      expect(item.complexity.worst).toBeTypeOf('string')
      expect(item.complexity.space).toBeTypeOf('string')
    }
  })

  it('id 应与 STRUCTURE_KEYS / locales 对应（关键条目）', () => {
    const { result } = renderHook(() => useAlgorithmGlossary())
    const ids = result.current.map((i) => i.id)
    for (const id of [
      'array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree',
      'redBlackTree', 'bTree', 'segmentTree', 'heap', 'trie', 'hash',
      'graph', 'skipList', 'unionFind', 'sort',
    ]) {
      expect(ids).toContain(id)
    }
  })

  it('第一个条目应解析到 t() 调用结果', () => {
    const { result } = renderHook(() => useAlgorithmGlossary())
    const array = result.current[0]
    expect(array.id).toBe('array')
    expect(array.name).toBe('Array')
    expect(array.complexity.best).toBe('O(1)')
  })

  it('id 应该唯一', () => {
    const { result } = renderHook(() => useAlgorithmGlossary())
    const ids = result.current.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
