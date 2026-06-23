import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const graphConfig: LearningModeConfig = {
  algorithmKey: 'graph',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.graph.steps.structure.title'),
      description: tStatic('learningSteps.graph.steps.structure.description'),
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
      highlightTerms: tStatic('learningSteps.graph.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.graph.steps.structure.complexityTime'), space: tStatic('learningSteps.graph.steps.structure.complexitySpace') },
    },
    {
      id: 'add-node',
      title: tStatic('learningSteps.graph.steps.add-node.title'),
      description: tStatic('learningSteps.graph.steps.add-node.description'),
      codeSnippet: `function addVertex(graph, id) {
  graph.nodes.push({ id, label: id })
  graph.adjacency[id] = []
  // 新顶点暂无边连接
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.graph.steps.add-node.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.add-node.tips').split('|'),
    },
    {
      id: 'add-edge',
      title: tStatic('learningSteps.graph.steps.add-edge.title'),
      description: tStatic('learningSteps.graph.steps.add-edge.description'),
      codeSnippet: `function addEdge(graph, from, to, weight) {
  graph.adjacency[from].push({ node: to, weight })
  // 无向图还需:
  graph.adjacency[to].push({ node: from, weight })
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.graph.steps.add-edge.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.add-edge.tips').split('|'),
    },
    {
      id: 'delete-node',
      title: tStatic('learningSteps.graph.steps.delete-node.title'),
      description: tStatic('learningSteps.graph.steps.delete-node.description'),
      codeSnippet: `function deleteNode(graph, id) {
  graph.nodes = graph.nodes.filter(n => n.id !== id)
  delete graph.adjacency[id]
  // 清理其他顶点邻接表中指向该顶点的边
  for (const key in graph.adjacency) {
    graph.adjacency[key] = graph.adjacency[key]
      .filter(e => e.node !== id)
  }
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.graph.steps.delete-node.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.delete-node.tips').split('|'),
      complexity: { time: tStatic('learningSteps.graph.steps.delete-node.complexityTime'), space: tStatic('learningSteps.graph.steps.delete-node.complexitySpace') },
    },
    {
      id: 'delete-edge',
      title: tStatic('learningSteps.graph.steps.delete-edge.title'),
      description: tStatic('learningSteps.graph.steps.delete-edge.description'),
      codeSnippet: `function deleteEdge(graph, from, to) {
  graph.adjacency[from] = graph.adjacency[from]
    .filter(e => e.node !== to)
  // 无向图还需:
  graph.adjacency[to] = graph.adjacency[to]
    .filter(e => e.node !== from)
}`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.graph.steps.delete-edge.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.delete-edge.tips').split('|'),
      complexity: { time: tStatic('learningSteps.graph.steps.delete-edge.complexityTime'), space: tStatic('learningSteps.graph.steps.delete-edge.complexitySpace') },
    },
    {
      id: 'bfs',
      title: tStatic('learningSteps.graph.steps.bfs.title'),
      description: tStatic('learningSteps.graph.steps.bfs.description'),
      codeSnippet: `function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []
  while (queue.length) {
    const v = queue.shift()
    order.push(v)
    for (const n of graph.adjacency[v]) {
      if (!visited.has(n.node)) {
        visited.add(n.node)
        queue.push(n.node)
      }
    }
  }
  return order
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.graph.steps.bfs.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.bfs.tips').split('|'),
      complexity: { time: tStatic('learningSteps.graph.steps.bfs.complexityTime'), space: tStatic('learningSteps.graph.steps.bfs.complexitySpace') },
    },
    {
      id: 'dfs',
      title: tStatic('learningSteps.graph.steps.dfs.title'),
      description: tStatic('learningSteps.graph.steps.dfs.description'),
      codeSnippet: `function dfs(graph, v, visited = new Set()) {
  visited.add(v)
  for (const n of graph.adjacency[v]) {
    if (!visited.has(n.node)) {
      dfs(graph, n.node, visited)
    }
  }
  return visited
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.graph.steps.dfs.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.dfs.tips').split('|'),
      complexity: { time: tStatic('learningSteps.graph.steps.dfs.complexityTime'), space: tStatic('learningSteps.graph.steps.dfs.complexitySpace') },
    },
    {
      id: 'dijkstra',
      title: tStatic('learningSteps.graph.steps.dijkstra.title'),
      description: tStatic('learningSteps.graph.steps.dijkstra.description'),
      codeSnippet: `function dijkstra(graph, start) {
  const dist = {}
  for (const v of graph.nodes) dist[v.id] = Infinity
  dist[start] = 0
  const pq = [[0, start]]
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, v] = pq.shift()
    if (d > dist[v]) continue
    for (const n of graph.adjacency[v]) {
      const nd = d + n.weight
      if (nd < dist[n.node]) {
        dist[n.node] = nd
        pq.push([nd, n.node])
      }
    }
  }
  return dist
}`,
      highlightedLine: 10,
      highlightTerms: tStatic('learningSteps.graph.steps.dijkstra.highlightTerms').split('|'),
      tips: tStatic('learningSteps.graph.steps.dijkstra.tips').split('|'),
      complexity: { time: tStatic('learningSteps.graph.steps.dijkstra.complexityTime'), space: tStatic('learningSteps.graph.steps.dijkstra.complexitySpace') },
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: 'BFS 适合解决什么类型的图问题？',
      options: ['单源最短路径（无权图）', '负权最短路径', '最小生成树', '强连通分量'],
      correctIndex: 0,
      explanation: 'BFS 按层扩展，逐层增加路径长度，因此能保证找到无权图从源点到其他所有点的最短路径。',
    },
    {
      id: 'q2',
      question: 'DFS 与 BFS 的主要区别是？',
      options: ['DFS 用队列，BFS 用栈', 'DFS 用栈（或递归），BFS 用队列', 'DFS 只能处理有向图', 'BFS 只能处理无向图'],
      correctIndex: 1,
      explanation: 'DFS（深度优先）使用栈或递归实现"沿一条路径深入"；BFS（广度优先）使用队列实现"按层扩展"。',
    },
    {
      id: 'q3',
      question: 'Dijkstra 算法不能处理什么情况？',
      options: ['无权图', '负权边', '有向图', '稀疏图'],
      correctIndex: 1,
      explanation: 'Dijkstra 一旦确定某节点最短距离就不再更新，负权边可能导致"绕远反而更短"，需要 Bellman-Ford/SPFA 处理。',
    },
    {
      id: 'q4',
      question: '邻接表相对于邻接矩阵的主要优势是？',
      options: ['查询两节点是否有边更快', '节省空间，适合稀疏图', '实现更简单', '支持负权边'],
      correctIndex: 1,
      explanation: '邻接表 O(V+E) 空间，邻接矩阵 O(V²)。对于稀疏图（E << V²），邻接表节省大量空间。',
    },
    {
      id: 'q5',
      question: 'Prim 和 Kruskal 都是什么算法？',
      options: ['最短路径算法', '最小生成树算法', '拓扑排序算法', '强连通分量算法'],
      correctIndex: 1,
      explanation: 'Prim（加点法）和 Kruskal（加边法）都是构造最小生成树（MST）的经典贪心算法。',
    },
  ],
}
