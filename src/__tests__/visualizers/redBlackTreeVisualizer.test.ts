import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { RedBlackFlattened } from '../../algorithms/redBlackTree'

const durationMock = vi.fn((ms: number) => ms)
const transitionEndMock = vi.fn((_t?: unknown) => Promise.resolve())
const measureRenderMock = vi.fn((_label: string, fn: () => unknown) => fn())

vi.mock('../../utils/animationEngine', () => ({
  duration: (ms: number) => durationMock(ms),
  EASING: {
    easeOutCubic: (t: number) => t,
    easeInCubic: (t: number) => t,
    easeOutBack: (t: number) => t,
    easeOutElastic: (t: number) => t,
  },
  transitionEnd: (t: unknown) => transitionEndMock(t),
  measureRender: (_label: string, fn: () => unknown) => measureRenderMock(_label, fn),
}))

vi.mock('../../i18n/useI18n', () => ({
  tStatic: (key: string) => {
    if (key === 'redBlackTree.nodeTitle') return '值: {value}, 颜色: {color}'
    if (key === 'redBlackTree.colorRed') return '红色'
    if (key === 'redBlackTree.colorBlack') return '黑色'
    if (key === 'emptyState.emptyRedBlackTreeShort') return '空红黑树'
    return key
  },
}))

const {
  renderRedBlackTree,
  animateInsertRedBlackTree,
  animateSearchRedBlackTree,
  animateTraversalRedBlackTree,
} = await import('../../visualizers/redBlackTreeVisualizer')

function makeData(): RedBlackFlattened {
  return {
    nodes: [
      { id: 'root', value: 50, color: 'black', parent: '', depth: 0, isLeft: false, isRight: false },
      { id: 'left', value: 30, color: 'red', parent: 'root', depth: 1, isLeft: true, isRight: false },
      { id: 'right', value: 70, color: 'red', parent: 'root', depth: 1, isLeft: false, isRight: true },
    ],
    edges: [
      { from: 'root', to: 'left' },
      { from: 'root', to: 'right' },
    ],
  }
}

function makeEmptyData(): RedBlackFlattened {
  return { nodes: [], edges: [] }
}

