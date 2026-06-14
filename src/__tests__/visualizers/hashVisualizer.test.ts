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

const { renderHash, animateInsertHash, animateSearchHash, animateDeleteHash } = await import('../../visualizers/hashVisualizer')

const hashData = [
  { key: 12, value: 'Alice' },
  { key: 25, value: 'Bob' },
]
const hashOpts = { hashFn: (key: number | string) => typeof key === 'number' ? key % 10 : 0 }

describe('hashVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderHash', () => {
    it('应该能够渲染空哈希表', () => {
      expect(() => renderHash(svg, [], hashOpts)).not.toThrow()
    })

    it('应该能够渲染有数据的哈希表', () => {
      expect(() => renderHash(svg, hashData, hashOpts)).not.toThrow()
    })
  })

  describe('animateInsertHash', () => {
    it('应该能够执行插入动画', async () => {
      await expect(animateInsertHash(svg, 42, 'Charlie', hashOpts)).resolves.toBeUndefined()
    })
  })

  describe('animateSearchHash', () => {
    it('应该能够执行查找动画（找到）', async () => {
      await expect(animateSearchHash(svg, 12, true, hashData, hashOpts)).resolves.toBeUndefined()
    })

    it('应该能够执行查找动画（未找到）', async () => {
      await expect(animateSearchHash(svg, 99, false, hashData, hashOpts)).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteHash', () => {
    it('应该能够执行删除动画', async () => {
      await expect(animateDeleteHash(svg, 12, hashData, hashOpts)).resolves.toBeUndefined()
    })
  })

  describe('边界条件', () => {
    it('renderHash 应处理大量数据', () => {
      const largeData = Array.from({ length: 30 }, (_, i) => ({ key: i, value: `v${i}` }))
      expect(() => renderHash(svg, largeData, hashOpts)).not.toThrow()
    })

    it('animateSearchHash 应跳过大型数据集', async () => {
      const largeData = Array.from({ length: 60 }, (_, i) => ({ key: i, value: `v${i}` }))
      await expect(animateSearchHash(svg, 0, true, largeData, hashOpts)).resolves.toBeUndefined()
    })

    it('animateDeleteHash 应跳过大型数据集', async () => {
      const largeData = Array.from({ length: 60 }, (_, i) => ({ key: i, value: `v${i}` }))
      await expect(animateDeleteHash(svg, 0, largeData, hashOpts)).resolves.toBeUndefined()
    })

    it('animateInsertHash 应在中止时提前退出', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateInsertHash(svg, 42, 'Charlie', hashOpts, anim)).resolves.toBeUndefined()
    })

    it('animateSearchHash 应在中止时提前退出', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateSearchHash(svg, 12, true, hashData, hashOpts, anim)).resolves.toBeUndefined()
    })

    it('animateDeleteHash 应在中止时提前退出', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateDeleteHash(svg, 12, hashData, hashOpts, anim)).resolves.toBeUndefined()
    })

    it('renderHash 应处理 isDark 选项', () => {
      expect(() => renderHash(svg, hashData, { ...hashOpts, isDark: true })).not.toThrow()
    })

    it('renderHash 应处理无 width/height 选项', () => {
      expect(() => renderHash(svg, hashData, hashOpts)).not.toThrow()
    })
  })
})
