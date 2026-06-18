import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create chainable mock
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

  describe('renderArray 居中定位', () => {
    it('应该将数组元素水平居中（无 viewBox 时使用 options 尺寸）', () => {
      renderArray(svg, [1, 2, 3], { width: 800, height: 400 })
      const items = svg.querySelectorAll('.array-item')
      expect(items.length).toBe(3)
      // totalW = 3*70-10 = 200, startX = (800-200)/2 = 300
      // startY = max(20, floor((400-70)/2)) = 165
      expect(items[0].getAttribute('transform')).toBe('translate(300, 165)')
      expect(items[1].getAttribute('transform')).toBe('translate(370, 165)')
      expect(items[2].getAttribute('transform')).toBe('translate(440, 165)')
    })

    it('单个元素也应该水平居中', () => {
      renderArray(svg, [42], { width: 800, height: 400 })
      const items = svg.querySelectorAll('.array-item')
      expect(items.length).toBe(1)
      // totalW = 1*70-10 = 60, startX = (800-60)/2 = 370
      expect(items[0].getAttribute('transform')).toBe('translate(370, 165)')
    })

    it('不同数据量下居中定位一致（数组中心位于 width/2）', () => {
      const cases = [
        { data: [1, 2], expectedStart: 335, expectedEnd: 465 },
        { data: [1, 2, 3, 4, 5], expectedStart: 230, expectedEnd: 570 },
        { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], expectedStart: 55, expectedEnd: 745 },
      ]
      for (const { data, expectedStart, expectedEnd } of cases) {
        svg.innerHTML = ''
        renderArray(svg, data, { width: 800, height: 400 })
        const items = svg.querySelectorAll('.array-item')
        const firstTransform = items[0].getAttribute('transform') || ''
        const lastTransform = items[items.length - 1].getAttribute('transform') || ''
        const firstX = parseFloat(firstTransform.match(/translate\(([^,]+)/)![1])
        const lastX = parseFloat(lastTransform.match(/translate\(([^,]+)/)![1])
        expect(firstX).toBe(expectedStart)
        // 最后一个元素右边缘 = lastX + RECT_WIDTH(60)，应等于 expectedEnd
        expect(lastX + 60).toBe(expectedEnd)
        // 数组中心应位于 width/2 = 400
        expect((firstX + lastX + 60) / 2).toBe(400)
      }
    })

    it('应该根据 SVG viewBox 坐标系居中（而非 options 尺寸）', () => {
      svg.setAttribute('viewBox', '0 0 400 200')
      renderArray(svg, [1, 2, 3], { width: 800, height: 400 })
      const items = svg.querySelectorAll('.array-item')
      expect(items.length).toBe(3)
      // 使用 viewBox 尺寸 400x200 居中
      // totalW = 200, startX = (400-200)/2 = 100
      // startY = max(20, floor((200-70)/2)) = 65
      expect(items[0].getAttribute('transform')).toBe('translate(100, 65)')
      expect(items[1].getAttribute('transform')).toBe('translate(170, 65)')
      expect(items[2].getAttribute('transform')).toBe('translate(240, 65)')
    })

    it('viewBox 尺寸小于数组宽度时应左对齐（startX=0）', () => {
      svg.setAttribute('viewBox', '0 0 200 100')
      renderArray(svg, [1, 2, 3], { width: 800, height: 400 })
      const items = svg.querySelectorAll('.array-item')
      // totalW = 200, startX = max(0, (200-200)/2) = 0
      // startY = max(20, floor((100-70)/2)) = 20
      expect(items[0].getAttribute('transform')).toBe('translate(0, 20)')
    })

    it('无效 viewBox 应回退到 options 尺寸', () => {
      svg.setAttribute('viewBox', 'invalid')
      renderArray(svg, [1, 2, 3], { width: 800, height: 400 })
      const items = svg.querySelectorAll('.array-item')
      // 回退到 800x400，startX = 300
      expect(items[0].getAttribute('transform')).toBe('translate(300, 165)')
    })
  })

  describe('animateInsert', () => {
    it('应该能够执行插入动画', async () => {
      await expect(animateInsert(svg, 4, 42, [1, 2, 3], { width: 800, height: 400 })).resolves.toBeUndefined()
    })
  })

  describe('animateDelete', () => {
    it('应该能够执行删除动画', async () => {
      await expect(animateDelete(svg, 1, [1, 2, 3, 4], { width: 800, height: 400 })).resolves.toBeUndefined()
    })
  })

  describe('animateSearch', () => {
    it('应该能够执行查找动画（找到）', async () => {
      await expect(animateSearch(svg, 2, [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行查找动画（未找到）', async () => {
      await expect(animateSearch(svg, -1, [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })
  })
})
