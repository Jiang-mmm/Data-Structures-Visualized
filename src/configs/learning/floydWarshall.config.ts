import type { LearningModeConfig } from './types'

/**
 * Floyd-Warshall 算法学习配置
 */
export const floydWarshallConfig: LearningModeConfig = {
  algorithmKey: 'floydWarshall',
  steps: [
    {
      id: 'init',
      title: '初始化距离矩阵',
      description: '构建 V×V 距离矩阵，对角线为 0，直接相连的边为权重，其余为无穷大',
      codeSnippet: `function floydWarshall(graph) {
  const dist = Array(V).fill().map(() => Array(V).fill(Infinity))
  for (let i = 0; i < V; i++) dist[i][i] = 0
  for (const [u, v, w] of edges) dist[u][v] = w
}`,
      highlightedLine: 4,
      highlightTerms: ['dist[i][i] = 0', 'Infinity'],
      tips: ['Floyd-Warshall 计算所有节点对之间的最短路径', '使用邻接矩阵表示图'],
      complexity: { time: 'O(V³)', space: 'O(V²)' },
    },
    {
      id: 'relax',
      title: '三重循环松弛',
      description: '以每个节点 k 为中转点，尝试通过 k 松弛所有节点对 (i, j) 的距离',
      codeSnippet: `  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
        }
      }
    }
  }`,
      highlightedLine: 5,
      highlightTerms: ['dist[i][k] + dist[k][j]', 'dist[i][j]'],
      tips: ['核心状态转移方程: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])', 'k 必须在最外层循环'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: 'dist 矩阵包含所有节点对之间的最短距离',
      codeSnippet: `  // dist[i][j] = i 到 j 的最短距离
  // 例: dist[0][3] = 5 表示节点 0→3 最短距离为 5`,
      highlightedLine: 2,
      highlightTerms: ['dist[i][j]'],
      tips: ['Floyd-Warshall 简洁但时间复杂度高，适合节点数较少的稠密图', '也可以检测负权环：如果 dist[i][i] < 0 则存在负权环'],
      complexity: { time: 'O(V³)', space: 'O(V²)' },
    },
  ],
}
