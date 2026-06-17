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
  getDefaultEasing: () => 'easeOutCubic',
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderStack, animatePush, animatePop, animatePeek } = await import('../../visualizers/stackVisualizer')

describe('stackVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 400, height: 600, top: 0, left: 0, right: 400, bottom: 600, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderStack', () => {
    it('应该能够渲染空栈', () => {
      expect(() => renderStack(svg, [], { width: 400, height: 600 })).not.toThrow()
    })

    it('应该能够渲染有数据的栈', () => {
      expect(() => renderStack(svg, [1, 2, 3], { width: 400, height: 600 })).not.toThrow()
    })

    it('应该能够渲染满栈', () => {
      expect(() => renderStack(svg, Array.from({ length: 10 }, (_, i) => i + 1), { width: 400, height: 600 })).not.toThrow()
    })
  })

  describe('animatePush', () => {
    it('应该能够执行入栈动画', async () => {
      await expect(animatePush(svg, 3, [1, 2], { width: 400, height: 600 })).resolves.toBeUndefined()
    })

    it('应该能够推入空栈', async () => {
      await expect(animatePush(svg, 1, [], { width: 400, height: 600 })).resolves.toBeUndefined()
    })
  })

  describe('animatePop', () => {
    it('应该能够执行出栈动画', async () => {
      await expect(animatePop(svg, [1, 2, 3], { width: 400, height: 600 })).resolves.toBeUndefined()
    })
  })

  describe('animatePeek', () => {
    it('应该能够执行查看栈顶动画', async () => {
      await expect(animatePeek(svg, [1, 2, 3], { width: 400, height: 600 })).resolves.toBeUndefined()
    })
  })
})
