import { describe, it, expect, vi, beforeEach } from 'vitest'

function chainable() {
  const m: Record<string, unknown> = {}
  const c = new Proxy(m, {
    get(t, p) {
      if (p === 'empty') return () => true
      if (p === 'nodes') return (): unknown[] => []
      if (p === 'node') return (): null => null
      if (p === 'size') return () => 0
      if (p === 'text') return () => c
      if (p === 'attr') return () => c
      if (p === 'style') return () => c
      if (p === 'on') return (_event: string, cb?: Function) => { if (cb) cb(); return c }
      if (p === 'interrupt') return () => c
      if (p === Symbol.iterator) return undefined
      if (!(p in t)) t[p as string] = vi.fn(() => chainable())
      return t[p as string]
    },
  })
  return c
}

vi.mock('../../utils/d3Imports', () => ({
  select: vi.fn(() => chainable()),
  d3Drag: vi.fn(() => ({ on: vi.fn(() => ({ on: vi.fn(() => ({ on: vi.fn() })) })) })),
}))
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
  getDefaultEasing: () => 'easeOutCubic',
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderTree, animateInsertNode, animateSearch, animateDeleteNode, clearTreePositions } = await import('../../visualizers/treeVisualizer')

describe('treeVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 500, top: 0, left: 0, right: 800, bottom: 500, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderTree', () => {
    it('应该能够渲染空树', () => {
      expect(() => renderTree(svg, [], { width: 800, height: 500 })).not.toThrow()
    })

    it('应该能够渲染有数据的树', () => {
      expect(() => renderTree(svg, [5, 3, 7, 1, 4, 6, 8], { width: 800, height: 500 })).not.toThrow()
    })

    it('应该能够渲染单节点树', () => {
      expect(() => renderTree(svg, [5], { width: 800, height: 500 })).not.toThrow()
    })
  })

  describe('animateInsertNode', () => {
    it('应该能够执行插入动画', async () => {
      await expect(animateInsertNode(svg, 4, [5, 3, 7], { width: 800, height: 500 })).resolves.toBeUndefined()
    })
  })

  describe('animateSearch', () => {
    it('应该能够执行搜索动画（找到）', async () => {
      await expect(animateSearch(svg, [3, 1], 1, [5, 3, 7, 1, 4], { width: 800, height: 500 })).resolves.toBeUndefined()
    })

    it('应该能够执行搜索动画（未找到）', async () => {
      await expect(animateSearch(svg, [], 0, [5, 3, 7], { width: 800, height: 500 })).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteNode', () => {
    it('应该能够执行删除动画', async () => {
      await expect(animateDeleteNode(svg, 3, [5, 3, 7, 1, 4], { width: 800, height: 500 })).resolves.toBeUndefined()
    })
  })

  describe('clearTreePositions', () => {
    it('应该能够清除树位置缓存', () => {
      expect(() => clearTreePositions()).not.toThrow()
    })
  })
})
