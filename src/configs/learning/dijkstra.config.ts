import type { LearningModeConfig } from './types'

export const dijkstraConfig: LearningModeConfig = {
  algorithmKey: 'dijkstra',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '创建距离表，起始节点距离为 0，其余为无穷大。维护前驱节点表用于回溯路径',
      codeSnippet: `function dijkstra(graph, start) {
  const distances = {}
  for (const node of graph) distances[node] = Infinity
  distances[start] = 0
  const previous = {}
  const visited = new Set()
}`,
      highlightedLine: 4,
      highlightTerms: ['distances[start] = 0', 'Infinity'],
      tips: ['距离初始化为 Infinity 是为了方便后续比较，起始节点距离为 0'],
      complexity: { time: 'O((V+E)log V)', space: 'O(V)' },
    },
    {
      id: 'select',
      title: '选择最近节点',
      description: '从未访问节点中选择距离最小的节点，标记为已访问',
      codeSnippet: `  while (visited.size < Object.keys(graph).length) {
    let node = null
    let minDist = Infinity
    for (const n in distances) {
      if (!visited.has(n) && distances[n] < minDist) {
        minDist = distances[n]
        node = n
      }
    }
    if (node === null) break
    visited.add(node)
  }`,
      highlightedLine: 5,
      highlightTerms: ['distances[n]', 'minDist', 'visited'],
      tips: ['使用优先队列（最小堆）可以将选择操作从 O(V) 优化到 O(log V)'],
    },
    {
      id: 'relax',
      title: '松弛操作',
      description: '遍历当前节点的所有邻居，计算经由当前节点到达邻居的距离，如果更短则更新',
      codeSnippet: `    for (const [neighbor, weight] of graph[node]) {
      const newDist = distances[node] + weight
      if (newDist < (distances[neighbor] ?? Infinity)) {
        distances[neighbor] = newDist
        previous[neighbor] = node
      }
    }`,
      highlightedLine: 3,
      highlightTerms: ['newDist', 'distances[neighbor]'],
      tips: ['"松弛"是图算法的核心概念：尝试找到更短的路径来更新距离'],
    },
    {
      id: 'path',
      title: '回溯路径',
      description: '算法结束后，通过前驱节点表从终点回溯到起点，得到最短路径',
      codeSnippet: `  function getPath(end) {
    const path = []
    let current = end
    while (current !== undefined) {
      path.unshift(current)
      current = previous[current]
    }
    return path[0] === start ? path : []
  }`,
      highlightedLine: 5,
      highlightTerms: ['previous[current]', 'path'],
      tips: ['路径回溯是从终点向起点反向追踪，使用 unshift 构建正序路径'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: '所有节点处理完毕，distances 表包含从起点到每个节点的最短距离',
      codeSnippet: `  // 最终结果
  // distances: { A: 0, B: 3, C: 5, D: 7 }
  // previous:  { B: A, C: B, D: C }
  // 路径 A→D: A → B → C → D`,
      highlightedLine: 2,
      highlightTerms: ['distances', 'previous'],
      tips: ['Dijkstra 不能处理负权边，负权图需要使用 Bellman-Ford 算法'],
      complexity: { time: 'O((V+E)log V) 使用堆优化', space: 'O(V+E)' },
    },
  ],
}
