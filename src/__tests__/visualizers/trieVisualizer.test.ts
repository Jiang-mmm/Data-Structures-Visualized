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
      if (p === 'select') return () => c
      if (p === 'selectAll') return () => c
      if (p === 'append') return () => c
      if (p === 'remove') return () => c
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
    textMuted: '#9ca3af', containerStroke: '#d1d5db', edgeDefault: '#9ca3af', edgeActive: '#f59e0b',
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
    { id: '1', prefix: 'a', char: 'a', isEndOfWord: false, parent: '', depth: 1, childrenKeys: ['p'] },
    { id: '2', prefix: 'ap', char: 'p', isEndOfWord: false, parent: 'a', depth: 2, childrenKeys: ['p'] },
    { id: '3', prefix: 'app', char: 'p', isEndOfWord: false, parent: 'ap', depth: 3, childrenKeys: ['l'] },
    { id: '4', prefix: 'appl', char: 'l', isEndOfWord: false, parent: 'app', depth: 4, childrenKeys: ['e'] },
    { id: '5', prefix: 'apple', char: 'e', isEndOfWord: true, parent: 'appl', depth: 5, childrenKeys: [] },
  ],
  edges: [
    { from: '1', to: '2', char: 'p' },
    { from: '2', to: '3', char: 'p' },
    { from: '3', to: '4', char: 'l' },
    { from: '4', to: '5', char: 'e' },
  ],
}

const singleNodeTrie = {
  nodes: [{ id: '1', prefix: 'a', char: 'a', isEndOfWord: true, parent: '', depth: 1, childrenKeys: [] }],
  edges: [],
}

describe('trieVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderTrie', () => {
    it('应该能够渲染空字典树', () => {
      expect(() => renderTrie(svg, { nodes: [], edges: [] }, {})).not.toThrow()
    })

    it('应该能够渲染有数据的字典树', () => {
      expect(() => renderTrie(svg, trieData, {})).not.toThrow()
    })

    it('应该渲染单节点字典树', () => {
      expect(() => renderTrie(svg, singleNodeTrie, {})).not.toThrow()
    })

    it('应该处理 null 数据', () => {
      expect(() => renderTrie(svg, null as any, {})).not.toThrow()
    })

    it('应该处理 undefined 数据', () => {
      expect(() => renderTrie(svg, undefined as any, {})).not.toThrow()
    })

    it('应该处理 isDark 选项', () => {
      expect(() => renderTrie(svg, trieData, { isDark: true })).not.toThrow()
    })

    it('应该处理空 options', () => {
      expect(() => renderTrie(svg, trieData)).not.toThrow()
    })

    it('应该处理只有节点没有边的数据', () => {
      expect(() => renderTrie(svg, { nodes: trieData.nodes, edges: [] }, {})).not.toThrow()
    })

    it('应该处理大数据集', () => {
      const bigNodes = Array.from({ length: 50 }, (_, i) => ({
        id: String(i), prefix: `p${i}`, char: String.fromCharCode(97 + (i % 26)),
        isEndOfWord: i % 5 === 0, parent: i > 0 ? `p${i - 1}` : '', depth: i + 1, childrenKeys: [],
      }))
      const bigEdges = Array.from({ length: 49 }, (_, i) => ({
        from: String(i), to: String(i + 1), char: String.fromCharCode(97 + ((i + 1) % 26)),
      }))
      expect(() => renderTrie(svg, { nodes: bigNodes, edges: bigEdges }, {})).not.toThrow()
    })
  })

  describe('animateInsertTrie', () => {
    it('应该能够执行插入动画（有 word 参数）', async () => {
      await expect(animateInsertTrie(svg, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行插入动画（无 word 参数，回退模式）', async () => {
      await expect(animateInsertTrie(svg)).resolves.toBeUndefined()
    })

    it('应该处理空字符串', async () => {
      await expect(animateInsertTrie(svg, '')).resolves.toBeUndefined()
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

    it('应该处理空字符串搜索', async () => {
      await expect(animateSearchTrie(svg, false, '')).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteTrie', () => {
    it('应该能够执行删除动画（有 word 参数）', async () => {
      await expect(animateDeleteTrie(svg, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行删除动画（无 word 参数，回退模式）', async () => {
      await expect(animateDeleteTrie(svg)).resolves.toBeUndefined()
    })

    it('应该处理空字符串删除', async () => {
      await expect(animateDeleteTrie(svg, '')).resolves.toBeUndefined()
    })
  })
})
