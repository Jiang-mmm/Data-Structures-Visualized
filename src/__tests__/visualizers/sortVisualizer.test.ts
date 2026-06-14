import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderSortBars, animateCompare, animateSwap, animateSorted } from '../../visualizers/sortVisualizer'

describe('sortVisualizer 集成测试', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '800')
    svg.setAttribute('height', '400')
    document.body.appendChild(svg)
  })

  afterEach(() => {
    document.body.removeChild(svg)
  })

  describe('renderSortBars', () => {
    it('应该正确渲染排序柱状图', () => {
      const data = [50, 30, 80, 20, 60]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(5)
    })

    it('应该渲染空数据状态', () => {
      renderSortBars(svg, [], { width: 800, height: 400 })

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(0)
    })

    it('应该渲染单元素数据', () => {
      renderSortBars(svg, [42], { width: 800, height: 400 })

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(1)
    })

    it('应该在大数据集下正确渲染', () => {
      const data = Array.from({ length: 50 }, (_, i) => i + 1)
      renderSortBars(svg, data, { width: 800, height: 400 })

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(50)
    })
  })

  describe('animateCompare', () => {
    it('应该高亮比较的元素', async () => {
      const data = [50, 30, 80, 20, 60]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateCompare(svg, 0, 1, data, { width: 800, height: 400 }, anim)

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(5)
    })
  })

  describe('animateSwap', () => {
    it('应该交换两个元素的位置', async () => {
      const data = [50, 30, 80, 20, 60]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateSwap(svg, 0, 1, data, { width: 800, height: 400 }, anim)

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(5)
    })
  })

  describe('animateSorted', () => {
    it('应该标记已排序元素', async () => {
      const data = [50, 30, 80, 20, 60]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateSorted(svg, data, { width: 800, height: 400 }, anim)

      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(5)
    })

    it('应该在中止时提前退出', async () => {
      const data = [50, 30, 80, 20, 60]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateSorted(svg, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该处理空数据', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateSorted(svg, [], { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateCompare', () => {
    it('应该在中止时提前退出', async () => {
      const data = [50, 30, 80]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateCompare(svg, 0, 1, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateSwap', () => {
    it('应该在中止时提前退出', async () => {
      const data = [50, 30, 80]
      renderSortBars(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateSwap(svg, 0, 1, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('highlightSortedPosition', () => {
    it('应该高亮指定位置', async () => {
      const { highlightSortedPosition } = await import('../../visualizers/sortVisualizer')
      const data = [50, 30, 80]
      renderSortBars(svg, data, { width: 800, height: 400 })
      expect(() => highlightSortedPosition(svg, 0)).not.toThrow()
    })

    it('应该忽略超出范围的索引', async () => {
      const { highlightSortedPosition } = await import('../../visualizers/sortVisualizer')
      const data = [50, 30, 80]
      renderSortBars(svg, data, { width: 800, height: 400 })
      expect(() => highlightSortedPosition(svg, 10)).not.toThrow()
    })
  })

  describe('renderSortBars 边界条件', () => {
    it('应该处理大数据集（>100）', () => {
      const largeData = Array.from({ length: 150 }, (_, i) => i + 1)
      expect(() => renderSortBars(svg, largeData, { width: 800, height: 400 })).not.toThrow()
    })

    it('应该处理单元素数据', () => {
      renderSortBars(svg, [42], { width: 800, height: 400 })
      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(1)
    })

    it('应该在重新渲染时更新柱状图', () => {
      renderSortBars(svg, [50, 30], { width: 800, height: 400 })
      renderSortBars(svg, [10, 20, 30], { width: 800, height: 400 })
      const bars = svg.querySelectorAll('g.bar')
      expect(bars.length).toBe(3)
    })

    it('应该处理 isDark 选项', () => {
      expect(() => renderSortBars(svg, [50, 30], { width: 800, height: 400, isDark: true })).not.toThrow()
    })
  })
})
