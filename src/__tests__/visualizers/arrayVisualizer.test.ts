import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create chainable mock
function chainable() {
  const m: Record<string, unknown> = {}
  const c = new Proxy(m, {
    get(t, p) {
      if (p === 'empty') return () => true
      if (p === 'nodes') return () => []
      if (p === 'node') return () => null
      if (p === 'size') return () => 0
      if (p === 'text') return () => c
      if (p === 'attr') return () => c
      if (p === 'style') return () => c
      if (p === 'on') return () => c
      if (p === 'interrupt') return () => c
      if (p === Symbol.iterator) return undefined
      if (!(p in t)) t[p as string] = vi.fn(() => chainable())
      return t[p as string]
    },
  })
  return c
}

vi.mock('../../utils/d3Imports', () => ({ select: vi.fn(() => chainable()) }))
vi.mock('../../utils/themeColors', () => ({
  getColors: () => ({
    nodeDefault: '#2563eb', nodeDefaultStroke: '#1e40af', nodeActive: '#f59e0b',
    nodeActiveStroke: '#d97706', nodeRoot: '#10b981', nodeRootStroke: '#059669',
    nodeLeaf: '#8b5cf6', nodeLeafStroke: '#7c3aed', nodeVisited: '#8b5cf6',
    nodeVisitedStroke: '#7c3aed', nodeError: '#ef4444', nodeErrorStroke: '#dc2626',
    textWhite: '#ffffff', textLight: '#6b7280', textSecondary: '#6b7280',
    containerStroke: '#d1d5db', edgeDefault: '#9ca3af', edgeActive: '#f59e0b',
  }),
  detectDarkMode: () => false,
  ensureGradientDefs: vi.fn(),
  gradUrl: (name: string) => `url(#grad-${name})`,
}))
vi.mock('../../utils/animationEngine', () => ({
  duration: (ms: number) => ms,
  EASING: { easeOutCubic: 'easeOutCubic', easeInCubic: 'easeInCubic', easeOutBack: 'easeOutBack', easeOutElastic: 'easeOutElastic' },
  transitionEnd: vi.fn(() => Promise.resolve()),
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderArray, animateInsert, animateDelete, animateSearch } = await import('../../visualizers/arrayVisualizer')

describe('arrayVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderArray', () => {
    it('应该能够渲染空数组', () => {
      expect(() => renderArray(svg, [], { width: 800, height: 400 })).not.toThrow()
    })

    it('应该能够渲染有数据的数组', () => {
      expect(() => renderArray(svg, [1, 2, 3, 4, 5], { width: 800, height: 400 })).not.toThrow()
    })

    it('应该能够渲染单个元素', () => {
      expect(() => renderArray(svg, [42], { width: 800, height: 400 })).not.toThrow()
    })

    it('应该能够处理大数据集', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => i + 1)
      expect(() => renderArray(svg, largeData, { width: 800, height: 400 })).not.toThrow()
    })
  })

  describe('animateInsert', () => {
    it('应该能够执行插入动画', async () => {
      await expect(animateInsert(svg, 4, [1, 2, 3], { width: 800, height: 400 })).resolves.toBeUndefined()
    })
  })

  describe('animateDelete', () => {
    it('应该能够执行删除动画', async () => {
      await expect(animateDelete(svg, 1, [1, 2, 3, 4], { width: 800, height: 400 })).resolves.toBeUndefined()
    })
  })

  describe('animateSearch', () => {
    it('应该能够执行查找动画（找到）', async () => {
      await expect(animateSearch(svg, 2, true, [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行查找动画（未找到）', async () => {
      await expect(animateSearch(svg, -1, false, [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })
  })
})
