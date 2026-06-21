import { describe, it, expect, vi } from 'vitest'
import { bellmanFord } from '../../../algorithms/graph/bellmanFord'
import { floydWarshall } from '../../../algorithms/graph/floydWarshall'
import { prim } from '../../../algorithms/graph/prim'
import { kruskal } from '../../../algorithms/graph/kruskal'
import { graphAlgorithms } from '../../../algorithms/graph'

// 构建邻接表辅助函数
function buildAdjacencyList(
  edges: Array<{ from: string; to: string; weight?: number }>,
  nodes?: string[]
): Map<string, Array<{ node: string; weight?: number }>> {
  const adj = new Map<string, Array<{ node: string; weight?: number }>>()
  // 确保所有节点都存在（即使没有出边）
  if (nodes) {
    for (const n of nodes) adj.set(n, [])
  }
  for (const { from, to, weight } of edges) {
    if (!adj.has(from)) adj.set(from, [])
    if (!adj.has(to)) adj.set(to, [])
    adj.get(from)!.push({ node: to, weight })
  }
  return adj
}

// 示例图：
// A --1--> B --1--> C
// |               |
// 4               1
// v               v
// D --1--> E --1--> F
const simpleGraph = buildAdjacencyList([
  { from: 'A', to: 'B', weight: 1 },
  { from: 'B', to: 'C', weight: 1 },
  { from: 'C', to: 'F', weight: 1 },
  { from: 'A', to: 'D', weight: 4 },
  { from: 'D', to: 'E', weight: 1 },
  { from: 'E', to: 'F', weight: 1 },
])

// 带负权的图（用于 Bellman-Ford）
// A --1--> B --(-2)--> C --1--> D
const negativeWeightGraph = buildAdjacencyList([
  { from: 'A', to: 'B', weight: 1 },
  { from: 'B', to: 'C', weight: -2 },
  { from: 'C', to: 'D', weight: 1 },
])

// 带负权环的图
// A --1--> B --(-2)--> A（形成负权环）
const negativeCycleGraph = buildAdjacencyList([
  { from: 'A', to: 'B', weight: 1 },
  { from: 'B', to: 'A', weight: -2 },
  { from: 'B', to: 'C', weight: 3 },
])

// 无向图（用于 MST 算法）— 双向边
// A -1- B -2- C
// |     |     |
// 4     3     1
// |     |     |
// D -5- E -6- F
const undirectedGraph = buildAdjacencyList([
  { from: 'A', to: 'B', weight: 1 },
  { from: 'B', to: 'A', weight: 1 },
  { from: 'B', to: 'C', weight: 2 },
  { from: 'C', to: 'B', weight: 2 },
  { from: 'A', to: 'D', weight: 4 },
  { from: 'D', to: 'A', weight: 4 },
  { from: 'B', to: 'E', weight: 3 },
  { from: 'E', to: 'B', weight: 3 },
  { from: 'C', to: 'F', weight: 1 },
  { from: 'F', to: 'C', weight: 1 },
  { from: 'D', to: 'E', weight: 5 },
  { from: 'E', to: 'D', weight: 5 },
  { from: 'E', to: 'F', weight: 6 },
  { from: 'F', to: 'E', weight: 6 },
])

describe('图算法注册', () => {
  it('graphAlgorithms 应包含 8 个算法', () => {
    expect(graphAlgorithms).toHaveLength(8)
  })

  it('应包含 Bellman-Ford 算法', () => {
    const algo = graphAlgorithms.find(a => a.key === 'bellmanFord')
    expect(algo).toBeDefined()
    expect(algo!.timeComplexity).toBe('O(V·E)')
  })

  it('应包含 Floyd-Warshall 算法', () => {
    const algo = graphAlgorithms.find(a => a.key === 'floydWarshall')
    expect(algo).toBeDefined()
    expect(algo!.timeComplexity).toBe('O(V³)')
  })

  it('应包含 Prim 算法', () => {
    const algo = graphAlgorithms.find(a => a.key === 'prim')
    expect(algo).toBeDefined()
    expect(algo!.timeComplexity).toBe('O(V²)')
  })

  it('应包含 Kruskal 算法', () => {
    const algo = graphAlgorithms.find(a => a.key === 'kruskal')
    expect(algo).toBeDefined()
    expect(algo!.timeComplexity).toBe('O(E log E)')
  })
})

