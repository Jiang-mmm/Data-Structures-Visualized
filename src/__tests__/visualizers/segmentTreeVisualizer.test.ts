import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SegmentTreeFlattened } from '../../algorithms/segmentTree'

const durationMock = vi.fn((ms: number) => ms)
const transitionEndMock = vi.fn((_t?: unknown) => Promise.resolve())
const measureRenderMock = vi.fn((_label: string, fn: () => unknown) => fn())
const waitMock = vi.fn((_ms: number, _anim?: unknown) => Promise.resolve())

vi.mock('../../utils/animationEngine', () => ({
  duration: (ms: number) => durationMock(ms),
  EASING: {
    easeOutCubic: (t: number) => t,
    easeInCubic: (t: number) => t,
    easeOutBack: (t: number) => t,
    easeOutElastic: (t: number) => t,
  },
  transitionEnd: (t: unknown) => transitionEndMock(t),
  wait: (_ms: number, _anim?: unknown) => waitMock(_ms, _anim),
  measureRender: (_label: string, fn: () => unknown) => measureRenderMock(_label, fn),
}))

vi.mock('../../i18n/useI18n', () => ({
  tStatic: (key: string) => {
    if (key === 'segmentTree.nodeTitle') return 'Range: {range}\nSum: {sum}\nType: {type}'
    if (key === 'segmentTree.leaf') return 'Leaf node'
    if (key === 'segmentTree.internal') return 'Internal node'
    if (key === 'segmentTree.arrayLabel') return 'Array'
    if (key === 'emptyState.emptySegmentTreeShort') return '空线段树'
    return key
  },
}))

const {
  renderSegmentTree,
  animateSegmentTreePath,
} = await import('../../visualizers/segmentTreeVisualizer')

/** 构造 4 元素线段树扁平化数据：[1, 2, 3, 4] */
function makeData(): SegmentTreeFlattened {
  return {
    nodes: [
      // 根节点 [0,3] sum=10
      { id: '0', start: 0, end: 3, sum: 10, childrenIds: ['1', '2'], parent: '', level: 0, isLeaf: false, x: 0, y: 0, highlighted: false },
      // 左子 [0,1] sum=3
      { id: '1', start: 0, end: 1, sum: 3, childrenIds: ['3', '4'], parent: '0', level: 1, isLeaf: false, x: 0, y: 0, highlighted: false },
      // 右子 [2,3] sum=7
      { id: '2', start: 2, end: 3, sum: 7, childrenIds: ['5', '6'], parent: '0', level: 1, isLeaf: false, x: 0, y: 0, highlighted: false },
      // 叶子 [0,0] sum=1
      { id: '3', start: 0, end: 0, sum: 1, childrenIds: [], parent: '1', level: 2, isLeaf: true, x: 0, y: 0, highlighted: false },
      // 叶子 [1,1] sum=2
      { id: '4', start: 1, end: 1, sum: 2, childrenIds: [], parent: '1', level: 2, isLeaf: true, x: 0, y: 0, highlighted: false },
      // 叶子 [2,2] sum=3
      { id: '5', start: 2, end: 2, sum: 3, childrenIds: [], parent: '2', level: 2, isLeaf: true, x: 0, y: 0, highlighted: false },
      // 叶子 [3,3] sum=4
      { id: '6', start: 3, end: 3, sum: 4, childrenIds: [], parent: '2', level: 2, isLeaf: true, x: 0, y: 0, highlighted: false },
    ],
    edges: [
      { from: '0', to: '1' },
      { from: '0', to: '2' },
      { from: '1', to: '3' },
      { from: '1', to: '4' },
      { from: '2', to: '5' },
      { from: '2', to: '6' },
    ],
    originalArray: [1, 2, 3, 4],
  }
}

function makeEmptyData(): SegmentTreeFlattened {
  return { nodes: [], edges: [], originalArray: [] }
}

