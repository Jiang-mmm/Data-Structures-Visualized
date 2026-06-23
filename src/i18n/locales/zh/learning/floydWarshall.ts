/**
 * v20 M7 — learning config "floydWarshall" 中文 locale（自动从 src/configs/learning/floydWarshall.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const floydWarshallLearningSteps = {
  steps: {
    "init": {
      title: '初始化距离矩阵',
      description: '构建 V×V 距离矩阵，对角线为 0，直接相连的边为权重，其余为无穷大',
      tips: 'Floyd-Warshall 计算所有节点对之间的最短路径|使用邻接矩阵表示图',
      highlightTerms: 'dist[i][i] = 0|Infinity',
      complexityTime: 'O(V³)',
      complexitySpace: 'O(V²)',
    },
    "relax": {
      title: '三重循环松弛',
      description: '以每个节点 k 为中转点，尝试通过 k 松弛所有节点对 (i, j) 的距离',
      tips: '核心状态转移方程: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])|k 必须在最外层循环',
      highlightTerms: 'dist[i][k] + dist[k][j]|dist[i][j]',
    },
    "complete": {
      title: '算法完成',
      description: 'dist 矩阵包含所有节点对之间的最短距离',
      tips: 'Floyd-Warshall 简洁但时间复杂度高，适合节点数较少的稠密图|也可以检测负权环：如果 dist[i][i] < 0 则存在负权环',
      highlightTerms: 'dist[i][j]',
      complexityTime: 'O(V³)',
      complexitySpace: 'O(V²)',
    },
  },
} as const