describe('Bellman-Ford 算法', () => {
  it('应正确计算简单图的最短路径', async () => {
    const result = await bellmanFord(simpleGraph, 'A')
    expect(result.distances.get('A')).toBe(0)
    expect(result.distances.get('B')).toBe(1)
    expect(result.distances.get('C')).toBe(2)
    expect(result.distances.get('F')).toBe(3)
    expect(result.distances.get('D')).toBe(4)
    expect(result.hasNegativeCycle).toBe(false)
  })

  it('应正确处理负权边', async () => {
    const result = await bellmanFord(negativeWeightGraph, 'A')
    expect(result.distances.get('A')).toBe(0)
    expect(result.distances.get('B')).toBe(1)
    expect(result.distances.get('C')).toBe(-1)
    expect(result.distances.get('D')).toBe(0)
    expect(result.hasNegativeCycle).toBe(false)
  })

  it('应检测出负权环', async () => {
    const result = await bellmanFord(negativeCycleGraph, 'A')
    expect(result.hasNegativeCycle).toBe(true)
  })

  it('起始节点距离应为 0', async () => {
    const result = await bellmanFord(simpleGraph, 'A')
    expect(result.distances.get('A')).toBe(0)
  })

  it('应构建前驱节点映射', async () => {
    const result = await bellmanFord(simpleGraph, 'A')
    expect(result.previousNodes.get('A')).toBeNull()
    expect(result.previousNodes.get('B')).toBe('A')
  })

  it('应生成步骤数组', async () => {
    const result = await bellmanFord(simpleGraph, 'A')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })

  it('应调用 onStep 回调', async () => {
    const onStep = vi.fn()
    await bellmanFord(simpleGraph, 'A', onStep)
    expect(onStep).toHaveBeenCalled()
  })

  it('应返回访问节点列表', async () => {
    const result = await bellmanFord(simpleGraph, 'A')
    expect(result.visited.length).toBeGreaterThan(0)
  })

  it('应返回边列表', async () => {
    const result = await bellmanFord(simpleGraph, 'A')
    expect(Array.isArray(result.edges)).toBe(true)
  })

  it('不可达节点距离应为 Infinity', async () => {
    const graph = buildAdjacencyList([
      { from: 'A', to: 'B', weight: 1 },
    ], ['A', 'B', 'C'])
    const result = await bellmanFord(graph, 'A')
    expect(result.distances.get('C')).toBe(Infinity)
  })
})

describe('Floyd-Warshall 算法', () => {
  it('应计算所有节点对的最短距离', async () => {
    const result = await floydWarshall(simpleGraph)
    expect(result.dist.get('A')!.get('A')).toBe(0)
    expect(result.dist.get('A')!.get('B')).toBe(1)
    expect(result.dist.get('A')!.get('C')).toBe(2)
    expect(result.dist.get('A')!.get('F')).toBe(3)
    expect(result.dist.get('A')!.get('D')).toBe(4)
  })

  it('对角线距离应为 0', async () => {
    const result = await floydWarshall(simpleGraph)
    for (const node of simpleGraph.keys()) {
      expect(result.dist.get(node)!.get(node)).toBe(0)
    }
  })

  it('应处理负权边', async () => {
    const result = await floydWarshall(negativeWeightGraph)
    expect(result.dist.get('A')!.get('C')).toBe(-1)
    expect(result.dist.get('A')!.get('D')).toBe(0)
  })

  it('应生成步骤数组', async () => {
    const result = await floydWarshall(simpleGraph)
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })

  it('应调用 onStep 回调', async () => {
    const onStep = vi.fn()
    await floydWarshall(simpleGraph, onStep)
    expect(onStep).toHaveBeenCalled()
  })

  it('应返回访问节点列表', async () => {
    const result = await floydWarshall(simpleGraph)
    expect(result.visited.length).toBeGreaterThan(0)
  })

  it('应返回下一跳矩阵', async () => {
    const result = await floydWarshall(simpleGraph)
    expect(result.next).toBeDefined()
    expect(result.next.size).toBe(simpleGraph.size)
  })

  it('应返回边列表', async () => {
    const result = await floydWarshall(simpleGraph)
    expect(Array.isArray(result.edges)).toBe(true)
  })

  it('不可达节点对距离应为 Infinity', async () => {
    const graph = buildAdjacencyList([
      { from: 'A', to: 'B', weight: 1 },
    ], ['A', 'B', 'C'])
    const result = await floydWarshall(graph)
    expect(result.dist.get('C')!.get('A')).toBe(Infinity)
  })

  it('应正确计算中转路径', async () => {
    // A->B->C 比 A->C 直接更短的情况
    const graph = buildAdjacencyList([
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'A', to: 'C', weight: 5 },
    ])
    const result = await floydWarshall(graph)
    expect(result.dist.get('A')!.get('C')).toBe(2)
  })
})

