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
      tips: ['稀疏图用邻接表 O(V+E)，稠密图用邻接矩阵 O(V²)，根据边密度选择'],
      complexity: { time: '取决于操作', space: '邻接表 O(V+E)，邻接矩阵 O(V²)' },
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
      tips: ['添加顶点后还需要添加边才能建立节点间的关系'],
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
      tips: ['有向图只需添加一条边，无向图需要添加两条方向相反的边'],
    },
    {
      id: 'delete-node',
      title: '删除顶点 Delete Node',
      description: '删除顶点及其所有关联边。需同时清理邻接表中所有指向该顶点的边。',
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
      highlightTerms: ['filter', 'deleteNode', 'adjacency'],
      tips: ['删除顶点必须同时清理所有关联边', '无向图删除顶点需双向清理邻接表'],
      complexity: { time: 'O(V + E)', space: 'O(1)' },
    },
    {
      id: 'delete-edge',
      title: '删除边 Delete Edge',
      description: '删除指定两个顶点之间的边。无向图需双向删除邻接表中的记录。',
      codeSnippet: `function deleteEdge(graph, from, to) {
  graph.adjacency[from] = graph.adjacency[from]
    .filter(e => e.node !== to)
  // 无向图还需:
  graph.adjacency[to] = graph.adjacency[to]
    .filter(e => e.node !== from)
}`,
      highlightedLine: 5,
      highlightTerms: ['filter', 'deleteEdge'],
      tips: ['有向图只需删除一条方向，无向图需双向删除', '删除不存在的边应静默处理或返回 false'],
      complexity: { time: 'O(E)，E 为顶点边数', space: 'O(1)' },
    },
    {
      id: 'bfs',
      title: '广度优先搜索 BFS',
      description: '使用队列逐层扩展，从起点出发按层访问所有可达顶点。适合无权图最短路径。',
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
      highlightTerms: ['queue', 'shift', 'visited'],
      tips: ['BFS 可求无权图最短路径', '使用队列（FIFO）保证按层顺序', '时间复杂度 O(V + E)'],
      complexity: { time: 'O(V + E)', space: 'O(V)' },
    },
    {
      id: 'dfs',
      title: '深度优先搜索 DFS',
      description: '使用栈或递归沿路径深入到底再回溯。适合连通性判断、拓扑排序、环检测。',
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
      highlightTerms: ['dfs', 'visited', '递归'],
      tips: ['DFS 可用于检测环、拓扑排序、求连通分量', '递归实现简洁但有栈溢出风险，大数据可用显式栈', '时间复杂度 O(V + E)'],
      complexity: { time: 'O(V + E)', space: 'O(V) 递归栈' },
    },
    {
      id: 'dijkstra',
      title: '最短路径 Dijkstra',
      description: '使用优先队列贪心扩展，求单源最短路径。处理带权图（非负权）的最短路径问题。',
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
      highlightTerms: ['dist', 'pq', 'weight'],
      tips: ['Dijkstra 不能处理负权边（需用 Bellman-Ford）', '优先队列优化后复杂度 O((V+E) log V)', '实际实现应使用二叉堆而非数组排序'],
      complexity: { time: 'O((V+E) log V)', space: 'O(V)' },
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
