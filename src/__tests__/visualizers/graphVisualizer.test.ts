import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../utils/themeColors', () => ({
  getColors: () => ({
    nodeDefault: '#2563eb', nodeDefaultStroke: '#1e40af', nodeActive: '#f59e0b',
    nodeActiveStroke: '#d97706', nodeRoot: '#10b981', nodeRootStroke: '#059669',
    nodeLeaf: '#8b5cf6', nodeLeafStroke: '#7c3aed', nodeVisited: '#8b5cf6',
    nodeVisitedStroke: '#7c3aed', nodeError: '#ef4444', nodeErrorStroke: '#dc2626',
    textWhite: '#ffffff', textLight: '#6b7280', textSecondary: '#6b7280',
    containerStroke: '#d1d5db', edgeDefault: '#9ca3af', edgeActive: '#f59e0b',
    arrowStroke: '#4b5563',
  }),
  detectDarkMode: () => false,
  ensureGradientDefs: vi.fn(),
  gradUrl: (name: string) => `url(#grad-${name})`,
}))
vi.mock('../../utils/animationEngine', () => ({
  duration: (ms: number) => ms,
  EASING: {
    easeOutCubic: (t: number) => t,
    easeInCubic: (t: number) => t,
    easeOutBack: (t: number) => t,
    easeOutElastic: (t: number) => t,
  },
  transitionEnd: vi.fn(() => Promise.resolve()),
  getDefaultEasing: () => (t: number) => t,
  measureRender: vi.fn((_label: string, fn: () => unknown) => fn()),
}))
vi.mock('../../i18n/useI18n', () => ({ tStatic: (key: string) => key }))

const { renderGraph, animateBFS, animateDFS, animateDijkstra, clearGraphSimulation } = await import('../../visualizers/graphVisualizer')

const nodes = [
  { id: 'A', group: 0 }, { id: 'B', group: 1 }, { id: 'C', group: 2 },
]
const links = [
  { source: 'A', target: 'B', weight: 1 },
  { source: 'B', target: 'C', weight: 2 },
]

