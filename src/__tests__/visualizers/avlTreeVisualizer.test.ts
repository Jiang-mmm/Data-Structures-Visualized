import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AvlFlattened } from '../../types/hooks'

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
    if (key === 'avlTree.nodeTitle') return '值: {value}, 高度: {height}, 平衡因子: {balanceFactor}'
    if (key === 'emptyState.emptyAvlShort') return '空 AVL 树'
    return key
  },
}))

const {
  renderAvlTree,
  animateInsertPath,
  animateSearchPath,
  animateTraversal,
} = await import('../../visualizers/avlTreeVisualizer')

function makeData(): AvlFlattened {
  return {
    nodes: [
      { id: 'root', value: 50, parent: '', depth: 0, balanceFactor: 0, height: 2, isLeft: false, isRight: false },
      { id: 'left', value: 30, parent: 'root', depth: 1, balanceFactor: 0, height: 1, isLeft: true, isRight: false },
      { id: 'right', value: 70, parent: 'root', depth: 1, balanceFactor: 0, height: 1, isLeft: false, isRight: true },
    ],
    edges: [
      { from: 'root', to: 'left' },
      { from: 'root', to: 'right' },
    ],
  }
}

describe('avlTreeVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    vi.clearAllMocks()
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 800 400')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderAvlTree', () => {
    it('应渲染空树提示', () => {
      renderAvlTree(svg, { nodes: [], edges: [] }, {})
      expect(svg.textContent).toContain('空 AVL 树')
    })

    it('渲染节点应包含节点值文本', () => {
      renderAvlTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.avl-node')
      expect(nodes.length).toBe(3)
      const values = Array.from(nodes).map(g => g.querySelector('text.avl-node-value')?.textContent)
      expect(values).toContain('50')
      expect(values).toContain('30')
      expect(values).toContain('70')
    })

    it('渲染节点应包含 title 提示（含高度与平衡因子）', () => {
      renderAvlTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.avl-node')
      const titles = Array.from(nodes).map(g => g.querySelector('title')?.textContent)
      const rootTitle = titles.find(t => t?.includes('50'))
      expect(rootTitle).toContain('高度: 2')
      expect(rootTitle).toContain('平衡因子: 0')
    })

    it('节点应携带 data-id 与 data-value 属性', () => {
      renderAvlTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.avl-node')
      const root = Array.from(nodes).find(g => g.getAttribute('data-id') === 'root')
      expect(root).toBeTruthy()
      expect(root?.getAttribute('data-value')).toBe('50')
    })

    it('应渲染边元素', () => {
      renderAvlTree(svg, makeData(), {})
      const edges = svg.querySelectorAll('line.avl-edge')
      expect(edges.length).toBe(2)
    })

    it('应渲染圆形节点', () => {
      renderAvlTree(svg, makeData(), {})
      const circles = svg.querySelectorAll('g.avl-node circle')
      expect(circles.length).toBe(3)
      expect(circles[0].getAttribute('r')).toBe('22')
    })
  })

  describe('动画函数', () => {
    const data = makeData()

    it('animateInsertPath 应存在并正常完成', async () => {
      await expect(animateInsertPath(svg, [50, 30], data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('animateSearchPath 应存在并正常完成（找到）', async () => {
      await expect(animateSearchPath(svg, [50, 30], 30, data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('animateSearchPath 应存在并正常完成（未找到）', async () => {
      await expect(animateSearchPath(svg, [50, 70], null, data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('animateTraversal 应存在并正常完成', async () => {
      await expect(animateTraversal(svg, [50, 30, 70], data, { isAborted: () => false } as any)).resolves.toBeUndefined()
    })

    it('动画函数在大数据量时应跳过', async () => {
      const largeData: AvlFlattened = {
        nodes: Array.from({ length: 35 }, (_, i) => ({
          id: `n${i}`,
          value: i,
          parent: i === 0 ? '' : `n${Math.floor((i - 1) / 2)}`,
          depth: Math.floor(Math.log2(i + 1)),
          balanceFactor: 0,
          height: 1,
          isLeft: i % 2 === 1,
          isRight: i % 2 === 0 && i !== 0,
        })),
        edges: [],
      }
      await expect(animateInsertPath(svg, [0], largeData, { isAborted: () => false } as any)).resolves.toBeUndefined()
      expect(transitionEndMock).not.toHaveBeenCalled()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true }
      await expect(animateTraversal(svg, [50, 30, 70], data, abortedAnim as any)).resolves.toBeUndefined()
      expect(transitionEndMock).not.toHaveBeenCalled()
    })

    it('动画函数应调用 duration 与 transitionEnd', async () => {
      transitionEndMock.mockClear()
      durationMock.mockClear()
      // Phase 1 优化后动画函数不再内部重渲染，需先渲染 DOM 以便动画函数找到节点
      renderAvlTree(svg, data, {})
      await animateTraversal(svg, [50, 30, 70], data, { isAborted: () => false } as any)
      expect(durationMock).toHaveBeenCalled()
      expect(transitionEndMock).toHaveBeenCalled()
    })
  })
})
