export { bfs, type GraphAlgorithmResult } from './bfs'
export { dfs } from './dfs'
export { dijkstra, type DijkstraResult } from './dijkstra'
export { topoSort, type TopoSortResult } from './topoSort'
export { bellmanFord, type BellmanFordResult } from './bellmanFord'
export { floydWarshall, type FloydWarshallResult } from './floydWarshall'
export { prim, type PrimResult } from './prim'
export { kruskal, type KruskalResult } from './kruskal'

export type GraphAlgorithmKey = 'bfs' | 'dfs' | 'dijkstra' | 'topoSort' | 'bellmanFord' | 'floydWarshall' | 'prim' | 'kruskal'

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
  { key: 'bellmanFord', name: 'Bellman-Ford', timeComplexity: 'O(V·E)', spaceComplexity: 'O(V)', description: '负权最短路径' },
  { key: 'floydWarshall', name: 'Floyd-Warshall', timeComplexity: 'O(V³)', spaceComplexity: 'O(V²)', description: '全源最短路径' },
  { key: 'prim', name: 'Prim', timeComplexity: 'O(V²)', spaceComplexity: 'O(V)', description: '最小生成树（稠密图）' },
  { key: 'kruskal', name: 'Kruskal', timeComplexity: 'O(E log E)', spaceComplexity: 'O(V)', description: '最小生成树（稀疏图）' },
]