describe('redBlackTreeVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    vi.clearAllMocks()
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 800 400')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderRedBlackTree', () => {
    it('应渲染空树提示', () => {
      renderRedBlackTree(svg, makeEmptyData(), {})
      expect(svg.textContent).toContain('空红黑树')
    })

    it('应渲染所有节点', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      expect(nodes.length).toBe(3)
    })

    it('渲染节点应包含节点值文本', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const values = Array.from(nodes).map(g => g.querySelector('text.rb-node-value')?.textContent)
      expect(values).toContain('50')
      expect(values).toContain('30')
      expect(values).toContain('70')
    })

    it('节点应携带 data-id 属性', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const root = Array.from(nodes).find(g => g.getAttribute('data-id') === 'root')
      expect(root).toBeTruthy()
    })

    it('节点应携带 data-value 属性', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const root = Array.from(nodes).find(g => g.getAttribute('data-id') === 'root')
      expect(root?.getAttribute('data-value')).toBe('50')
    })

    it('节点应携带 data-color 属性', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const root = Array.from(nodes).find(g => g.getAttribute('data-id') === 'root')
      expect(root?.getAttribute('data-color')).toBe('black')
    })

    it('应渲染边元素', () => {
      renderRedBlackTree(svg, makeData(), {})
      const edges = svg.querySelectorAll('line.rb-edge')
      expect(edges.length).toBe(2)
    })

    it('应渲染圆形节点', () => {
      renderRedBlackTree(svg, makeData(), {})
      const circles = svg.querySelectorAll('g.rb-node circle')
      expect(circles.length).toBe(3)
    })

    it('圆形节点半径应为 22', () => {
      renderRedBlackTree(svg, makeData(), {})
      const circles = svg.querySelectorAll('g.rb-node circle')
      expect(circles[0].getAttribute('r')).toBe('22')
    })

    it('红色节点应使用红色填充', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const leftNode = Array.from(nodes).find(g => g.getAttribute('data-id') === 'left')
      const circle = leftNode?.querySelector('circle')
      expect(circle?.getAttribute('fill')).toBe('#dc2626')
    })

    it('黑色节点应使用黑色填充', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const rootNode = Array.from(nodes).find(g => g.getAttribute('data-id') === 'root')
      const circle = rootNode?.querySelector('circle')
      expect(circle?.getAttribute('fill')).toBe('#1a1a1a')
    })

    it('节点应包含 title 提示（含颜色信息）', () => {
      renderRedBlackTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.rb-node')
      const titles = Array.from(nodes).map(g => g.querySelector('title')?.textContent)
      const rootTitle = titles.find(t => t?.includes('50'))
      expect(rootTitle).toContain('黑色')
    })

    it('应处理 null 数据', () => {
      expect(() => renderRedBlackTree(svg, null as any, {})).not.toThrow()
    })

    it('应处理 undefined 数据', () => {
      expect(() => renderRedBlackTree(svg, undefined as any, {})).not.toThrow()
    })

    it('应处理 isDark 选项', () => {
      expect(() => renderRedBlackTree(svg, makeData(), { isDark: true })).not.toThrow()
    })

    it('应处理空 options', () => {
      expect(() => renderRedBlackTree(svg, makeData())).not.toThrow()
    })

    it('应处理 width/height 选项', () => {
      expect(() => renderRedBlackTree(svg, makeData(), { width: 1000, height: 600 })).not.toThrow()
    })

    it('应创建渐变定义 defs 元素', () => {
      renderRedBlackTree(svg, makeData(), {})
      const defs = svg.querySelector('defs')
      expect(defs).toBeTruthy()
    })

    it('边应包含 from-to 选择类', () => {
      renderRedBlackTree(svg, makeData(), {})
      const edge = svg.querySelector('.rb-edge.from-root-to-left')
      expect(edge).toBeTruthy()
    })

    it('应处理大数据集', () => {
      const bigNodes = Array.from({ length: 30 }, (_, i) => ({
        id: `n${i}`,
        value: i + 1,
        color: (i % 2 === 0 ? 'black' : 'red') as 'red' | 'black',
        parent: i === 0 ? '' : `n${Math.floor((i - 1) / 2)}`,
        depth: Math.floor(Math.log2(i + 1)),
        isLeft: i % 2 === 1,
        isRight: i % 2 === 0 && i !== 0,
      }))
      const bigEdges: Array<{ from: string; to: string }> = []
      for (let i = 1; i < bigNodes.length; i++) {
        bigEdges.push({ from: bigNodes[i].parent, to: bigNodes[i].id })
      }
      const bigData: RedBlackFlattened = { nodes: bigNodes, edges: bigEdges }
      expect(() => renderRedBlackTree(svg, bigData, {})).not.toThrow()
    })

    it('空树也应创建 defs', () => {
      renderRedBlackTree(svg, makeEmptyData(), {})
      expect(svg.querySelector('defs')).toBeTruthy()
    })

    it('节点文本应居中对齐', () => {
      renderRedBlackTree(svg, makeData(), {})
      const text = svg.querySelector('g.rb-node text.rb-node-value')
      expect(text?.getAttribute('text-anchor')).toBe('middle')
    })

    it('应清除之前的渲染内容', () => {
      renderRedBlackTree(svg, makeData(), {})
      expect(svg.querySelectorAll('g.rb-node').length).toBe(3)
      // 再次渲染应清除旧内容
      renderRedBlackTree(svg, makeData(), {})
      expect(svg.querySelectorAll('g.rb-node').length).toBe(3)
    })
  })

  describe('animateInsertRedBlackTree', () => {
    const data = makeData()

    it('应存在并正常完成', async () => {
      await expect(animateInsertRedBlackTree(svg, [50, 30], data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('空路径应立即返回', async () => {
      await expect(animateInsertRedBlackTree(svg, [], data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true }
      await expect(animateInsertRedBlackTree(svg, [50, 30], data, abortedAnim as any)).resolves.toBeUndefined()
    })

    it('应调用 duration 与 transitionEnd', async () => {
      transitionEndMock.mockClear()
      durationMock.mockClear()
      renderRedBlackTree(svg, data, {})
      await animateInsertRedBlackTree(svg, [50, 30], data, { isAborted: () => false } as any)
      expect(durationMock).toHaveBeenCalled()
      expect(transitionEndMock).toHaveBeenCalled()
    })
  })

  describe('animateSearchRedBlackTree', () => {
    const data = makeData()

    it('应存在并正常完成（找到）', async () => {
      await expect(animateSearchRedBlackTree(svg, [50, 30], 30, data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('应存在并正常完成（未找到）', async () => {
      await expect(animateSearchRedBlackTree(svg, [50, 70], null, data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('空路径应立即返回', async () => {
      await expect(animateSearchRedBlackTree(svg, [], null, data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true }
      await expect(animateSearchRedBlackTree(svg, [50, 30], 30, data, abortedAnim as any)).resolves.toBeUndefined()
    })
  })

  describe('animateTraversalRedBlackTree', () => {
    const data = makeData()

    it('应存在并正常完成', async () => {
      await expect(animateTraversalRedBlackTree(svg, [50, 30, 70], data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('空路径应立即返回', async () => {
      await expect(animateTraversalRedBlackTree(svg, [], data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true }
      await expect(animateTraversalRedBlackTree(svg, [50, 30, 70], data, abortedAnim as any)).resolves.toBeUndefined()
    })

    it('应调用 duration 与 transitionEnd', async () => {
      transitionEndMock.mockClear()
      durationMock.mockClear()
      renderRedBlackTree(svg, data, {})
      await animateTraversalRedBlackTree(svg, [50, 30, 70], data, { isAborted: () => false } as any)
      expect(durationMock).toHaveBeenCalled()
      expect(transitionEndMock).toHaveBeenCalled()
    })
  })
})
