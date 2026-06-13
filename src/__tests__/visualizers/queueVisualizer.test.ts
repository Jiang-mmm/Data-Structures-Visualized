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

const { renderQueue, animateEnqueue, animateDequeue, animateFront } = await import('../../visualizers/queueVisualizer')

describe('queueVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 300, top: 0, left: 0, right: 800, bottom: 300, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderQueue', () => {
    it('应该能够渲染空队列', () => {
      expect(() => renderQueue(svg, [], { width: 800, height: 300 })).not.toThrow()
    })

    it('应该能够渲染有数据的队列', () => {
      expect(() => renderQueue(svg, [1, 2, 3], { width: 800, height: 300 })).not.toThrow()
    })
  })

  describe('animateEnqueue', () => {
    it('应该能够执行入队动画', async () => {
      await expect(animateEnqueue(svg, 3, [1, 2], { width: 800, height: 300 })).resolves.toBeUndefined()
    })
  })

  describe('animateDequeue', () => {
    it('应该能够执行出队动画', async () => {
      await expect(animateDequeue(svg, [1, 2, 3], { width: 800, height: 300 })).resolves.toBeUndefined()
    })
  })

  describe('animateFront', () => {
    it('应该能够执行查看队首动画', async () => {
      await expect(animateFront(svg, [1, 2, 3], { width: 800, height: 300 })).resolves.toBeUndefined()
    })
  })
})