describe('Prim 算法', () => {
  it('应正确计算最小生成树', async () => {
    const result = await prim(undirectedGraph, 'A')
    expect(result.mstEdges.length).toBe(5) // 6 个节点的 MST 有 5 条边
  })

  it('应计算正确的总权重', async () => {
    const result = await prim(undirectedGraph, 'A')
    // MST: A-B(1), B-C(2), C-F(1), B-E(3), A-D(4) = 11
    expect(result.totalWeight).toBe(11)
  })

  it('起始节点应在访问列表中', async () => {
    const result = await prim(undirectedGraph, 'A')
    expect(result.visited).toContain('A')
  })

  it('应访问所有节点', async () => {
    const result = await prim(undirectedGraph, 'A')
    expect(result.visited.length).toBe(6)
  })

  it('应生成步骤数组', async () => {
    const result = await prim(undirectedGraph, 'A')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })

  it('应调用 onStep 回调', async () => {
    const onStep = vi.fn()
    await prim(undirectedGraph, 'A', onStep)
    expect(onStep).toHaveBeenCalled()
  })

  it('应返回边列表', async () => {
    const result = await prim(undirectedGraph, 'A')
    expect(Array.isArray(result.edges)).toBe(true)
  })

  it('MST 边数应为 V-1', async () => {
    const result = await prim(undirectedGraph, 'A')
    expect(result.mstEdges.length).toBe(undirectedGraph.size - 1)
  })

  it('不连通图应提前终止', async () => {
    const graph = buildAdjacencyList([
      { from: 'A', to: 'B', weight: 1 },
    ], ['A', 'B', 'C', 'D'])
    const result = await prim(graph, 'A')
    expect(result.mstEdges.length).toBe(1)
    expect(result.visited.length).toBe(2)
  })

  it('应从不同起始节点得到相同的总权重', async () => {
    const result1 = await prim(undirectedGraph, 'A')
    const result2 = await prim(undirectedGraph, 'F')
    expect(result1.totalWeight).toBe(result2.totalWeight)
  })
})

describe('Kruskal 算法', () => {
  it('应正确计算最小生成树', async () => {
    const result = await kruskal(undirectedGraph)
    expect(result.mstEdges.length).toBe(5) // 6 个节点的 MST 有 5 条边
  })

  it('应计算正确的总权重', async () => {
    const result = await kruskal(undirectedGraph)
    // MST: A-B(1), C-F(1), B-C(2), B-E(3), A-D(4) = 11
    expect(result.totalWeight).toBe(11)
  })

  it('应生成步骤数组', async () => {
    const result = await kruskal(undirectedGraph)
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })

  it('应调用 onStep 回调', async () => {
    const onStep = vi.fn()
    await kruskal(undirectedGraph, onStep)
    expect(onStep).toHaveBeenCalled()
  })

  it('应返回访问节点列表', async () => {
    const result = await kruskal(undirectedGraph)
    expect(result.visited.length).toBeGreaterThan(0)
  })

  it('应返回边列表', async () => {
    const result = await kruskal(undirectedGraph)
    expect(Array.isArray(result.edges)).toBe(true)
  })

  it('MST 边数应为 V-1', async () => {
    const result = await kruskal(undirectedGraph)
    expect(result.mstEdges.length).toBe(undirectedGraph.size - 1)
  })

  it('应按权重升序选择边', async () => {
    const result = await kruskal(undirectedGraph)
    const weights = result.mstEdges.map(e => e.weight)
    for (let i = 1; i < weights.length; i++) {
      expect(weights[i]).toBeGreaterThanOrEqual(weights[i - 1])
    }
  })

  it('不连通图应返回部分 MST', async () => {
    const graph = buildAdjacencyList([
      { from: 'A', to: 'B', weight: 1 },
    ], ['A', 'B', 'C', 'D'])
    const result = await kruskal(graph)
    expect(result.mstEdges.length).toBe(1)
  })

  it('应正确处理环检测', async () => {
    // 三角形：A-B, B-C, A-C，应只选 2 条边
    const triangleGraph = buildAdjacencyList([
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'A', weight: 1 },
      { from: 'B', to: 'C', weight: 2 },
      { from: 'C', to: 'B', weight: 2 },
      { from: 'A', to: 'C', weight: 3 },
      { from: 'C', to: 'A', weight: 3 },
    ])
    const result = await kruskal(triangleGraph)
    expect(result.mstEdges.length).toBe(2)
    expect(result.totalWeight).toBe(3) // 1 + 2
  })

  it('Prim 和 Kruskal 应得到相同的 MST 总权重', async () => {
    const primResult = await prim(undirectedGraph, 'A')
    const kruskalResult = await kruskal(undirectedGraph)
    expect(primResult.totalWeight).toBe(kruskalResult.totalWeight)
  })
})
