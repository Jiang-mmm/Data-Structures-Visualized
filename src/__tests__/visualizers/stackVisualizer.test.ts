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

const { renderStack, animatePush, animatePop, animatePeek, layout, RECT_WIDTH, MAX_RECT_WIDTH, RECT_HEIGHT, GAP } = await import('../../visualizers/stackVisualizer')

describe('stackVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 400, height: 600, top: 0, left: 0, right: 400, bottom: 600, x: 0, y: 0, toJSON: () => {} })
  })

  describe('layout 居中计算', () => {
    it('应该水平居中:startX = (width - RECT_WIDTH) / 2', () => {
      const width = 400
      const { startX } = layout([1, 2, 3], width, 600)
      expect(startX).toBe((width - RECT_WIDTH) / 2)
      expect(startX).toBe(160)
    })

    it('栈元素中心 X 应等于 width / 2', () => {
      const width = 400
      const { startX } = layout([1, 2, 3], width, 600)
      const centerX = startX + RECT_WIDTH / 2
      expect(centerX).toBe(width / 2)
    })

    it('应该垂直居中:栈顶 topY = (height - totalHeight) / 2', () => {
      const data = [1, 2, 3]
      const height = 600
      const { topY, totalHeight } = layout(data, 400, height)
      expect(topY).toBe((height - totalHeight) / 2)
    })

    it('栈垂直中心应等于 height / 2', () => {
      const data = [1, 2, 3]
      const height = 600
      const { startY, topY } = layout(data, 400, height)
      const stackTop = topY
      const stackBottom = startY + RECT_HEIGHT
      const stackCenter = (stackTop + stackBottom) / 2
      expect(stackCenter).toBe(height / 2)
    })

    it('元素不应定位在左上角 (0, 0)', () => {
      const { startX, startY, topY } = layout([1, 2, 3], 400, 600)
      expect(startX).toBeGreaterThan(0)
      expect(startY).toBeGreaterThan(0)
      expect(topY).toBeGreaterThan(0)
    })

    it('单元素栈应水平且垂直居中', () => {
      const width = 400
      const height = 600
      const { startX, startY, topY } = layout([42], width, height)
      expect(startX).toBe((width - RECT_WIDTH) / 2)
      expect(topY).toBe((height - RECT_HEIGHT) / 2)
      expect(startY).toBe(topY)
    })

    it('不同数据量下均应保持水平居中', () => {
      const width = 800
      for (const n of [1, 2, 5, 10]) {
        const data = Array.from({ length: n }, (_, i) => i)
        const { startX } = layout(data, width, 400)
        expect(startX).toBe((width - RECT_WIDTH) / 2)
        expect(startX + RECT_WIDTH / 2).toBe(width / 2)
      }
    })

    it('totalHeight 应正确计算:n * (RECT_HEIGHT + GAP) - GAP', () => {
      for (const n of [1, 2, 3, 5]) {
        const data = Array.from({ length: n }, (_, i) => i)
        const { totalHeight } = layout(data, 400, 600)
        expect(totalHeight).toBe(n * (RECT_HEIGHT + GAP) - GAP)
      }
    })

    it('小屏下矩形宽度应自适应且不低于 40px', () => {
      const { rectWidth } = layout([1, 2, 3], 200, 400)
      expect(rectWidth).toBeLessThanOrEqual(MAX_RECT_WIDTH)
      expect(rectWidth).toBeGreaterThanOrEqual(40)
    })

    it('大屏下矩形宽度应使用最大宽度', () => {
      const { rectWidth } = layout([1, 2, 3], 800, 600)
      expect(rectWidth).toBe(MAX_RECT_WIDTH)
    })

    it('栈底元素 Y (startY) 应使栈整体垂直居中', () => {
      const data = [1, 2, 3, 4]
      const height = 600
      const { startY, totalHeight } = layout(data, 400, height)
      const bottomEdge = startY + RECT_HEIGHT
      const topEdge = startY - (data.length - 1) * (RECT_HEIGHT + GAP)
      const center = (topEdge + bottomEdge) / 2
      expect(center).toBe(height / 2)
      expect(bottomEdge - topEdge).toBe(totalHeight)
    })
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

    it('应在大于等于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 30 }, (_, i) => i)
      await expect(animatePush(svg, 99, largeData, { width: 400, height: 600 })).resolves.toBeUndefined()
    })
  })

  describe('animatePop', () => {
    it('应该能够执行出栈动画', async () => {
      await expect(animatePop(svg, [1, 2, 3], { width: 400, height: 600 })).resolves.toBeUndefined()
    })

    it('应在大于等于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 30 }, (_, i) => i)
      await expect(animatePop(svg, largeData, { width: 400, height: 600 })).resolves.toBeUndefined()
    })
  })

  describe('animatePeek', () => {
    it('应该能够执行查看栈顶动画', async () => {
      await expect(animatePeek(svg, [1, 2, 3], { width: 400, height: 600 })).resolves.toBeUndefined()
    })

    it('应在大于等于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 30 }, (_, i) => i)
      await expect(animatePeek(svg, largeData, { width: 400, height: 600 })).resolves.toBeUndefined()
    })
  })
})
