import { describe, it, expect } from 'vitest'
import { buildSearchIndex } from '../../data/searchIndex'

describe('buildSearchIndex', () => {
  const index = buildSearchIndex()

  it('应包含页面与学习步骤两类数据', () => {
    const pages = index.filter(item => item.category === 'page')
    const learning = index.filter(item => item.category === 'learning')
    expect(pages.length).toBeGreaterThan(0)
    expect(learning.length).toBeGreaterThan(0)
  })

  it('学习步骤应提取复杂度标签', () => {
    const withComplexity = index.filter(
      item => item.category === 'learning' && (item.complexity?.length ?? 0) > 0
    )
    expect(withComplexity.length / index.filter(item => item.category === 'learning').length).toBeGreaterThan(0.5)
  })

  it('复杂度标签应统一为无空格小写格式', () => {
    const withComplexity = index.filter(item => (item.complexity?.length ?? 0) > 0)
    for (const item of withComplexity) {
      for (const c of item.complexity!) {
        expect(c).toBe(c.toLowerCase().replace(/\s+/g, ''))
      }
    }
  })

  it('页面项不应包含复杂度', () => {
    const pagesWithComplexity = index.filter(
      item => item.category === 'page' && (item.complexity?.length ?? 0) > 0
    )
    expect(pagesWithComplexity).toHaveLength(0)
  })
})
