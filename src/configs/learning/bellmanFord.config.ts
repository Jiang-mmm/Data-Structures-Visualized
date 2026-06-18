import type { LearningModeConfig } from './types'

/**
 * Bellman-Ford 算法学习配置
 */
export const bellmanFordConfig: LearningModeConfig = {
  algorithmKey: 'bellmanFord',
  steps: [
    {
      id: 'init',
      title: '初始化距离表',
      description: '所有节点距离设为无穷大，起始节点距离为 0。Bellman-Ford 与 Dijkstra 不同，可以处理负权边',
      codeSnippet: `function bellmanFord(graph, start) {
  const dist = {}
  for (const node of graph) dist[node] = Infinity
  dist[start] = 0
}`,
      highlightedLine: 4,
      highlightTerms: ['dist[start] = 0', 'Infinity'],
      tips: ['Infinity 表示尚未找到路径，起始节点距离为 0'],
      complexity: { time: 'O(V·E)', space: 'O(V)' },
    },
    {
      id: 'relax',
      title: '边松弛（V-1 轮）',
      description: '对所有边进行 V-1 轮松弛操作。每轮遍历所有边，尝试通过当前距离更新邻居的最短距离',
      codeSnippet: `  for (let i = 0; i < V - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
      }
    }
  }`,
      highlightedLine: 4,
      highlightTerms: ['dist[u] + w', 'dist[v]'],
      tips: ['V-1 轮是因为最短路径最多经过 V-1 条边', '如果某轮没有更新可以提前终止'],
    },
    {
      id: 'negative-cycle',
      title: '负权环检测',
      description: '第 V 轮如果仍能松弛，说明存在负权环——可以无限减小路径长度',
      codeSnippet: `  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) {
      return "存在负权环"
    }
  }`,
      highlightedLine: 3,
      highlightTerms: ['dist[u] + w < dist[v]', '负权环'],
      tips: ['负权环意味着可以无限绕圈减小距离，最短路径无定义', 'Dijkstra 无法检测负权环'],
      complexity: { time: 'O(V·E)', space: 'O(V)' },
    },
    {
      id: 'complete',
      title: '算法完成',
      description: 'dist 表包含从起点到每个节点的最短距离（若无负权环）',
      codeSnippet: `  // 结果: dist = { A: 0, B: -1, C: 2, D: -2 }
  // 支持负权边: B→C 权重为 -3`,
      highlightedLine: 2,
      highlightTerms: ['dist', '负权边'],
      tips: ['Bellman-Ford 牺牲速度换取了处理负权边的能力'],
    },
  ],
}
