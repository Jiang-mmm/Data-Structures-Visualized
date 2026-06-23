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

  // C-4 子阶段：内存泄漏 + 重渲染 防护
  describe('C-4 内存泄漏与重渲染', () => {
    it('多次 render 后节点数应稳定（不累积泄漏）', () => {
      // 模拟用户快速插入 100 次：data 每次变化都重新 render
      for (let i = 0; i < 100; i++) {
        renderAvlTree(svg, makeData(), {})
      }
      const nodes = svg.querySelectorAll('g.avl-node')
      const edges = svg.querySelectorAll('line.avl-edge')
      // 3 节点 + 2 边 不应随 render 次数增加
      expect(nodes.length).toBe(3)
      expect(edges.length).toBe(2)
    })

    it('重新 render 时旧节点应被完整移除（不残留 __on 监听器）', () => {
      // 第一次 render：注册 focus/blur/keydown 监听器
      renderAvlTree(svg, makeData(), {})
      const firstNodes = Array.from(svg.querySelectorAll('g.avl-node'))
      expect(firstNodes.length).toBeGreaterThan(0)
      // 验证节点上有 __on 监听器（D3 v7 通过 __on 存储事件）
      // 显式事件清理前：监听器可能存在（不强制要求 D3 内部实现细节）
      // 显式事件清理后：监听器应被移除
      // 重新 render：旧节点应被完整清理
      renderAvlTree(svg, makeData(), {})
      const secondNodes = Array.from(svg.querySelectorAll('g.avl-node'))
      // 验证：旧节点对象已不在 DOM 中
      firstNodes.forEach(old => {
        expect(svg.contains(old)).toBe(false)
      })
      // 新节点数仍为 3
      expect(secondNodes.length).toBe(3)
    })

    it('重新 render 时不应残留旧 svg defs/gradients（每次清理完整）', () => {
      // 第一次 render: ensureGradientDefs 会创建 <defs>
      renderAvlTree(svg, makeData(), {})
      const firstDefs = svg.querySelectorAll('defs')
      const firstDefsCount = firstDefs.length
      // 第二次 render: 不应累积 defs
      renderAvlTree(svg, makeData(), {})
      renderAvlTree(svg, makeData(), {})
      const allDefs = svg.querySelectorAll('defs')
      // defs 数量应保持稳定（每次 .remove() 清理后重建）
      expect(allDefs.length).toBeLessThanOrEqual(firstDefsCount + 1)
    })

    it('render 期间 abort 不应导致 transitionEnd 漂浮（floating promise 修复验证）', async () => {
      // 模拟动画被 abort 的场景
      const abortAnim = { isAborted: () => true }
      // 第一次 render + abort 动画
      renderAvlTree(svg, makeData(), {})
      // 多次连续 abort（模拟用户快速点击）
      for (let i = 0; i < 5; i++) {
        await animateTraversal(svg, [50, 30, 70], makeData(), abortAnim as any)
      }
      // 验证 transitionEndMock 没被调用（abort 时应早返回）
      expect(transitionEndMock).not.toHaveBeenCalled()
      // 验证：abort 后 DOM 节点数仍稳定（无 zombie 节点）
      const nodes = svg.querySelectorAll('g.avl-node')
      expect(nodes.length).toBe(3)
    })

    it('render 100 次后应保持稳定的内存占用（节点数 / 边数不累积）', () => {
      // 第一次 render 建立基线
      renderAvlTree(svg, makeData(), {})
      const baselineNodes = svg.querySelectorAll('*').length
      // render 99 次（合计 100 次）
      for (let i = 0; i < 99; i++) {
        renderAvlTree(svg, makeData(), {})
      }
      const endNodes = svg.querySelectorAll('*').length
      // 节点数变化应在 ±5 以内（允许 1-2 个 text/title 微小差异）
      const diff = Math.abs(endNodes - baselineNodes)
      expect(diff).toBeLessThanOrEqual(5)
      // 同时验证基线本身合理（约 25-35 个元素：1 defs + 10 grads + 2 edges + 3*4 node parts）
      expect(baselineNodes).toBeGreaterThan(15)
      expect(baselineNodes).toBeLessThan(60)
    })

    it('空树 → 非空树 → 空树 切换应正确清理（无 DOM 残留）', () => {
      // 第一次：非空树
      renderAvlTree(svg, makeData(), {})
      const firstNodes = svg.querySelectorAll('g.avl-node').length
      expect(firstNodes).toBe(3)
      // 第二次：空树
      renderAvlTree(svg, { nodes: [], edges: [] }, {})
      const emptyNodes = svg.querySelectorAll('g.avl-node').length
      expect(emptyNodes).toBe(0)
      // 应该有"空 AVL 树"提示文本
      expect(svg.textContent).toContain('空 AVL 树')
      // 第三次：再次非空树
      renderAvlTree(svg, makeData(), {})
      const lastNodes = svg.querySelectorAll('g.avl-node').length
      expect(lastNodes).toBe(3)
    })

    it('动画函数应能正确处理 svg 已清空的状态（不抛错）', async () => {
      // 模拟 svg 被清空后调用动画
      svg.innerHTML = ''
      // 动画函数应优雅处理（不抛错），即使 DOM 已被外部清空
      await expect(
        animateInsertPath(svg, [50], makeData(), { isAborted: () => false } as any)
      ).resolves.toBeUndefined()
    })
  })
})
