/**
 * v20 M7 — learning config "dfs" 中文 locale（自动从 src/configs/learning/dfs.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const dfsLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '创建栈，将起始节点压入栈',
      tips: 'DFS 也可以用递归实现，递归调用栈本质上就是一个栈结构',
      highlightTerms: 'stack|start',
      complexityTime: 'O(V+E)',
      complexitySpace: 'O(V)',
    },
    "pop": {
      title: '出栈',
      description: '从栈顶取出一个节点',
      tips: '出栈后先检查是否已访问，因为同一个节点可能被多次压入栈',
      highlightTerms: 'pop',
    },
    "visit": {
      title: '访问节点',
      description: '将当前节点标记为已访问并加入结果',
      tips: 'DFS 深度优先，会沿着一条路径走到底再回溯，适合检测环和拓扑排序',
      highlightTerms: 'visited|add',
    },
    "neighbors": {
      title: '遍历邻居',
      description: '将未访问的邻居节点压入栈',
      tips: 'DFS 常用于：连通分量检测、环检测、路径查找、迷宫求解、拓扑排序',
      highlightTerms: 'push|stack',
    },
  },
} as const
