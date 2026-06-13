import { describe, it, expect, vi, beforeEach } from 'vitest'

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

const { renderTrie, animateInsertTrie, animateSearchTrie, animateDeleteTrie } = await import('../../visualizers/trieVisualizer')

const trieData = {
  nodes: [
    { char: 'a', isEndOfWord: false, parent: '' },
    { char: 'ap', isEndOfWord: false, parent: 'a' },
    { char: 'app', isEndOfWord: false, parent: 'ap' },
    { char: 'appl', isEndOfWord: false, parent: 'app' },
    { char: 'apple', isEndOfWord: true, parent: 'appl' },
  ],
}

describe('trieVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderTrie', () => {
    it('应该能够渲染空字典树', () => {
      expect(() => renderTrie(svg, { nodes: [] }, {})).not.toThrow()
    })

    it('应该能够渲染有数据的字典树', () => {
      expect(() => renderTrie(svg, trieData, {})).not.toThrow()
    })
  })

  describe('animateInsertTrie', () => {
    it('应该能够执行插入动画（有 word 参数）', async () => {
      await expect(animateInsertTrie(svg, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行插入动画（无 word 参数，回退模式）', async () => {
      await expect(animateInsertTrie(svg)).resolves.toBeUndefined()
    })
  })

  describe('animateSearchTrie', () => {
    it('应该能够执行搜索动画（找到，有 word 参数）', async () => {
      await expect(animateSearchTrie(svg, true, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行搜索动画（未找到，有 word 参数）', async () => {
      await expect(animateSearchTrie(svg, false, 'appx')).resolves.toBeUndefined()
    })

    it('应该能够执行搜索动画（无 word 参数，回退模式）', async () => {
      await expect(animateSearchTrie(svg, true)).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteTrie', () => {
    it('应该能够执行删除动画（有 word 参数）', async () => {
      await expect(animateDeleteTrie(svg, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行删除动画（无 word 参数，回退模式）', async () => {
      await expect(animateDeleteTrie(svg)).resolves.toBeUndefined()
    })
  })
})
