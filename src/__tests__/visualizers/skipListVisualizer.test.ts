import { describe, it, expect, vi, beforeEach } from 'vitest'

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
        // getter 模式（单参数）返回空字符串，避免 Number()/parseFloat() 转换失败
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
      if (p === Symbol.iterator) return undefined
      if (!(p in t)) t[p as string] = vi.fn(() => chainable())
      return t[p as string]
    },
  })
  return c
}

function getAllAttrCalls() {
  return mockInstances.flatMap(i => i.calls.filter(c => c.method === 'attr'))
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

const { renderSkipList, animateInsertSkipList, animateSearchSkipList, animateDeleteSkipList } = await import('../../visualizers/skipListVisualizer')

const skipListData = {
  nodes: [
    { id: 'head', value: -Infinity, level: 2 },
    { id: 'n-10', value: 10, level: 2 },
    { id: 'n-20', value: 20, level: 1 },
    { id: 'n-30', value: 30, level: 2 },
    { id: 'n-40', value: 40, level: 1 },
    { id: 'n-50', value: 50, level: 1 },
  ],
  edges: [
    { source: 'head', target: 'n-10', level: 0 },
    { source: 'n-10', target: 'n-20', level: 0 },
    { source: 'n-20', target: 'n-30', level: 0 },
    { source: 'n-30', target: 'n-40', level: 0 },
    { source: 'n-40', target: 'n-50', level: 0 },
    { source: 'head', target: 'n-10', level: 1 },
    { source: 'n-10', target: 'n-30', level: 1 },
    { source: 'n-30', target: 'n-50', level: 1 },
  ],
  maxLevel: 2,
}

const emptyData = {
  nodes: [],
  edges: [],
  maxLevel: 0,
}

describe('skipListVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    mockInstances.length = 0
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderSkipList', () => {
    it('应该能够渲染空跳表', () => {
      expect(() => renderSkipList(svg, emptyData as any, {})).not.toThrow()
    })

    it('应该能够渲染有数据的跳表', () => {
      expect(() => renderSkipList(svg, skipListData as any, {})).not.toThrow()
    })

    it('应该处理 null 数据', () => {
      expect(() => renderSkipList(svg, null as any, {})).not.toThrow()
    })

    it('应该处理 undefined 数据', () => {
      expect(() => renderSkipList(svg, undefined as any, {})).not.toThrow()
    })

    it('应该处理 isDark 选项', () => {
      expect(() => renderSkipList(svg, skipListData as any, { isDark: true })).not.toThrow()
    })

    it('应该处理空 options', () => {
      expect(() => renderSkipList(svg, skipListData as any)).not.toThrow()
    })

    it('应该处理 width/height 选项', () => {
      expect(() => renderSkipList(svg, skipListData as any, { width: 1000, height: 600 })).not.toThrow()
    })

    it('应该创建渐变定义 defs 元素', () => {
      renderSkipList(svg, skipListData as any, {})
      const defs = svg.querySelector('defs')
      expect(defs).toBeTruthy()
    })

    it('应该创建所有节点类型的径向渐变', () => {
      renderSkipList(svg, skipListData as any, {})
      const defs = svg.querySelector('defs')
      expect(defs?.querySelector('#grad-node-root')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-default')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-active')).toBeTruthy()
    })

    it('渐变应使用 radialGradient 类型（扁平色，与其他模块统一）', () => {
      renderSkipList(svg, skipListData as any, {})
      const grad = svg.querySelector('#grad-node-default')
      expect(grad?.tagName.toLowerCase()).toBe('radialgradient')
    })

    it('渐变应包含两个 stop（扁平色，两端同色）', () => {
      renderSkipList(svg, skipListData as any, {})
      const grad = svg.querySelector('#grad-node-default')
      const stops = grad?.querySelectorAll('stop')
      expect(stops?.length).toBe(2)
      expect(stops?.[0].getAttribute('offset')).toBe('0%')
      expect(stops?.[1].getAttribute('offset')).toBe('100%')
    })

    it('应该为空跳表也创建 defs', () => {
      renderSkipList(svg, emptyData as any, {})
      expect(svg.querySelector('defs')).toBeTruthy()
      expect(svg.querySelector('#grad-node-default')).toBeTruthy()
    })

    it('应该处理大数据集', () => {
      const bigNodes = [{ id: 'head', value: -Infinity, level: 3 }]
      const bigEdges: Array<{ source: string; target: string; level: number }> = []
      for (let i = 1; i <= 30; i++) {
        bigNodes.push({ id: `n-${i * 3}`, value: i * 3, level: 1 + (i % 3) })
      }
      // 第 0 层连接所有节点
      const sortedIds = ['head', ...bigNodes.slice(1).map(n => n.id).sort((a, b) => {
        const va = bigNodes.find(n => n.id === a)!.value
        const vb = bigNodes.find(n => n.id === b)!.value
        return va - vb
      })]
      for (let i = 0; i < sortedIds.length - 1; i++) {
        bigEdges.push({ source: sortedIds[i], target: sortedIds[i + 1], level: 0 })
      }
      const bigData = { nodes: bigNodes, edges: bigEdges, maxLevel: 3 }
      expect(() => renderSkipList(svg, bigData as any, {})).not.toThrow()
    })

    it('空跳表提示文字应使用 options 尺寸水平居中', () => {
      renderSkipList(svg, emptyData as any, { width: 600, height: 400 })
      const xCalls = getAllAttrCalls().filter(c => c.args[0] === 'x')
      const centerXCall = xCalls.find(c => c.args[1] === 300)
      expect(centerXCall).toBeTruthy()
    })

    it('节点应使用 rect 形状（圆角矩形）', () => {
      renderSkipList(svg, skipListData as any, {})
      const appendCalls = mockInstances.flatMap(i => i.calls.filter(c => c.method === 'append'))
      const rectAppends = appendCalls.filter(c => c.args[0] === 'rect')
      expect(rectAppends.length).toBeGreaterThan(0)
    })

    it('边应使用 line 元素', () => {
      renderSkipList(svg, skipListData as any, {})
      const appendCalls = mockInstances.flatMap(i => i.calls.filter(c => c.method === 'append'))
      const lineAppends = appendCalls.filter(c => c.args[0] === 'line')
      expect(lineAppends.length).toBeGreaterThan(0)
    })

    it('节点应携带 data-id 属性', () => {
      renderSkipList(svg, skipListData as any, {})
      const dataIdCalls = getAllAttrCalls().filter(c => c.args[0] === 'data-id')
      expect(dataIdCalls.length).toBeGreaterThan(0)
    })

    it('节点应携带 data-value 属性', () => {
      renderSkipList(svg, skipListData as any, {})
      const dataValueCalls = getAllAttrCalls().filter(c => c.args[0] === 'data-value')
      expect(dataValueCalls.length).toBeGreaterThan(0)
    })

    it('边应包含 from-to 选择类', () => {
      renderSkipList(svg, skipListData as any, {})
      const edgeClassCalls = getAllAttrCalls().filter(c =>
        c.args[0] === 'class' &&
        typeof c.args[1] === 'string' &&
        (c.args[1] as string).includes('skiplist-edge') &&
        (c.args[1] as string).includes('from-head-to-n-10')
      )
      expect(edgeClassCalls.length).toBeGreaterThan(0)
    })

    it('节点应包含 skiplist-node 类', () => {
      renderSkipList(svg, skipListData as any, {})
      const nodeClassCalls = getAllAttrCalls().filter(c =>
        c.args[0] === 'class' &&
        typeof c.args[1] === 'string' &&
        (c.args[1] as string).includes('skiplist-node')
      )
      expect(nodeClassCalls.length).toBeGreaterThan(0)
    })

    it('应渲染层级标签', () => {
      renderSkipList(svg, skipListData as any, {})
      const levelLabelClassCalls = getAllAttrCalls().filter(c =>
        c.args[0] === 'class' &&
        typeof c.args[1] === 'string' &&
        (c.args[1] as string).includes('skiplist-level-label')
      )
      expect(levelLabelClassCalls.length).toBeGreaterThan(0)
    })
  })

  describe('animateInsertSkipList', () => {
    it('应该能够执行插入动画', async () => {
      await expect(animateInsertSkipList(svg, 10)).resolves.toBeUndefined()
    })

    it('应该处理不存在的值', async () => {
      await expect(animateInsertSkipList(svg, 999)).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true, abort: vi.fn(), promise: Promise.resolve(), resolve: vi.fn(), reject: vi.fn() }
      await expect(animateInsertSkipList(svg, 10, abortedAnim as any)).resolves.toBeUndefined()
    })
  })

  describe('animateSearchSkipList', () => {
    it('应该能够执行搜索动画（找到）', async () => {
      const path = [{ nodeId: 'n-10', level: 1 }, { nodeId: 'n-10', level: 0 }]
      await expect(animateSearchSkipList(svg, path, true)).resolves.toBeUndefined()
    })

    it('应该能够执行搜索动画（未找到）', async () => {
      const path = [{ nodeId: 'n-10', level: 1 }]
      await expect(animateSearchSkipList(svg, path, false)).resolves.toBeUndefined()
    })

    it('应该处理空路径', async () => {
      await expect(animateSearchSkipList(svg, [], false)).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true, abort: vi.fn(), promise: Promise.resolve(), resolve: vi.fn(), reject: vi.fn() }
      const path = [{ nodeId: 'n-10', level: 1 }]
      await expect(animateSearchSkipList(svg, path, true, abortedAnim as any)).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteSkipList', () => {
    it('应该能够执行删除动画', async () => {
      await expect(animateDeleteSkipList(svg, 10)).resolves.toBeUndefined()
    })

    it('应该处理不存在的值', async () => {
      await expect(animateDeleteSkipList(svg, 999)).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true, abort: vi.fn(), promise: Promise.resolve(), resolve: vi.fn(), reject: vi.fn() }
      await expect(animateDeleteSkipList(svg, 10, abortedAnim as any)).resolves.toBeUndefined()
    })
  })
})
