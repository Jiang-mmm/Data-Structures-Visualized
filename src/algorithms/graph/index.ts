export { bfs, type GraphAlgorithmResult } from './bfs'
export { dfs } from './dfs'
export { dijkstra, type DijkstraResult } from './dijkstra'
export { topoSort, type TopoSortResult } from './topoSort'

export type GraphAlgorithmKey = 'bfs' | 'dfs' | 'dijkstra' | 'topoSort'

export interface GraphAlgorithm {
  key: GraphAlgorithmKey
  name: string
  timeComplexity: string
  spaceComplexity: string
  description: string
}

export const graphAlgorithms: GraphAlgorithm[] = [
  { key: 'bfs', name: 'BFS', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '广度优先搜索' },
  { key: 'dfs', name: 'DFS', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '深度优先搜索' },
  { key: 'dijkstra', name: 'Dijkstra', timeComplexity: 'O((V+E)logV)', spaceComplexity: 'O(V)', description: '最短路径算法' },
  { key: 'topoSort', name: 'TopoSort', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '拓扑排序' },
]
