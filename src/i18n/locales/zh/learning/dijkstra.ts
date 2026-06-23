/**
 * v20 M7 — learning config "dijkstra" 中文 locale（自动从 src/configs/learning/dijkstra.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const dijkstraLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '创建距离表，起始节点距离为 0，其余为无穷大。维护前驱节点表用于回溯路径',
      tips: '距离初始化为 Infinity 是为了方便后续比较，起始节点距离为 0',
      highlightTerms: 'distances[start] = 0|Infinity',
      complexityTime: 'O((V+E)log V)',
      complexitySpace: 'O(V)',
    },
    "select": {
      title: '选择最近节点',
      description: '从未访问节点中选择距离最小的节点，标记为已访问',
      tips: '使用优先队列（最小堆）可以将选择操作从 O(V) 优化到 O(log V)',
      highlightTerms: 'distances[n]|minDist|visited',
    },
    "relax": {
      title: '松弛操作',
      description: '遍历当前节点的所有邻居，计算经由当前节点到达邻居的距离，如果更短则更新',
      tips: '"松弛"是图算法的核心概念：尝试找到更短的路径来更新距离',
      highlightTerms: 'newDist|distances[neighbor]',
    },
    "path": {
      title: '回溯路径',
      description: '算法结束后，通过前驱节点表从终点回溯到起点，得到最短路径',
      tips: '路径回溯是从终点向起点反向追踪，使用 unshift 构建正序路径',
      highlightTerms: 'previous[current]|path',
    },
    "complete": {
      title: '算法完成',
      description: '所有节点处理完毕，distances 表包含从起点到每个节点的最短距离',
      tips: 'Dijkstra 不能处理负权边，负权图需要使用 Bellman-Ford 算法',
      highlightTerms: 'distances|previous',
      complexityTime: 'O((V+E)log V) 使用堆优化',
      complexitySpace: 'O(V+E)',
    },
  },
} as const
