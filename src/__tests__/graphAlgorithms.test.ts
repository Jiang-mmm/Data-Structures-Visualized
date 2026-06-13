import { describe, it, expect } from 'vitest'
import { bfs, dfs, dijkstra, topoSort } from '../algorithms/graph'

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

describe('BFS', () => {
  it('应该从起始节点开始遍历', async () => {
    const adj = createAdjacencyList()
    const result = await bfs(adj, 'A')
    expect(result.visited).toContain('A')
    expect(result.visited[0]).toBe('A')
  })

  it('应该访问所有可达节点', async () => {
    const adj = createAdjacencyList()
    const result = await bfs(adj, 'A')
    expect(result.visited).toHaveLength(6)
    expect(result.visited).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D', 'E', 'F']))
  })

  it('应该按层级顺序访问', async () => {
    const adj = createAdjacencyList()
    const result = await bfs(adj, 'A')
    expect(result.visited.indexOf('B')).toBeLessThan(result.visited.indexOf('C'))
    expect(result.visited.indexOf('B')).toBeLessThan(result.visited.indexOf('E'))
  })

  it('应该记录遍历步骤', async () => {
    const adj = createAdjacencyList()
    const result = await bfs(adj, 'A')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].type).toBe('init')
  })

  it('应该调用 onStep 回调', async () => {
    const adj = createAdjacencyList()
    const steps: any[] = []
    await bfs(adj, 'A', (step) => steps.push(step))
    expect(steps.length).toBeGreaterThan(0)
  })
})

describe('DFS', () => {
  it('应该从起始节点开始遍历', async () => {
    const adj = createAdjacencyList()
    const result = await dfs(adj, 'A')
    expect(result.visited[0]).toBe('A')
  })

  it('应该访问所有可达节点', async () => {
    const adj = createAdjacencyList()
    const result = await dfs(adj, 'A')
    expect(result.visited).toHaveLength(6)
  })

  it('应该按深度优先顺序访问', async () => {
    const adj = createAdjacencyList()
    const result = await dfs(adj, 'A')
    expect(result.visited.indexOf('B')).toBeLessThan(result.visited.indexOf('F'))
  })

  it('应该记录遍历步骤', async () => {
    const adj = createAdjacencyList()
    const result = await dfs(adj, 'A')
    expect(result.steps.length).toBeGreaterThan(0)
  })
})

describe('Dijkstra', () => {
  it('应该找到最短路径', async () => {
    const adj = createAdjacencyList()
    const result = await dijkstra(adj, 'A')
    expect(result.distances.get('A')).toBe(0)
    expect(result.distances.get('B')).toBe(4)
    expect(result.distances.get('D')).toBe(2)
  })

  it('应该计算正确的距离', async () => {
    const adj = createAdjacencyList()
    const result = await dijkstra(adj, 'A')
    expect(result.distances.get('E')).toBe(5)
    expect(result.distances.get('F')).toBe(7)
  })

  it('应该记录前驱节点', async () => {
    const adj = createAdjacencyList()
    const result = await dijkstra(adj, 'A')
    expect(result.previousNodes.get('A')).toBeNull()
    expect(result.previousNodes.get('B')).toBe('A')
    expect(result.previousNodes.get('D')).toBe('A')
  })

  it('应该访问所有节点', async () => {
    const adj = createAdjacencyList()
    const result = await dijkstra(adj, 'A')
    expect(result.visited).toHaveLength(6)
  })
})

describe('TopoSort', () => {
  it('应该对 DAG 进行拓扑排序', async () => {
    const adj = createAdjacencyList()
    const result = await topoSort(adj)
    expect(result.isDAG).toBe(true)
    expect(result.visited).toHaveLength(6)
  })

  it('应该保证边的方向性', async () => {
    const adj = createAdjacencyList()
    const result = await topoSort(adj)
    expect(result.visited.indexOf('A')).toBeLessThan(result.visited.indexOf('B'))
    expect(result.visited.indexOf('B')).toBeLessThan(result.visited.indexOf('C'))
  })

  it('应该检测非 DAG 图', async () => {
    const adj = new Map<string, Array<{ node: string; weight?: number }>>()
    adj.set('A', [{ node: 'B' }])
    adj.set('B', [{ node: 'C' }])
    adj.set('C', [{ node: 'A' }])
    const result = await topoSort(adj)
    expect(result.isDAG).toBe(false)
  })

  it('应该记录遍历步骤', async () => {
    const adj = createAdjacencyList()
    const result = await topoSort(adj)
    expect(result.steps.length).toBeGreaterThan(0)
  })
})
