import { describe, it, expect } from 'vitest'
import { bellmanFord, floydWarshall, prim, kruskal } from '../algorithms/graph'

/**
 * 新增图算法单元测试
 * 测试图结构（带权重）:
 *   A --4-- B --3-- C
 *   |       |       |
 *   2       1       5
 *   |       |       |
 *   D --7-- E --2-- F
 */

const createAdjacencyList = () => {
  const adj = new Map<string, Array<{ node: string; weight?: number }>>()
  adj.set('A', [{ node: 'B', weight: 4 }, { node: 'D', weight: 2 }])
  adj.set('B', [{ node: 'C', weight: 3 }, { node: 'E', weight: 1 }])
  adj.set('C', [{ node: 'F', weight: 5 }])
  adj.set('D', [{ node: 'E', weight: 7 }])
  adj.set('E', [{ node: 'F', weight: 2 }])
  adj.set('F', [])
  return adj
}

const createUndirectedAdjacencyList = () => {
  const adj = new Map<string, Array<{ node: string; weight?: number }>>()
  adj.set('A', [{ node: 'B', weight: 4 }, { node: 'D', weight: 2 }])
  adj.set('B', [{ node: 'A', weight: 4 }, { node: 'C', weight: 3 }, { node: 'E', weight: 1 }])
  adj.set('C', [{ node: 'B', weight: 3 }, { node: 'F', weight: 5 }])
  adj.set('D', [{ node: 'A', weight: 2 }, { node: 'E', weight: 7 }])
  adj.set('E', [{ node: 'B', weight: 1 }, { node: 'D', weight: 7 }, { node: 'F', weight: 2 }])
  adj.set('F', [{ node: 'C', weight: 5 }, { node: 'E', weight: 2 }])
  return adj
}

const createNegativeWeightGraph = () => {
  const adj = new Map<string, Array<{ node: string; weight?: number }>>()
  adj.set('A', [{ node: 'B', weight: 1 }])
  adj.set('B', [{ node: 'C', weight: -3 }])
  adj.set('C', [{ node: 'D', weight: 2 }])
  adj.set('D', [])
  return adj
}

describe('Bellman-Ford', () => {
  it('应该计算最短路径距离', async () => {
    const adj = createAdjacencyList()
    const result = await bellmanFord(adj, 'A')
    expect(result.distances.get('A')).toBe(0)
    expect(result.distances.get('F')).toBeLessThan(Infinity)
  })

  it('应该正确处理正权图', async () => {
    const adj = createAdjacencyList()
    const result = await bellmanFord(adj, 'A')
    // A→D = 2, A→B = 4, A→D→E = 9, A→B→E = 5, A→B→E→F = 7
    expect(result.distances.get('D')).toBe(2)
    expect(result.distances.get('B')).toBe(4)
  })

  it('应该支持负权边', async () => {
    const adj = createNegativeWeightGraph()
    const result = await bellmanFord(adj, 'A')
    expect(result.hasNegativeCycle).toBe(false)
    // A→B→C→D = 1 + (-3) + 2 = 0
    expect(result.distances.get('D')).toBe(0)
  })

  it('应该检测负权环', async () => {
    const adj = new Map<string, Array<{ node: string; weight?: number }>>()
    adj.set('A', [{ node: 'B', weight: 1 }])
    adj.set('B', [{ node: 'C', weight: -2 }])
    adj.set('C', [{ node: 'A', weight: -2 }])
    const result = await bellmanFord(adj, 'A')
    expect(result.hasNegativeCycle).toBe(true)
  })

  it('应该记录步骤', async () => {
    const adj = createAdjacencyList()
    const result = await bellmanFord(adj, 'A')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })

  it('应该调用 onStep 回调', async () => {
    const adj = createAdjacencyList()
    const steps: any[] = []
    await bellmanFord(adj, 'A', (step) => steps.push(step))
    expect(steps.length).toBeGreaterThan(0)
  })
})

describe('Floyd-Warshall', () => {
  it('应该计算所有节点对的最短距离', async () => {
    const adj = createAdjacencyList()
    const result = await floydWarshall(adj)
    expect(result.dist.get('A')!.get('A')).toBe(0)
    expect(result.dist.get('A')!.get('F')).toBeLessThan(Infinity)
  })

  it('对角线距离应为 0', async () => {
    const adj = createAdjacencyList()
    const result = await floydWarshall(adj)
    for (const node of adj.keys()) {
      expect(result.dist.get(node)!.get(node)).toBe(0)
    }
  })

  it('应该记录步骤', async () => {
    const adj = createAdjacencyList()
    const result = await floydWarshall(adj)
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('应该调用 onStep 回调', async () => {
    const adj = createAdjacencyList()
    const steps: any[] = []
    await floydWarshall(adj, (step) => steps.push(step))
    expect(steps.length).toBeGreaterThan(0)
  })
})

describe('Prim', () => {
  it('应该生成最小生成树', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await prim(adj, 'A')
    // 6 个节点的 MST 应有 5 条边
    expect(result.mstEdges).toHaveLength(5)
  })

  it('MST 总权重应正确', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await prim(adj, 'A')
    // 最小生成树: A-D(2), B-E(1), E-F(2), B-C(3), A-B(4) = 12
    expect(result.totalWeight).toBeGreaterThan(0)
  })

  it('应该访问所有节点', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await prim(adj, 'A')
    expect(result.visited).toHaveLength(6)
  })

  it('应该记录步骤', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await prim(adj, 'A')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })
})

describe('Kruskal', () => {
  it('应该生成最小生成树', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await kruskal(adj)
    expect(result.mstEdges).toHaveLength(5)
  })

  it('MST 总权重应正确', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await kruskal(adj)
    expect(result.totalWeight).toBeGreaterThan(0)
  })

  it('应该记录步骤', async () => {
    const adj = createUndirectedAdjacencyList()
    const result = await kruskal(adj)
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('应该调用 onStep 回调', async () => {
    const adj = createUndirectedAdjacencyList()
    const steps: any[] = []
    await kruskal(adj, (step) => steps.push(step))
    expect(steps.length).toBeGreaterThan(0)
  })
})
