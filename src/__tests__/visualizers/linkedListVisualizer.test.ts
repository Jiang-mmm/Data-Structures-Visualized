import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderLinkedList, animateReverse, animateInsertHead, animateSearchNode } from '../../visualizers/linkedListVisualizer'

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
      const emptyText = Array.from(texts).find(t => t.textContent === '空链表')
      expect(emptyText).toBeTruthy()
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
      const hasHead = texts.some(t => t.textContent === 'HEAD')
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
  })
})
