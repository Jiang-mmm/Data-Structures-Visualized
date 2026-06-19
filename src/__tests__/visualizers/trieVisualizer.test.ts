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
      if (p === 'attr') return (...args: unknown[]) => { calls.push({ method: 'attr', args }); return c }
      if (p === 'style') return (...args: unknown[]) => { calls.push({ method: 'style', args }); return c }
      if (p === 'on') return (_event: string, cb?: Function) => { if (cb) cb(); return c }
      if (p === 'interrupt') return () => c
      if (p === 'select') return () => c
      if (p === 'selectAll') return () => c
      if (p === 'append') return () => c
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
  // 模拟 ensureGradientDefs 的真实行为：创建扁平色 radialGradient defs
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
  getDefaultEasing: () => 'easeOutCubic',
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderTrie, animateInsertTrie, animateSearchTrie, animateDeleteTrie } = await import('../../visualizers/trieVisualizer')

const trieData = {
  nodes: [
    { id: '1', prefix: 'a', char: 'a', isEndOfWord: false, parent: '', depth: 1, childrenKeys: ['p'] },
    { id: '2', prefix: 'ap', char: 'p', isEndOfWord: false, parent: 'a', depth: 2, childrenKeys: ['p'] },
    { id: '3', prefix: 'app', char: 'p', isEndOfWord: false, parent: 'ap', depth: 3, childrenKeys: ['l'] },
    { id: '4', prefix: 'appl', char: 'l', isEndOfWord: false, parent: 'app', depth: 4, childrenKeys: ['e'] },
    { id: '5', prefix: 'apple', char: 'e', isEndOfWord: true, parent: 'appl', depth: 5, childrenKeys: [] },
  ],
  edges: [
    { from: '1', to: '2', char: 'p' },
    { from: '2', to: '3', char: 'p' },
    { from: '3', to: '4', char: 'l' },
    { from: '4', to: '5', char: 'e' },
  ],
}

const singleNodeTrie = {
  nodes: [{ id: '1', prefix: 'a', char: 'a', isEndOfWord: true, parent: '', depth: 1, childrenKeys: [] as string[] }],
  edges: [] as Array<{ from: string; to: string; char: string }>,
}

