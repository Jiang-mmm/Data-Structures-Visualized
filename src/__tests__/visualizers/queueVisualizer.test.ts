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
      if (p === 'filter') return () => c
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
  getDefaultEasing: () => 'easeOutCubic',
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderQueue, animateEnqueue, animateDequeue, animateFront, layout } = await import('../../visualizers/queueVisualizer')

describe('queueVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 300, top: 0, left: 0, right: 800, bottom: 300, x: 0, y: 0, toJSON: () => {} })
  })

  describe('layout', () => {
    it('应该水平居中队列(队列中心等于视口中心)', () => {
      const { startX, totalWidth } = layout([1, 2, 3], 800, 300)
      const center = startX + totalWidth / 2
      expect(center).toBe(400)
    })

    it('应该计算正确的 startX 使元素水平居中', () => {
      const { startX, totalWidth } = layout([1, 2, 3], 800, 300)
      expect(startX).toBe((800 - totalWidth) / 2)
    })

    it('应该垂直居中元素', () => {
      const { startY } = layout([1, 2, 3], 800, 300)
      expect(startY).toBe((300 - 50) / 2)
    })

    it('应该正确计算 totalWidth', () => {
      const { totalWidth } = layout([1, 2, 3, 4], 800, 300)
      expect(totalWidth).toBe(4 * (70 + 10) - 10)
    })

    it('应该居中单元素队列', () => {
      const { startX, totalWidth } = layout([42], 800, 300)
      expect(startX).toBe((800 - totalWidth) / 2)
      expect(startX + totalWidth / 2).toBe(400)
    })

    it('应该在大数据集时钳制 startX 不为负值', () => {
      const bigData = Array.from({ length: 15 }, (_, i) => i)
      const { startX } = layout(bigData, 800, 300)
      expect(startX).toBeGreaterThanOrEqual(0)
    })

    it('应该在 totalWidth 超过 width 时将 startX 钳制为 0', () => {
      const bigData = Array.from({ length: 20 }, (_, i) => i)
      const { startX, totalWidth } = layout(bigData, 800, 300)
      expect(totalWidth).toBeGreaterThan(800)
      expect(startX).toBe(0)
    })

    it('应该在窄视口下保证 startX 非负', () => {
      const { startX } = layout([1, 2, 3, 4, 5], 100, 300)
      expect(startX).toBeGreaterThanOrEqual(0)
    })
  })

  describe('renderQueue', () => {
    it('应该能够渲染空队列', () => {
      expect(() => renderQueue(svg, [], { width: 800, height: 300 })).not.toThrow()
    })

    it('应该能够渲染有数据的队列', () => {
      expect(() => renderQueue(svg, [1, 2, 3], { width: 800, height: 300 })).not.toThrow()
    })

    it('应该处理 null 数据', () => {
      expect(() => renderQueue(svg, null as any, { width: 800, height: 300 })).not.toThrow()
    })

    it('应该处理 undefined 数据', () => {
      expect(() => renderQueue(svg, undefined as any, { width: 800, height: 300 })).not.toThrow()
    })

    it('应该渲染单元素队列', () => {
      expect(() => renderQueue(svg, [42], { width: 800, height: 300 })).not.toThrow()
    })

    it('应该处理大数据集', () => {
      const data = Array.from({ length: 50 }, (_, i) => i)
      expect(() => renderQueue(svg, data, { width: 800, height: 300 })).not.toThrow()
    })

    it('应该处理 isDark 选项', () => {
      expect(() => renderQueue(svg, [1, 2], { width: 800, height: 300, isDark: true })).not.toThrow()
    })

    it('应该使用默认选项', () => {
      expect(() => renderQueue(svg, [1, 2])).not.toThrow()
    })
  })

  describe('animateEnqueue', () => {
    it('应该能够执行入队动画', async () => {
      await expect(animateEnqueue(svg, 3, [1, 2], { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该在大数据集时跳过动画', async () => {
      const bigData = Array.from({ length: 30 }, (_, i) => i)
      await expect(animateEnqueue(svg, 100, bigData, { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该在空队列上执行入队', async () => {
      await expect(animateEnqueue(svg, 10, [], { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该使用默认选项', async () => {
      await expect(animateEnqueue(svg, 5, [1, 2])).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const abortedAnim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateEnqueue(svg, 3, [1, 2], { width: 800, height: 300 }, abortedAnim)).resolves.toBeUndefined()
    })
  })

  describe('animateDequeue', () => {
    it('应该能够执行出队动画', async () => {
      await expect(animateDequeue(svg, [1, 2, 3], { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该在大数据集时跳过动画', async () => {
      const bigData = Array.from({ length: 30 }, (_, i) => i)
      await expect(animateDequeue(svg, bigData, { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该使用默认选项', async () => {
      await expect(animateDequeue(svg, [1, 2, 3])).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const abortedAnim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateDequeue(svg, [1, 2, 3], { width: 800, height: 300 }, abortedAnim)).resolves.toBeUndefined()
    })
  })

  describe('animateFront', () => {
    it('应该能够执行查看队首动画', async () => {
      await expect(animateFront(svg, [1, 2, 3], { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该在空队列时跳过', async () => {
      await expect(animateFront(svg, [], { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该在大数据集时跳过动画', async () => {
      const bigData = Array.from({ length: 30 }, (_, i) => i)
      await expect(animateFront(svg, bigData, { width: 800, height: 300 })).resolves.toBeUndefined()
    })

    it('应该使用默认选项', async () => {
      await expect(animateFront(svg, [1, 2, 3])).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const abortedAnim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateFront(svg, [1, 2, 3], { width: 800, height: 300 }, abortedAnim)).resolves.toBeUndefined()
    })
  })
})
