import type { LearningModeConfig } from './types'

export const graphConfig: LearningModeConfig = {
  algorithmKey: 'graph',
  steps: [
    {
      id: 'structure',
      title: '图结构',
      description: '图由顶点（节点）和边组成，边可以有方向和权重，常用邻接矩阵或邻接表存储',
      codeSnippet: `// 图：顶点 + 边
//    A ──3── B
//    │╲      │
//    1  2    4
//    │   ╲   │
//    C──5── D
//
// 邻接表:
// A → [(B,3), (C,1), (D,2)]
// B → [(A,3), (D,4)]
// C → [(A,1), (D,5)]
// D → [(A,2), (B,4), (C,5)]`,
      highlightedLine: 2,
      highlightTerms: ['顶点', '边', '邻接表'],
    },
    {
      id: 'add-node',
      title: '添加顶点',
      description: '在图中新增一个顶点，初始化其邻接关系为空',
      codeSnippet: `function addVertex(graph, id) {
  graph.nodes.push({ id, label: id })
  graph.adjacency[id] = []
  // 新顶点暂无边连接
}`,
      highlightedLine: 3,
      highlightTerms: ['adjacency', 'push'],
    },
    {
      id: 'add-edge',
      title: '添加边',
      description: '在两个顶点之间建立连接，可指定权重，无向图需双向添加',
      codeSnippet: `function addEdge(graph, from, to, weight) {
  graph.adjacency[from].push({ node: to, weight })
  // 无向图还需:
  graph.adjacency[to].push({ node: from, weight })
}`,
      highlightedLine: 2,
      highlightTerms: ['adjacency[from]', 'weight'],
    },
    {
      id: 'traversal',
      title: '图遍历',
      description: 'BFS 按层遍历（队列），DFS 沿路径深入（栈/递归），用于搜索和连通性检测',
      codeSnippet: `// BFS: 队列 + 已访问集合
// DFS: 栈/递归 + 已访问集合
//
// 从起点出发:
// BFS → 逐层扩展，适合最短路径
// DFS → 深度优先，适合连通分量
//
// 时间复杂度: O(V + E)`,
      highlightedLine: 5,
      highlightTerms: ['BFS', 'DFS', 'O(V + E)'],
    },
  ],
}