describe('trieVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    mockInstances.length = 0
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.getBoundingClientRect = () => ({ width: 800, height: 400, top: 0, left: 0, right: 800, bottom: 400, x: 0, y: 0, toJSON: () => {} })
  })

  describe('renderTrie', () => {
    it('应该能够渲染空字典树', () => {
      expect(() => renderTrie(svg, { nodes: [], edges: [] }, {})).not.toThrow()
    })

    it('应该能够渲染有数据的字典树', () => {
      expect(() => renderTrie(svg, trieData, {})).not.toThrow()
    })

    it('应该渲染单节点字典树', () => {
      expect(() => renderTrie(svg, singleNodeTrie, {})).not.toThrow()
    })

    it('应该处理 null 数据', () => {
      expect(() => renderTrie(svg, null as any, {})).not.toThrow()
    })

    it('应该处理 undefined 数据', () => {
      expect(() => renderTrie(svg, undefined as any, {})).not.toThrow()
    })

    it('应该处理 isDark 选项', () => {
      expect(() => renderTrie(svg, trieData, { isDark: true })).not.toThrow()
    })

    it('应该处理空 options', () => {
      expect(() => renderTrie(svg, trieData)).not.toThrow()
    })

    it('应该处理只有节点没有边的数据', () => {
      expect(() => renderTrie(svg, { nodes: trieData.nodes, edges: [] }, {})).not.toThrow()
    })

    it('应该处理大数据集', () => {
      const bigNodes = Array.from({ length: 50 }, (_, i) => ({
        id: String(i), prefix: `p${i}`, char: String.fromCharCode(97 + (i % 26)),
        isEndOfWord: i % 5 === 0, parent: i > 0 ? `p${i - 1}` : '', depth: i + 1, childrenKeys: [] as string[],
      }))
      const bigEdges = Array.from({ length: 49 }, (_, i) => ({
        from: String(i), to: String(i + 1), char: String.fromCharCode(97 + ((i + 1) % 26)),
      }))
      expect(() => renderTrie(svg, { nodes: bigNodes, edges: bigEdges }, {})).not.toThrow()
    })

    it('应该创建渐变定义 defs 元素', () => {
      renderTrie(svg, trieData, {})
      const defs = svg.querySelector('defs')
      expect(defs).toBeTruthy()
    })

    it('应该创建所有节点类型的径向渐变', () => {
      renderTrie(svg, trieData, {})
      const defs = svg.querySelector('defs')
      expect(defs?.querySelector('#grad-node-root')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-default')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-leaf')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-active')).toBeTruthy()
      expect(defs?.querySelector('#grad-node-error')).toBeTruthy()
    })

    it('渐变应使用 radialGradient 类型（扁平色，与 graph 模块统一）', () => {
      renderTrie(svg, trieData, {})
      const grad = svg.querySelector('#grad-node-default')
      expect(grad?.tagName.toLowerCase()).toBe('radialgradient')
    })

    it('渐变应包含两个 stop（扁平色，两端同色）', () => {
      renderTrie(svg, trieData, {})
      const grad = svg.querySelector('#grad-node-default')
      const stops = grad?.querySelectorAll('stop')
      expect(stops?.length).toBe(2)
      expect(stops?.[0].getAttribute('offset')).toBe('0%')
      expect(stops?.[1].getAttribute('offset')).toBe('100%')
    })

    it('应该处理 width/height 选项', () => {
      expect(() => renderTrie(svg, trieData, { width: 1000, height: 600 })).not.toThrow()
    })

    it('空字典树提示文字应使用 options 尺寸水平居中', () => {
      renderTrie(svg, { nodes: [], edges: [] }, { width: 600, height: 400 })
      const xCalls = getAllAttrCalls().filter(c => c.args[0] === 'x')
      const centerXCall = xCalls.find(c => c.args[1] === 300)
      expect(centerXCall).toBeTruthy()
    })

    it('自定义尺寸下单节点字典树根节点应水平居中', () => {
      renderTrie(svg, singleNodeTrie, { width: 600, height: 400 })
      // 单节点 subtreeWidth = MIN_NODE_SPACING = 72，root.x = 36 + (600 - 72) / 2 = 300
      const transformCalls = getAllAttrCalls().filter(c => c.args[0] === 'transform')
      const rootTransform = transformCalls.find(c =>
        typeof c.args[1] === 'string' && c.args[1].startsWith('translate(300,')
      )
      expect(rootTransform).toBeTruthy()
    })

    it('自定义尺寸下多节点字典树根节点应水平居中', () => {
      renderTrie(svg, trieData, { width: 600, height: 400 })
      const transformCalls = getAllAttrCalls().filter(c => c.args[0] === 'transform')
      const rootTransform = transformCalls.find(c =>
        typeof c.args[1] === 'string' && c.args[1].startsWith('translate(300,')
      )
      expect(rootTransform).toBeTruthy()
    })

    it('应该处理 isDark 时创建暗色主题渐变', () => {
      expect(() => renderTrie(svg, trieData, { isDark: true })).not.toThrow()
      const defs = svg.querySelector('defs')
      expect(defs?.querySelector('#grad-node-root')).toBeTruthy()
    })

    it('应该为空字典树也创建 defs', () => {
      renderTrie(svg, { nodes: [], edges: [] }, {})
      expect(svg.querySelector('defs')).toBeTruthy()
      expect(svg.querySelector('#grad-node-default')).toBeTruthy()
    })

    it('end-of-word 节点应使用胶囊形（rect）并带对勾标记', () => {
      renderTrie(svg, trieData, {})
      // end-of-word 节点的主形状为 rect（胶囊形），class 仍为 trie-node-circle 以便动画选择
      const checkClassCalls = getAllAttrCalls().filter(c => c.args[0] === 'class' && c.args[1] === 'trie-node-checkmark')
      expect(checkClassCalls.length).toBe(1)
    })

    it('不应创建阴影或发光滤镜（已移除 3D 球面效果）', () => {
      renderTrie(svg, trieData, {})
      expect(svg.querySelector('#trie-node-shadow')).toBeFalsy()
      expect(svg.querySelector('#trie-node-glow')).toBeFalsy()
    })

    it('路径边应包含 from-to 选择类', () => {
      renderTrie(svg, trieData, {})
      const edgeClassCalls = getAllAttrCalls().filter(c =>
        c.args[0] === 'class' &&
        typeof c.args[1] === 'string' &&
        (c.args[1] as string).includes('trie-edge from-root-to-root-a')
      )
      const leafEdgeClassCalls = getAllAttrCalls().filter(c =>
        c.args[0] === 'class' &&
        typeof c.args[1] === 'string' &&
        (c.args[1] as string).includes('trie-edge from-root-appl-to-root-apple')
      )
      expect(edgeClassCalls.length).toBe(1)
      expect(leafEdgeClassCalls.length).toBe(1)
    })
  })

  describe('animateInsertTrie', () => {
    it('应该能够执行插入动画（有 word 参数）', async () => {
      await expect(animateInsertTrie(svg, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行插入动画（无 word 参数，回退模式）', async () => {
      await expect(animateInsertTrie(svg)).resolves.toBeUndefined()
    })

    it('应该处理空字符串', async () => {
      await expect(animateInsertTrie(svg, '')).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true, abort: vi.fn(), promise: Promise.resolve(), resolve: vi.fn(), reject: vi.fn() }
      await expect(animateInsertTrie(svg, 'apple', abortedAnim as any)).resolves.toBeUndefined()
    })
  })

  describe('animateSearchTrie', () => {
    it('应该能够执行搜索动画（找到，有 word 参数）', async () => {
      await expect(animateSearchTrie(svg, true, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行搜索动画（未找到，有 word 参数）', async () => {
      await expect(animateSearchTrie(svg, false, 'appx')).resolves.toBeUndefined()
    })

    it('应该能够执行搜索动画（无 word 参数，回退模式）', async () => {
      await expect(animateSearchTrie(svg, true)).resolves.toBeUndefined()
    })

    it('应该处理空字符串搜索', async () => {
      await expect(animateSearchTrie(svg, false, '')).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true, abort: vi.fn(), promise: Promise.resolve(), resolve: vi.fn(), reject: vi.fn() }
      await expect(animateSearchTrie(svg, true, 'apple', abortedAnim as any)).resolves.toBeUndefined()
      await expect(animateSearchTrie(svg, false, 'appx', abortedAnim as any)).resolves.toBeUndefined()
    })
  })

  describe('animateDeleteTrie', () => {
    it('应该能够执行删除动画（有 word 参数）', async () => {
      await expect(animateDeleteTrie(svg, 'apple')).resolves.toBeUndefined()
    })

    it('应该能够执行删除动画（无 word 参数，回退模式）', async () => {
      await expect(animateDeleteTrie(svg)).resolves.toBeUndefined()
    })

    it('应该处理空字符串删除', async () => {
      await expect(animateDeleteTrie(svg, '')).resolves.toBeUndefined()
    })

    it('abort 后应立即结束', async () => {
      const abortedAnim = { isAborted: () => true, abort: vi.fn(), promise: Promise.resolve(), resolve: vi.fn(), reject: vi.fn() }
      await expect(animateDeleteTrie(svg, 'apple', abortedAnim as any)).resolves.toBeUndefined()
    })
  })
})
