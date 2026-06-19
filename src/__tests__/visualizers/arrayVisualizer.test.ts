import { describe, it, expect, vi, beforeEach } from 'vitest'

interface ChainableContext {
  svg?: SVGSVGElement
  selector?: string
}

interface ChainableCall {
  method: string
  args: unknown[]
}

const mockInstances: Array<{ calls: ChainableCall[]; context: ChainableContext }> = []

// Create chainable mock that records attr/style calls and can resolve real DOM nodes
function chainable(context: ChainableContext = {}) {
  const calls: ChainableCall[] = []
  const instance = { calls, context }
  mockInstances.push(instance)
  const m: Record<string, unknown> = {}
  const c = new Proxy(m, {
    get(_t, p) {
      if (p === 'empty') return () => {
        if (context.svg && context.selector) {
          return context.svg.querySelectorAll(context.selector).length === 0
        }
        return true
      }
      if (p === 'nodes') return (): unknown[] => {
        if (context.svg && context.selector) {
          return Array.from(context.svg.querySelectorAll(context.selector))
        }
        return []
      }
      if (p === 'node') return (): unknown => {
        if (context.svg && context.selector) {
          return context.svg.querySelector(context.selector)
        }
        return null
      }
      if (p === 'size') return () => 0
      if (p === 'text') return () => c
      if (p === 'attr') return (...args: unknown[]) => { calls.push({ method: 'attr', args }); return c }
      if (p === 'style') return (...args: unknown[]) => { calls.push({ method: 'style', args }); return c }
      if (p === 'on') return (_event: string, cb?: Function) => { if (cb) cb(); return c }
      if (p === 'interrupt') return () => c
      if (p === 'selectAll') return (selector: string) => chainable({ svg: context.svg, selector })
      if (p === 'filter') return () => chainable({ svg: context.svg, selector: context.selector })
      if (p === Symbol.iterator) return undefined
      if (!(p in m)) m[p as string] = vi.fn(() => chainable())
      return m[p as string]
    },
  })
  return c
}