describe('graphVisualizer', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement
    svg.getBoundingClientRect = () => ({ width: 800, height: 500, top: 0, left: 0, right: 800, bottom: 500, x: 0, y: 0, toJSON: () => {} })
  })

  afterEach(() => {
    clearGraphSimulation(svg as any)
  })

  describe('renderGraph', () => {
    it('应该能够渲染空图', () => {
      expect(() => renderGraph(svg, [], [], { width: 800, height: 500 })).not.toThrow()
    })

    it('应该能够渲染有节点和边的图', () => {
      expect(() => renderGraph(svg, nodes, links, { width: 800, height: 500 })).not.toThrow()
    })

    it('tick 回调不应直接修改 line 的 x1/y1/x2/y2 属性', () => {
      renderGraph(svg, nodes, links, { width: 800, height: 500 })
      const sim = (svg as any).__simulation
      expect(sim).toBeDefined()
      sim.stop()

      const tick = sim.on('tick')
      expect(tick).toBeDefined()

      const simNodes = sim.nodes() as Array<{ x: number; y: number }>
      // 设置确定性位置
      simNodes[0].x = 100; simNodes[0].y = 100 // A
      simNodes[1].x = 300; simNodes[1].y = 200 // B
      simNodes[2].x = 500; simNodes[2].y = 100 // C

      const lines = svg.querySelectorAll('line')
      expect(lines.length).toBe(links.length)

      lines.forEach(line => {
        expect(line.getAttribute('x1')).toBe('0')
        expect(line.getAttribute('y1')).toBe('0')
        expect(line.getAttribute('x2')).toBe('1')
        expect(line.getAttribute('y2')).toBe('0')
      })

      const initialAttrs = Array.from(lines).map(line => ({
        x1: line.getAttribute('x1'),
        y1: line.getAttribute('y1'),
        x2: line.getAttribute('x2'),
        y2: line.getAttribute('y2'),
      }))

      tick()

      const afterAttrs = Array.from(lines).map(line => ({
        x1: line.getAttribute('x1'),
        y1: line.getAttribute('y1'),
        x2: line.getAttribute('x2'),
        y2: line.getAttribute('y2'),
      }))

      expect(afterAttrs).toEqual(initialAttrs)

      const linkGroups = svg.querySelectorAll('g.link-group')
      expect(linkGroups.length).toBe(links.length)
      linkGroups.forEach(g => {
        const transform = g.getAttribute('transform')
        expect(transform).toMatch(/^translate\(/)
      })
    })
  })

  describe('animateBFS', () => {
    it('应该能够执行 BFS 动画', async () => {
      const result = await animateBFS(svg, 'A', nodes, links, { width: 800, height: 500 })
      expect(Array.isArray(result)).toBe(true)
    })

    it('应该跳过大型图的动画', async () => {
      const largeNodes = Array.from({ length: 20 }, (_, i) => ({ id: `N${i}`, group: 0 }))
      const result = await animateBFS(svg, 'N0', largeNodes, [], { width: 800, height: 500 })
      expect(result).toEqual([])
    })
  })

  describe('animateDFS', () => {
    it('应该能够执行 DFS 动画', async () => {
      const result = await animateDFS(svg, 'A', nodes, links, { width: 800, height: 500 })
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('animateDijkstra', () => {
    it('应该能够执行 Dijkstra 动画', async () => {
      const result = await animateDijkstra(svg, 'A', 'C', nodes, links, { width: 800, height: 500 })
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('clearGraphSimulation', () => {
    it('应该能够清除模拟', () => {
      expect(() => clearGraphSimulation(svg as any)).not.toThrow()
    })
  })

  describe('边界条件', () => {
    it('renderGraph 应处理带权重的边', () => {
      const weightedLinks = [
        { source: 'A', target: 'B', weight: 5 },
        { source: 'B', target: 'C', weight: 3 },
      ]
      expect(() => renderGraph(svg, nodes, weightedLinks, { width: 800, height: 500 })).not.toThrow()
    })

    it('renderGraph 应处理无权重的边', () => {
      const noWeightLinks = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
      ]
      expect(() => renderGraph(svg, nodes, noWeightLinks, { width: 800, height: 500 })).not.toThrow()
    })

    it('animateBFS 应在中止时提前退出', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      const result = await animateBFS(svg, 'A', nodes, links, { width: 800, height: 500 }, anim as any)
      expect(Array.isArray(result)).toBe(true)
    })

    it('animateDFS 应在中止时提前退出', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      const result = await animateDFS(svg, 'A', nodes, links, { width: 800, height: 500 }, anim as any)
      expect(Array.isArray(result)).toBe(true)
    })

    it('animateDijkstra 应在中止时提前退出', async () => {
      const anim = { promise: Promise.resolve(), abort: () => {}, isAborted: () => true, resolve: () => {}, reject: () => {} }
      const result = await animateDijkstra(svg, 'A', 'C', nodes, links, { width: 800, height: 500 }, anim as any)
      expect(Array.isArray(result)).toBe(true)
    })

    it('animateDijkstra 应处理不可达节点', async () => {
      const disconnectedNodes = [
        { id: 'A', group: 0 }, { id: 'B', group: 1 },
        { id: 'X', group: 2 }, { id: 'Y', group: 3 },
      ]
      const disconnectedLinks = [
        { source: 'A', target: 'B', weight: 1 },
        { source: 'X', target: 'Y', weight: 1 },
      ]
      const result = await animateDijkstra(svg, 'A', 'Y', disconnectedNodes, disconnectedLinks, { width: 800, height: 500 })
      expect(Array.isArray(result)).toBe(true)
    })

    it('animateBFS 应处理单节点图', async () => {
      const singleNodes = [{ id: 'A', group: 0 }]
      const result = await animateBFS(svg, 'A', singleNodes, [], { width: 800, height: 500 })
      expect(result).toEqual(['A'])
    })

    it('animateDFS 应处理单节点图', async () => {
      const singleNodes = [{ id: 'A', group: 0 }]
      const result = await animateDFS(svg, 'A', singleNodes, [], { width: 800, height: 500 })
      expect(result).toEqual(['A'])
    })

    it('animateBFS 应跳过大型图', async () => {
      const largeNodes = Array.from({ length: 20 }, (_, i) => ({ id: `N${i}`, group: 0 }))
      const result = await animateBFS(svg, 'N0', largeNodes, [], { width: 800, height: 500 })
      expect(result).toEqual([])
    })

    it('animateDFS 应跳过大型图', async () => {
      const largeNodes = Array.from({ length: 20 }, (_, i) => ({ id: `N${i}`, group: 0 }))
      const result = await animateDFS(svg, 'N0', largeNodes, [], { width: 800, height: 500 })
      expect(result).toEqual([])
    })

    it('animateDijkstra 应跳过大型图', async () => {
      const largeNodes = Array.from({ length: 20 }, (_, i) => ({ id: `N${i}`, group: 0 }))
      const result = await animateDijkstra(svg, 'N0', 'N19', largeNodes, [], { width: 800, height: 500 })
      expect(result).toEqual([])
    })
  })
})
