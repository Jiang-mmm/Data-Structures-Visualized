import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Animation } from '../../utils/animationEngine'

interface ChainableCall {
  method: string
  args: unknown[]
}

interface ChainableInstance {
  calls: ChainableCall[]
}

const mockInstances: ChainableInstance[] = []

function chainable() {
  const calls: ChainableCall[] = []
  const instance: ChainableInstance = { calls }
  mockInstances.push(instance)
  const m: Record<string, unknown> = {}
  const c = new Proxy(m, {
    get(t, p) {
      if (p === 'empty') return () => true
      if (p === 'nodes') return (): unknown[] => []
      if (p === 'node') return (): null => null
      if (p === 'size') return () => 0
      if (p === 'text') return () => c
      if (p === 'attr') return (...args: unknown[]) => {
        calls.push({ method: 'attr', args })
        if (args.length === 1) return ''
        return c
      }
      if (p === 'style') return (...args: unknown[]) => { calls.push({ method: 'style', args }); return c }
      if (p === 'on') return (_event: string, cb?: Function) => { if (cb) cb(); return c }
      if (p === 'interrupt') return () => c
      if (p === 'select') return () => c
      if (p === 'selectAll') return () => c
      if (p === 'append') return (...args: unknown[]) => { calls.push({ method: 'append', args }); return c }
      if (p === 'remove') return () => c
      if (p === 'transition') return () => c
      if (p === 'duration') return () => c
      if (p === 'ease') return () => c
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
    textMuted: '#9ca3af', containerStroke: '#d1d5db', edgeDefault: '#9ca3af', edgeActive: '#f59e0b',
  }),
  detectDarkMode: () => false,
  ensureGradientDefs: (svg: SVGSVGElement) => {
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.prepend(defs)
    }
    const gradients = [
      { id: 'grad-node-default', color: '#2563eb' },
      { id: 'grad-node-root', color: '#10b981' },
      { id: 'grad-node-leaf', color: '#8b5cf6' },
      { id: 'grad-node-active', color: '#f59e0b' },
      { id: 'grad-node-error', color: '#ef4444' },
    ]
    gradients.forEach(({ id, color }) => {
      if (!defs!.querySelector(`#${id}`)) {
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
        grad.setAttribute('id', id)
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
        stop1.setAttribute('offset', '0%')
        stop1.setAttribute('stop-color', color)
        grad.appendChild(stop1)
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
        stop2.setAttribute('offset', '100%')
        stop2.setAttribute('stop-color', color)
        grad.appendChild(stop2)
        defs!.appendChild(grad)
      }
    })
  },
  gradUrl: (name: string) => `url(#grad-${name})`,
}))
vi.mock('../../utils/animationEngine', () => ({
  duration: (ms: number) => ms,
  EASING: { easeOutCubic: 'easeOutCubic', easeInCubic: 'easeInCubic', easeOutBack: 'easeOutBack', easeOutElastic: 'easeOutElastic' },
  transitionEnd: vi.fn(() => Promise.resolve()),
  measureRender: (_name: string, fn: () => void) => fn(),
  getDefaultEasing: () => 'easeOutCubic',
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderUnionFind, animateInsertUnionFind, animateDeleteUnionFind, animateFindUnionFind, animateUnionUnionFind } = await import('../../visualizers/unionFindVisualizer')

const unionFindData = {
  nodes: [
    { id: 'n1', value: 1 },
    { id: 'n2', value: 2 },
    { id: 'n3', value: 3 },
    { id: 'n4', value: 4 },
    { id: 'n5', value: 5 },
  ],
  edges: [
    { source: 'n2', target: 'n1' },
    { source: 'n3', target: 'n1' },
    { source: 'n5', target: 'n4' },
  ],
  parent: {
    n1: 'n1', n2: 'n1', n3: 'n1', n4: 'n4', n5: 'n4',
  },
  rank: {
    n1: 1, n2: 0, n3: 0, n4: 0, n5: 0,
  },
}

const emptyData = {
  nodes: [],
  edges: [],
  parent: {},
  rank: {},
}

describe('unionFindVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    mockInstances.length = 0
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderUnionFind', () => {
    it('应该能够渲染空并查集', () => {
      expect(() => renderUnionFind(svg, emptyData as any, {})).not.toThrow()
    })

    it('应该能够渲染有数据的并查集', () => {
      expect(() => renderUnionFind(svg, unionFindData as any, {})).not.toThrow()
    })

    it('应该处理 null 数据', () => {
      expect(() => renderUnionFind(svg, null as any, {})).not.toThrow()
    })

    it('应该处理 undefined 数据', () => {
      expect(() => renderUnionFind(svg, undefined as any, {})).not.toThrow()
    })

    it('应该处理 isDark 选项', () => {
      expect(() => renderUnionFind(svg, unionFindData as any, { isDark: true })).not.toThrow()
    })

    it('应该处理空 options', () => {
      expect(() => renderUnionFind(svg, unionFindData as any)).not.toThrow()
    })

    it('应该处理 width/height 选项', () => {
      expect(() => renderUnionFind(svg, unionFindData as any, { width: 1000, height: 600 })).not.toThrow()
    })

    it('应该创建渐变定义 defs 元素', () => {
      renderUnionFind(svg, unionFindData as any, {})
      const defs = svg.querySelector('defs')
      expect(defs).toBeTruthy()
    })

    it('应该创建所有节点类型的径向渐变', () => {
      renderUnionFind(svg, unionFindData as any, {})
      const defs = svg.querySelector('defs')
      expect(defs?.querySelector('#grad-node-root')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-default')).toBeTruthy()
    })

    it('空数据时应能正常渲染（不抛出错误）', () => {
      expect(() => renderUnionFind(svg, emptyData as any, {})).not.toThrow()
    })

    it('应该调用 select 初始化容器', async () => {
      const { select } = await import('../../utils/d3Imports')
      vi.mocked(select).mockClear()
      renderUnionFind(svg, unionFindData as any, {})
      expect(select).toHaveBeenCalledWith(svg)
    })
  })

  describe('animateInsertUnionFind', () => {
    it('应该能够执行插入动画而不抛出错误', async () => {
      await expect(animateInsertUnionFind(svg, 1)).resolves.not.toThrow()
    })

    it('应该处理不存在的值', async () => {
      await expect(animateInsertUnionFind(svg, 999)).resolves.not.toThrow()
    })

    it('应该支持 anim 参数', async () => {
      const anim: Animation = {
        promise: Promise.resolve(),
        isAborted: () => false,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateInsertUnionFind(svg, 1, anim)).resolves.not.toThrow()
    })

    it('anim 中止时应提前返回', async () => {
      const anim: Animation = {
        promise: Promise.resolve(),
        isAborted: () => true,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateInsertUnionFind(svg, 1, anim)).resolves.not.toThrow()
    })
  })

  describe('animateDeleteUnionFind', () => {
    it('应该能够执行删除动画而不抛出错误', async () => {
      await expect(animateDeleteUnionFind(svg, 1)).resolves.not.toThrow()
    })

    it('应该处理不存在的值', async () => {
      await expect(animateDeleteUnionFind(svg, 999)).resolves.not.toThrow()
    })

    it('应该支持 anim 参数', async () => {
      const anim: Animation = {
        promise: Promise.resolve(),
        isAborted: () => false,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateDeleteUnionFind(svg, 1, anim)).resolves.not.toThrow()
    })

    it('anim 中止时应提前返回', async () => {
      const anim: Animation = {
        promise: Promise.resolve(),
        isAborted: () => true,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateDeleteUnionFind(svg, 1, anim)).resolves.not.toThrow()
    })
  })

  describe('animateFindUnionFind', () => {
    it('应该能够执行查找动画而不抛出错误', async () => {
      await expect(animateFindUnionFind(svg, ['n2'], 'n1')).resolves.not.toThrow()
    })

    it('应该处理空路径', async () => {
      await expect(animateFindUnionFind(svg, [], 'n1')).resolves.not.toThrow()
    })

    it('应该处理多节点路径', async () => {
      await expect(animateFindUnionFind(svg, ['n2', 'n3'], 'n1')).resolves.not.toThrow()
    })

    it('应该支持 anim 参数', async () => {
      const anim: Animation = {
        promise: Promise.resolve(),
        isAborted: () => false,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateFindUnionFind(svg, ['n2'], 'n1', anim)).resolves.not.toThrow()
    })

    it('anim 中止时应提前返回', async () => {
      const anim: Animation = {
        promise: Promise.resolve(),
        isAborted: () => true,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateFindUnionFind(svg, ['n2'], 'n1', anim)).resolves.not.toThrow()
    })
  })

  describe('animateUnionUnionFind', () => {
    it('应该能够执行合并动画而不抛出错误', async () => {
      await expect(animateUnionUnionFind(svg, 'n1', 'n4')).resolves.not.toThrow()
    })

    it('应该处理不存在的节点 id', async () => {
      await expect(animateUnionUnionFind(svg, 'nonexistent1', 'nonexistent2')).resolves.not.toThrow()
    })

    it('应该支持 anim 参数', async () => {
      const anim = {
        promise: Promise.resolve(),
        isAborted: () => false,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateUnionUnionFind(svg, 'n1', 'n4', anim)).resolves.not.toThrow()
    })

    it('anim 中止时应提前返回', async () => {
      const anim = {
        promise: Promise.resolve(),
        isAborted: () => true,
        abort: () => undefined,
        resolve: () => undefined,
        reject: () => undefined,
      }
      await expect(animateUnionUnionFind(svg, 'n1', 'n4', anim)).resolves.not.toThrow()
    })
  })
})
