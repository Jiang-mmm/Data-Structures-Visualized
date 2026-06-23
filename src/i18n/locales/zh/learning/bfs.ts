/**
 * v20 M7 — learning config "bfs" 中文 locale（自动从 src/configs/learning/bfs.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const bfsLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '创建队列，将起始节点加入队列',
      tips: 'BFS 使用队列（FIFO），DFS 使用栈（LIFO），这是两者最本质的区别',
      highlightTerms: 'queue|start',
      complexityTime: 'O(V+E)',
      complexitySpace: 'O(V)',
    },
    "dequeue": {
      title: '出队',
      description: '从队列头部取出一个节点',
      tips: 'BFS 天然按层遍历，第一次到达的路径就是最短路径（无权图）',
      highlightTerms: 'shift',
    },
    "visit": {
      title: '访问节点',
      description: '将当前节点标记为已访问',
      tips: '入队时就标记已访问，而不是出队时，可以避免重复入队',
      highlightTerms: 'visited|add',
    },
    "neighbors": {
      title: '遍历邻居',
      description: '将未访问的邻居节点加入队列',
      tips: 'BFS 常用于：最短路径（无权图）、层序遍历、社交网络中找一度/二度好友',
      highlightTerms: 'push|queue',
    },
  },
} as const