describe('segmentTreeVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    vi.clearAllMocks()
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 800 400')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderSegmentTree', () => {
    it('应渲染空树提示', () => {
      renderSegmentTree(svg, makeEmptyData(), {})
      expect(svg.textContent).toContain('空线段树')
    })

    it('应渲染所有节点（7 个）', () => {
      renderSegmentTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.segtree-node')
      expect(nodes.length).toBe(7)
    })

    it('渲染节点应包含区间文本', () => {
      renderSegmentTree(svg, makeData(), {})
      const rangeTexts = svg.querySelectorAll('text.segtree-range-text')
      const values = Array.from(rangeTexts).map((t) => t.textContent)
      expect(values).toContain('[0,3]')
      expect(values).toContain('[0,1]')
      expect(values).toContain('[2,3]')
      expect(values).toContain('[0,0]')
    })

    it('渲染节点应包含 sum 文本', () => {
      renderSegmentTree(svg, makeData(), {})
      const sumTexts = svg.querySelectorAll('text.segtree-sum-text')
      const values = Array.from(sumTexts).map((t) => t.textContent)
      expect(values).toContain('10')
      expect(values).toContain('3')
      expect(values).toContain('7')
      expect(values).toContain('1')
      expect(values).toContain('4')
    })

    it('节点应携带 data-id 与 data-range 属性', () => {
      renderSegmentTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.segtree-node')
      const root = Array.from(nodes).find((g) => g.getAttribute('data-id') === '0')
      expect(root).toBeTruthy()
      expect(root?.getAttribute('data-range')).toBe('[0,3]')
      expect(root?.getAttribute('data-sum')).toBe('10')
    })

    it('应渲染边元素（6 条）', () => {
      renderSegmentTree(svg, makeData(), {})
      const edges = svg.querySelectorAll('path.segtree-edge')
      expect(edges.length).toBe(6)
    })

    it('应渲染节点背景矩形', () => {
      renderSegmentTree(svg, makeData(), {})
      const rects = svg.querySelectorAll('rect.segtree-node-bg')
      expect(rects.length).toBe(7)
    })

    it('节点应包含 title 提示', () => {
      renderSegmentTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.segtree-node')
      const titles = Array.from(nodes).map((g) => g.querySelector('title')?.textContent)
      const rootTitle = titles.find((t) => t?.includes('[0, 3]'))
      expect(rootTitle).toContain('Sum: 10')
    })

    it('叶子节点 title 应包含 Leaf node', () => {
      renderSegmentTree(svg, makeData(), {})
      const leafNodes = svg.querySelectorAll('g.segtree-node')
      const leafWithTitle = Array.from(leafNodes).find((g) => {
        const title = g.querySelector('title')?.textContent || ''
        return title.includes('[0, 0]') && title.includes('Leaf node')
      })
      expect(leafWithTitle).toBeTruthy()
    })

    it('内部节点 title 应包含 Internal node', () => {
      renderSegmentTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.segtree-node')
      const internalNode = Array.from(nodes).find((g) => {
        const title = g.querySelector('title')?.textContent || ''
        return title.includes('[0, 3]') && title.includes('Internal node')
      })
      expect(internalNode).toBeTruthy()
    })

    it('应渲染原始数组元素', () => {
      renderSegmentTree(svg, makeData(), {})
      const arrayValues = svg.querySelectorAll('text.segtree-array-value')
      const values = Array.from(arrayValues).map((t) => t.textContent)
      expect(values).toContain('1')
      expect(values).toContain('2')
      expect(values).toContain('3')
      expect(values).toContain('4')
    })

    it('应渲染数组下标', () => {
      renderSegmentTree(svg, makeData(), {})
      const arrayIndices = svg.querySelectorAll('text.segtree-array-index')
      const values = Array.from(arrayIndices).map((t) => t.textContent)
      expect(values).toContain('0')
      expect(values).toContain('1')
      expect(values).toContain('2')
      expect(values).toContain('3')
    })

    it('应渲染数组单元格矩形', () => {
      renderSegmentTree(svg, makeData(), {})
      const cells = svg.querySelectorAll('rect.segtree-array-cell')
      expect(cells.length).toBe(4)
    })

    it('应清空之前的内容后重新渲染', () => {
      // 第一次渲染
      renderSegmentTree(svg, makeData(), {})
      expect(svg.querySelectorAll('g.segtree-node').length).toBe(7)
      // 第二次渲染空树
      renderSegmentTree(svg, makeEmptyData(), {})
      expect(svg.querySelectorAll('g.segtree-node').length).toBe(0)
    })

    it('节点应具有 role 和 aria-label 属性', () => {
      renderSegmentTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.segtree-node')
      const root = Array.from(nodes).find((g) => g.getAttribute('data-id') === '0')
      expect(root?.getAttribute('role')).toBe('group')
      expect(root?.getAttribute('aria-label')).toContain('Segment Tree node')
      expect(root?.getAttribute('aria-label')).toContain('[0, 3]')
    })
  })

  describe('animateSegmentTreePath', () => {
    const data = makeData()

    it('应正常完成查询路径动画', async () => {
      renderSegmentTree(svg, data, {})
      const path = [
        { start: 0, end: 3, sum: 10 },
        { start: 0, end: 1, sum: 3 },
        { start: 0, end: 0, sum: 1 },
      ]
      await expect(animateSegmentTreePath(svg, path, data, { isAborted: () => false } as never)).resolves.toBeUndefined()
    })

    it('空路径应立即返回', async () => {
      await expect(animateSegmentTreePath(svg, [], data, { isAborted: () => false } as never)).resolves.toBeUndefined()
      expect(transitionEndMock).not.toHaveBeenCalled()
    })

    it('abort 后应立即结束', async () => {
      renderSegmentTree(svg, data, {})
      const abortedAnim = { isAborted: () => true }
      const path = [{ start: 0, end: 3, sum: 10 }]
      await expect(animateSegmentTreePath(svg, path, data, abortedAnim as never)).resolves.toBeUndefined()
    })

    it('应调用 duration 与 transitionEnd', async () => {
      transitionEndMock.mockClear()
      durationMock.mockClear()
      renderSegmentTree(svg, data, {})
      const path = [
        { start: 0, end: 3, sum: 10 },
        { start: 0, end: 1, sum: 3 },
      ]
      await animateSegmentTreePath(svg, path, data, { isAborted: () => false } as never)
      expect(durationMock).toHaveBeenCalled()
      expect(transitionEndMock).toHaveBeenCalled()
    })

    it('更新操作路径动画应正常完成', async () => {
      renderSegmentTree(svg, data, {})
      const path = [
        { start: 0, end: 3, sum: 10 },
        { start: 2, end: 3, sum: 7 },
        { start: 2, end: 2, sum: 3 },
      ]
      await expect(animateSegmentTreePath(svg, path, data, { isAborted: () => false } as never, true)).resolves.toBeUndefined()
    })
  })
})
