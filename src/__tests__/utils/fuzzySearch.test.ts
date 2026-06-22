import { describe, it, expect } from 'vitest'
import { fuzzyMatch, fuzzyMatchAny } from '../../utils/fuzzySearch'

describe('fuzzyMatch', () => {
  it('空查询应视为匹配', () => {
    const result = fuzzyMatch('', 'bubble sort')
    expect(result.matched).toBe(true)
    expect(result.score).toBe(0)
  })

  it('完全匹配得分最高', () => {
    const result = fuzzyMatch('bubble', 'bubble')
    expect(result.matched).toBe(true)
    expect(result.score).toBeGreaterThan(0)
  })

  it('应支持字符顺序部分匹配', () => {
    const result = fuzzyMatch('bubb', 'bubble sort')
    expect(result.matched).toBe(true)
    expect(result.score).toBeGreaterThan(0)
  })

  it('连续匹配应获得更高分', () => {
    const continuous = fuzzyMatch('bub', 'bubble')
    const scattered = fuzzyMatch('bub', 'buy ugly boots')
    expect(continuous.score).toBeGreaterThan(scattered.score)
  })

  it('首字符匹配应获得额外加分', () => {
    const startMatch = fuzzyMatch('b', 'bubble')
    const midMatch = fuzzyMatch('u', 'bubble')
    expect(startMatch.score).toBeGreaterThan(midMatch.score)
  })

  it('应支持大小写不敏感匹配', () => {
    const result = fuzzyMatch('BUBB', 'bubble')
    expect(result.matched).toBe(true)
  })

  it('未匹配时应返回 matched=false', () => {
    const result = fuzzyMatch('xyz', 'bubble')
    expect(result.matched).toBe(false)
  })

  it('部分匹配但未完全命中时按覆盖比例降级', () => {
    const result = fuzzyMatch('bubzzz', 'bubble')
    expect(result.matched).toBe(false)
    expect(result.score).toBeLessThan(fuzzyMatch('bub', 'bubble').score)
  })
})

describe('fuzzyMatchAny', () => {
  it('应返回候选文本中的最高分', () => {
    const result = fuzzyMatchAny('bubb', ['bubble sort', 'quick sort', 'merge sort'])
    expect(result.matched).toBe(true)
    expect(result.score).toBeGreaterThan(0)
  })

  it('所有文本都不匹配时应返回 matched=false', () => {
    const result = fuzzyMatchAny('xyz', ['bubble', 'quick', 'merge'])
    expect(result.matched).toBe(false)
  })
})
