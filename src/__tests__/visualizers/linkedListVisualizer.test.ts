import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderLinkedList, animateReverse, animateInsertHead, animateSearchNode } from '../../visualizers/linkedListVisualizer'
import { tStatic } from '../../i18n/useI18n'

describe('linkedListVisualizer 集成测试', () => {
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

  describe('renderLinkedList', () => {
    it('应该正确渲染正常链表数据', () => {
      const data = [10, 20, 30, 40, 50]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(5)

      const circles = svg.querySelectorAll('circle')
      expect(circles.length).toBeGreaterThanOrEqual(5)

      const texts = svg.querySelectorAll('text')
      const valueTexts = Array.from(texts).filter(t =>
        ['10', '20', '30', '40', '50'].includes(t.textContent || '')
      )
      expect(valueTexts.length).toBe(5)
    })

    it('应该渲染空链表提示', () => {
      renderLinkedList(svg, [], { width: 800, height: 400 })

      const texts = svg.querySelectorAll('text')
      const hasHead = Array.from(texts).some(t => t.textContent === tStatic('linkedlist.headLabel'))
      const hasNull = Array.from(texts).some(t => t.textContent === 'NULL')
      expect(hasHead).toBe(true)
      expect(hasNull).toBe(true)
    })

    it('应该渲染单元素链表', () => {
      renderLinkedList(svg, [42], { width: 800, height: 400 })

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(1)
    })

    it('应该渲染 HEAD 和 NULL 标签', () => {
      const data = [1, 2, 3]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const texts = Array.from(svg.querySelectorAll('text'))
      const hasHead = texts.some(t => t.textContent === tStatic('linkedlist.headLabel'))
      const hasNull = texts.some(t => t.textContent === 'NULL')
      expect(hasHead).toBe(true)
      expect(hasNull).toBe(true)
    })

    it('应该渲染节点间的箭头连线', () => {
      const data = [1, 2, 3]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const lines = svg.querySelectorAll('line')
      expect(lines.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('居中定位', () => {
    function getNodeX(node: Element): number {
      const transform = node.getAttribute('transform') || ''
      const match = transform.match(/translate\(([^,]+)/)
      return match ? parseFloat(match[1]) : 0
    }

    function getNodeY(node: Element): number {
      const transform = node.getAttribute('transform') || ''
      const match = transform.match(/translate\([^,]+,\s*([^)]+)\)/)
      return match ? parseFloat(match[1]) : 0
    }

    it('少量节点应水平居中显示', () => {
      const data = [1, 2, 3]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const nodes = svg.querySelectorAll('g.linked-node')
      const firstX = getNodeX(nodes[0])
      const lastX = getNodeX(nodes[nodes.length - 1])
      const centerX = (firstX + lastX) / 2
      expect(Math.abs(centerX - 400)).toBeLessThan(5)
    })

    it('多节点应水平居中显示(不偏移)', () => {
      const data = Array.from({ length: 15 }, (_, i) => i + 1)
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(15)

      const firstX = getNodeX(nodes[0])
      const lastX = getNodeX(nodes[nodes.length - 1])
      const centerX = (firstX + lastX) / 2
      expect(Math.abs(centerX - 400)).toBeLessThan(20)
    })

    it('窄容器中多节点仍应居中', () => {
      const data = Array.from({ length: 10 }, (_, i) => i + 1)
      renderLinkedList(svg, data, { width: 500, height: 300 })

      const nodes = svg.querySelectorAll('g.linked-node')
      const firstX = getNodeX(nodes[0])
      const lastX = getNodeX(nodes[nodes.length - 1])
      const centerX = (firstX + lastX) / 2
      expect(Math.abs(centerX - 250)).toBeLessThan(20)
    })

    it('节点不应定位在左上角', () => {
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const nodes = svg.querySelectorAll('g.linked-node')
      const x = getNodeX(nodes[0])
      const y = getNodeY(nodes[0])

      expect(x).toBeGreaterThan(0)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeCloseTo(200, 0)
    })

    it('HEAD 标签不应超出 SVG 左边界', () => {
      const data = Array.from({ length: 15 }, (_, i) => i + 1)
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const rects = svg.querySelectorAll('rect')
      let headRectX = Infinity
      rects.forEach(rect => {
        const w = parseFloat(rect.getAttribute('width') || '0')
        if (w === 44) {
          const x = parseFloat(rect.getAttribute('x') || '0')
          headRectX = Math.min(headRectX, x)
        }
      })
      expect(headRectX).toBeGreaterThanOrEqual(0)
    })
  })

  describe('animateReverse', () => {
    it('应该正确反转多元素链表渲染', async () => {
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateReverse(svg, data, { width: 800, height: 400 }, anim)

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(3)
    })

    it('应该处理单元素链表反转', async () => {
      const data = [42]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateReverse(svg, data, { width: 800, height: 400 }, anim)

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(1)
    })

    it('应该处理空链表反转', async () => {
      const data: number[] = []
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }

      await expect(animateReverse(svg, data, { width: 800, height: 400 }, anim)).resolves.not.toThrow()
    })

    it('应该在动画中断时提前退出', async () => {
      const data = [10, 20, 30, 40, 50]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await animateReverse(svg, data, { width: 800, height: 400 }, anim)
    })
  })

  describe('animateInsertHead', () => {
    it('应该在头部插入节点并渲染', async () => {
      const data = [20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateInsertHead(svg, 10, data, { width: 800, height: 400 }, anim)

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('animateSearchNode', () => {
    it('应该高亮目标节点', async () => {
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateSearchNode(svg, 1, data, { width: 800, height: 400 }, anim)

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(3)
    })

    it('应该在中止时提前退出', async () => {
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateSearchNode(svg, 1, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该跳过大型数据集', async () => {
      const largeData = Array.from({ length: 40 }, (_, i) => i)
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateSearchNode(svg, 0, largeData, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateInsertHead', () => {
    it('应该在头部插入节点', async () => {
      const data = [20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await animateInsertHead(svg, 10, data, { width: 800, height: 400 }, anim)

      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBeGreaterThanOrEqual(2)
    })

    it('应该在中止时提前退出', async () => {
      const data = [20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateInsertHead(svg, 10, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该跳过大型数据集', async () => {
      const largeData = Array.from({ length: 40 }, (_, i) => i)
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateInsertHead(svg, 0, largeData, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateInsertTail', () => {
    it('应该在尾部插入节点', async () => {
      const { animateInsertTail } = await import('../../visualizers/linkedListVisualizer')
      const data = [10, 20]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateInsertTail(svg, 30, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const { animateInsertTail } = await import('../../visualizers/linkedListVisualizer')
      const data = [10, 20]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateInsertTail(svg, 30, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteNode', () => {
    it('应该删除指定节点', async () => {
      const { animateDeleteNode } = await import('../../visualizers/linkedListVisualizer')
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateDeleteNode(svg, 1, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const { animateDeleteNode } = await import('../../visualizers/linkedListVisualizer')
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateDeleteNode(svg, 1, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该跳过大型数据集', async () => {
      const { animateDeleteNode } = await import('../../visualizers/linkedListVisualizer')
      const largeData = Array.from({ length: 40 }, (_, i) => i)
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateDeleteNode(svg, 0, largeData, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateInsertAt', () => {
    it('应该在指定位置插入节点', async () => {
      const { animateInsertAt } = await import('../../visualizers/linkedListVisualizer')
      const data = [10, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateInsertAt(svg, 1, 20, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const { animateInsertAt } = await import('../../visualizers/linkedListVisualizer')
      const data = [10, 30]
      renderLinkedList(svg, data, { width: 800, height: 400 })

      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateInsertAt(svg, 1, 20, data, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })

    it('应该跳过大型数据集', async () => {
      const { animateInsertAt } = await import('../../visualizers/linkedListVisualizer')
      const largeData = Array.from({ length: 40 }, (_, i) => i)
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateInsertAt(svg, 0, 99, largeData, { width: 800, height: 400 }, anim)).resolves.toBeUndefined()
    })
  })

  describe('animateCycleDetection', () => {
    it('应该执行环检测动画', async () => {
      const { animateCycleDetection } = await import('../../visualizers/linkedListVisualizer')
      const steps = [{ slow: 0, fast: 1 }, { slow: 1, fast: 3 }, { slow: 2, fast: 2 }]
      await expect(animateCycleDetection(svg, steps)).resolves.toBeUndefined()
    })

    it('应该在中止时提前退出', async () => {
      const { animateCycleDetection } = await import('../../visualizers/linkedListVisualizer')
      const steps = [{ slow: 0, fast: 1 }, { slow: 1, fast: 3 }]
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      await expect(animateCycleDetection(svg, steps, anim)).resolves.toBeUndefined()
    })

    it('应该处理空步骤', async () => {
      const { animateCycleDetection } = await import('../../visualizers/linkedListVisualizer')
      await expect(animateCycleDetection(svg, [])).resolves.toBeUndefined()
    })
  })

  describe('isDark 选项', () => {
    it('renderLinkedList 应支持暗色模式', () => {
      renderLinkedList(svg, [10, 20], { width: 800, height: 400, isDark: true })
      const nodes = svg.querySelectorAll('g.linked-node')
      expect(nodes.length).toBe(2)
    })

    it('animateReverse 应支持暗色模式', async () => {
      const data = [10, 20, 30]
      renderLinkedList(svg, data, { width: 800, height: 400, isDark: true })
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => false, resolve: () => {}, reject: () => {} }
      await expect(animateReverse(svg, data, { width: 800, height: 400, isDark: true }, anim)).resolves.toBeUndefined()
    })
  })
})