vi.mock('../../utils/d3Imports', () => ({
  select: vi.fn((target: Element) => {
    const svg = target instanceof SVGSVGElement ? target : (target as SVGElement).ownerSVGElement || undefined
    return chainable({ svg })
  }),
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
  wait: vi.fn(() => Promise.resolve()),
  getDefaultEasing: () => 'easeOutCubic',
  measureRender: vi.fn((_label: string, fn: () => unknown) => fn()),
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderArray, animateInsert, animateDelete, animateSearch, animateSearchAll, animateBinarySearch } = await import('../../visualizers/arrayVisualizer')

function getAllAttrCalls() {
  return mockInstances.flatMap(i => i.calls.filter(c => c.method === 'attr'))
}

describe('arrayVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    mockInstances.length = 0
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

    it('数组索引标签应使用 CSS 变量字体', () => {
      renderArray(svg, [1, 2, 3], { width: 800, height: 400 })
      const items = svg.querySelectorAll('.array-item')
      expect(items.length).toBeGreaterThan(0)
      items.forEach(item => {
        const texts = Array.from(item.querySelectorAll('text'))
        const indexText = texts.find(t => t.textContent?.startsWith('['))
        expect(indexText?.getAttribute('font-family')).toContain('var(--font-mono)')
      })
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

    it('应该根据自定义 width/height 居中（宽度 600）', () => {
      renderArray(svg, [1, 2, 3], { width: 600, height: 300 })
      const items = svg.querySelectorAll('.array-item')
      expect(items.length).toBe(3)
      // totalW = 3*70-10 = 200, startX = (600-200)/2 = 200
      // startY = max(20, floor((300-70)/2)) = 115
      expect(items[0].getAttribute('transform')).toBe('translate(200, 115)')
      expect(items[1].getAttribute('transform')).toBe('translate(270, 115)')
      expect(items[2].getAttribute('transform')).toBe('translate(340, 115)')
    })

    it('应该根据自定义 width/height 居中（宽度 1000）', () => {
      renderArray(svg, [1, 2], { width: 1000, height: 500 })
      const items = svg.querySelectorAll('.array-item')
      expect(items.length).toBe(2)
      // totalW = 2*70-10 = 130, startX = (1000-130)/2 = 435
      // startY = max(20, floor((500-70)/2)) = 215
      expect(items[0].getAttribute('transform')).toBe('translate(435, 215)')
      expect(items[1].getAttribute('transform')).toBe('translate(505, 215)')
    })

    it('自定义尺寸下内容超出容器时应左对齐（startX=0）', () => {
      renderArray(svg, [1, 2, 3], { width: 200, height: 100 })
      const items = svg.querySelectorAll('.array-item')
      // totalW = 200, startX = max(0, (200-200)/2) = 0
      // startY = max(20, floor((100-70)/2)) = 20
      expect(items[0].getAttribute('transform')).toBe('translate(0, 20)')
    })
  })

  describe('animateInsert', () => {
    it('应该能够执行插入动画', async () => {
      await expect(animateInsert(svg, 4, 42, [1, 2, 3], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应在大于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 51 }, (_, i) => i + 1)
      await expect(animateInsert(svg, 0, 99, largeData, { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应使用 transform 进行位移动画，避免 width/height/x/y 过渡', async () => {
      renderArray(svg, [1, 2, 3], { width: 800, height: 400 })
      mockInstances.length = 0
      await animateInsert(svg, 1, 99, [1, 2, 3], { width: 800, height: 400 })
      const attrCalls = getAllAttrCalls()
      const geometryAttrs = attrCalls.filter(c => ['width', 'height', 'x', 'y'].includes(c.args[0] as string))
      expect(geometryAttrs).toEqual([])
      const transformCalls = attrCalls.filter(c => c.args[0] === 'transform')
      expect(transformCalls.length).toBeGreaterThan(0)
    })
  })

  describe('animateDelete', () => {
    it('应该能够执行删除动画', async () => {
      await expect(animateDelete(svg, 1, [1, 2, 3, 4], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应在大于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 51 }, (_, i) => i + 1)
      await expect(animateDelete(svg, 0, largeData, { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应使用 transform / opacity 进行缩放淡出，避免 width/height/x/y 过渡', async () => {
      renderArray(svg, [1, 2, 3, 4], { width: 800, height: 400 })
      mockInstances.length = 0
      await animateDelete(svg, 1, [1, 2, 3, 4], { width: 800, height: 400 })
      const attrCalls = getAllAttrCalls()
      const geometryAttrs = attrCalls.filter(c => ['width', 'height', 'x', 'y'].includes(c.args[0] as string))
      expect(geometryAttrs).toEqual([])
      const transformCalls = attrCalls.filter(c => c.args[0] === 'transform')
      expect(transformCalls.length).toBeGreaterThan(0)
      const opacityCalls = attrCalls.filter(c => c.args[0] === 'opacity')
      expect(opacityCalls.length).toBeGreaterThan(0)
    })
  })

  describe('animateSearch', () => {
    it('应该能够执行查找动画（找到）', async () => {
      await expect(animateSearch(svg, 2, [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行查找动画（未找到）', async () => {
      await expect(animateSearch(svg, -1, [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应在大于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 51 }, (_, i) => i + 1)
      await expect(animateSearch(svg, 0, largeData, { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应使用 transform 进行缩放高亮，避免 width/height/x/y 过渡', async () => {
      renderArray(svg, [1, 2, 3, 4, 5], { width: 800, height: 400 })
      mockInstances.length = 0
      await animateSearch(svg, 2, [1, 2, 3, 4, 5], { width: 800, height: 400 })
      const attrCalls = getAllAttrCalls()
      const geometryAttrs = attrCalls.filter(c => ['width', 'height', 'x', 'y'].includes(c.args[0] as string))
      expect(geometryAttrs).toEqual([])
      const transformCalls = attrCalls.filter(c => c.args[0] === 'transform')
      expect(transformCalls.length).toBeGreaterThan(0)
    })
  })

  describe('animateSearchAll', () => {
    it('应该能够执行查找全部动画（有匹配）', async () => {
      await expect(animateSearchAll(svg, [0, 2], [5, 3, 5, 8, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行查找全部动画（无匹配）', async () => {
      await expect(animateSearchAll(svg, [], [1, 2, 3, 4, 5], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行查找全部动画（全部匹配）', async () => {
      await expect(animateSearchAll(svg, [0, 1, 2], [7, 7, 7], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应在大于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 51 }, (_, i) => i + 1)
      await expect(animateSearchAll(svg, [0], largeData, { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应使用 transform 进行缩放高亮，避免 width/height/x/y 过渡', async () => {
      renderArray(svg, [5, 3, 5, 8, 5], { width: 800, height: 400 })
      mockInstances.length = 0
      await animateSearchAll(svg, [0, 2, 4], [5, 3, 5, 8, 5], { width: 800, height: 400 })
      const attrCalls = getAllAttrCalls()
      const geometryAttrs = attrCalls.filter(c => ['width', 'height', 'x', 'y'].includes(c.args[0] as string))
      expect(geometryAttrs).toEqual([])
      const transformCalls = attrCalls.filter(c => c.args[0] === 'transform')
      expect(transformCalls.length).toBeGreaterThan(0)
    })
  })

  describe('animateBinarySearch', () => {
    it('应该能够执行二分查找动画（找到）', async () => {
      renderArray(svg, [1, 3, 5, 7, 9], { width: 800, height: 400 })
      await expect(animateBinarySearch(svg, 7, [1, 3, 5, 7, 9], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行二分查找动画（未找到）', async () => {
      renderArray(svg, [1, 3, 5, 7, 9], { width: 800, height: 400 })
      await expect(animateBinarySearch(svg, 6, [1, 3, 5, 7, 9], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应该能够执行单元素二分查找动画', async () => {
      renderArray(svg, [42], { width: 800, height: 400 })
      await expect(animateBinarySearch(svg, 42, [42], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应在大于阈值时跳过动画', async () => {
      const largeData = Array.from({ length: 51 }, (_, i) => i + 1)
      renderArray(svg, largeData, { width: 800, height: 400 })
      await expect(animateBinarySearch(svg, 25, largeData, { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('空数组应该直接返回', async () => {
      await expect(animateBinarySearch(svg, 1, [], { width: 800, height: 400 })).resolves.toBeUndefined()
    })

    it('应使用 transform 进行缩放高亮，避免 width/height/x/y 过渡', async () => {
      renderArray(svg, [1, 3, 5, 7, 9], { width: 800, height: 400 })
      mockInstances.length = 0
      await animateBinarySearch(svg, 5, [1, 3, 5, 7, 9], { width: 800, height: 400 })
      const attrCalls = getAllAttrCalls()
      const geometryAttrs = attrCalls.filter(c => ['width', 'height', 'x', 'y'].includes(c.args[0] as string))
      expect(geometryAttrs).toEqual([])
      const transformCalls = attrCalls.filter(c => c.args[0] === 'transform')
      expect(transformCalls.length).toBeGreaterThan(0)
    })
  })
})
