import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BTreeFlattened } from '../../algorithms/bTree'

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
    if (key === 'bTree.nodeTitle') return 'keys: {keys}\nkey count: {count}\ntype: {type}'
    if (key === 'bTree.leaf') return 'Leaf node'
    if (key === 'bTree.internal') return 'Internal node'
    if (key === 'emptyState.emptyBTreeShort') return '空 B 树'
    return key
  },
}))

const {
  renderBTree,
  animateBTreePath,
} = await import('../../visualizers/bTreeVisualizer')

function makeData(): BTreeFlattened {
  // 构造一个分裂后的 B 树：根 [20]，左子 [10]，右子 [30]
  return {
    nodes: [
      { id: '0', keys: [20], childrenIds: ['1', '2'], parent: '', depth: 0, leaf: false, x: 0, y: 0, highlighted: false },
      { id: '1', keys: [10], childrenIds: [], parent: '0', depth: 1, leaf: true, x: 0, y: 0, highlighted: false },
      { id: '2', keys: [30], childrenIds: [], parent: '0', depth: 1, leaf: true, x: 0, y: 0, highlighted: false },
    ],
    edges: [
      { from: '0', to: '1' },
      { from: '0', to: '2' },
    ],
  }
}

function makeEmptyData(): BTreeFlattened {
  return { nodes: [], edges: [] }
}

describe('bTreeVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    vi.clearAllMocks()
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 800 400')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderBTree', () => {
    it('应渲染空树提示', () => {
      renderBTree(svg, makeEmptyData(), {})
      expect(svg.textContent).toContain('空 B 树')
    })

    it('应渲染所有节点', () => {
      renderBTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.btree-node')
      expect(nodes.length).toBe(3)
    })

    it('渲染节点应包含 key 文本', () => {
      renderBTree(svg, makeData(), {})
      const keyTexts = svg.querySelectorAll('text.btree-key-text')
      const values = Array.from(keyTexts).map(t => t.textContent)
      expect(values).toContain('20')
      expect(values).toContain('10')
      expect(values).toContain('30')
    })

    it('节点应携带 data-id 与 data-keys 属性', () => {
      renderBTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.btree-node')
      const root = Array.from(nodes).find(g => g.getAttribute('data-id') === '0')
      expect(root).toBeTruthy()
      expect(root?.getAttribute('data-keys')).toBe('20')
    })

    it('应渲染边元素', () => {
      renderBTree(svg, makeData(), {})
      const edges = svg.querySelectorAll('line.btree-edge')
      expect(edges.length).toBe(2)
    })

    it('应渲染节点背景矩形', () => {
      renderBTree(svg, makeData(), {})
      const rects = svg.querySelectorAll('rect.btree-node-bg')
      expect(rects.length).toBe(3)
    })

    it('节点应包含 title 提示', () => {
      renderBTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.btree-node')
      const titles = Array.from(nodes).map(g => g.querySelector('title')?.textContent)
      const rootTitle = titles.find(t => t?.includes('20'))
      expect(rootTitle).toContain('key count: 1')
    })

    it('叶子节点 title 应包含 Leaf node', () => {
      renderBTree(svg, makeData(), {})
      const leafNodes = svg.querySelectorAll('g.btree-node')
      const leafWithTitle = Array.from(leafNodes).find(g => {
        const title = g.querySelector('title')?.textContent || ''
        return title.includes('10') && title.includes('Leaf node')
      })
      expect(leafWithTitle).toBeTruthy()
    })

    it('内部节点 title 应包含 Internal node', () => {
      renderBTree(svg, makeData(), {})
      const nodes = svg.querySelectorAll('g.btree-node')
      const internalNode = Array.from(nodes).find(g => {
        const title = g.querySelector('title')?.textContent || ''
        return title.includes('20') && title.includes('Internal node')
      })
      expect(internalNode).toBeTruthy()
    })

    it('应支持多 key 节点渲染', () => {
      const data: BTreeFlattened = {
        nodes: [
          { id: '0', keys: [10, 20], childrenIds: [], parent: '', depth: 0, leaf: true, x: 0, y: 0, highlighted: false },
        ],
        edges: [],
      }
      renderBTree(svg, data, {})
      const keyTexts = svg.querySelectorAll('text.btree-key-text')
      expect(keyTexts.length).toBe(2)
    })

    it('应清空之前的内容后重新渲染', () => {
      // 第一次渲染
      renderBTree(svg, makeData(), {})
      expect(svg.querySelectorAll('g.btree-node').length).toBe(3)
      // 第二次渲染空树
      renderBTree(svg, makeEmptyData(), {})
      expect(svg.querySelectorAll('g.btree-node').length).toBe(0)
    })
  })

  describe('animateBTreePath', () => {
    const data = makeData()

    it('应存在并正常完成（找到）', async () => {
      renderBTree(svg, data, {})
      await expect(animateBTreePath(svg, [[20], [10]], [10], data, { isAborted: () => false } as never)).resolves.toBeUndefined()
    })

    it('应存在并正常完成（未找到）', async () => {
      renderBTree(svg, data, {})
      await expect(animateBTreePath(svg, [[20], [30]], null, data, { isAborted: () => false } as never)).resolves.toBeUndefined()
    })

    it('空路径应立即返回', async () => {
      await expect(animateBTreePath(svg, [], null, data, { isAborted: () => false } as never)).resolves.toBeUndefined()
      expect(transitionEndMock).not.toHaveBeenCalled()
    })

    it('abort 后应立即结束', async () => {
      renderBTree(svg, data, {})
      const abortedAnim = { isAborted: () => true }
      await expect(animateBTreePath(svg, [[20], [10]], [10], data, abortedAnim as never)).resolves.toBeUndefined()
    })

    it('应调用 duration 与 transitionEnd', async () => {
      transitionEndMock.mockClear()
      durationMock.mockClear()
      renderBTree(svg, data, {})
      await animateBTreePath(svg, [[20], [10]], [10], data, { isAborted: () => false } as never)
      expect(durationMock).toHaveBeenCalled()
      expect(transitionEndMock).toHaveBeenCalled()
    })
  })
})
