/**
 * v20 M7 — learning config "topoSort" 中文 locale（自动从 src/configs/learning/topoSort.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const topoSortLearningSteps = {
  steps: {
    "init": {
      title: '计算入度',
      description: '遍历图中所有边，统计每个节点的入度（被指向的次数）',
      tips: '入度为 0 意味着该节点不依赖任何其他节点，可以最先执行',
      highlightTerms: 'inDegree[neighbor]++',
      complexityTime: 'O(V+E)',
      complexitySpace: 'O(V)',
    },
    "queue": {
      title: '入度为 0 入队',
      description: '将所有入度为 0 的节点加入队列，它们是拓扑排序的起始点',
      tips: '如果有多个入度为 0 的节点，拓扑排序的结果不唯一',
      highlightTerms: 'inDegree[node] === 0|queue',
    },
    "process": {
      title: '处理节点',
      description: '出队一个节点加入结果，然后将其所有邻居的入度减 1',
      tips: '出队即"移除"该节点，相当于从图中删除它和它的所有出边',
      highlightTerms: 'inDegree[neighbor]--|result.push',
    },
    "requeue": {
      title: '新节点就绪',
      description: '当某节点的入度减为 0 时，说明它的所有前驱都已处理，可以入队',
      tips: '入度变为 0 是"所有依赖已满足"的信号，这是拓扑排序的核心思想',
      highlightTerms: 'inDegree[neighbor] === 0|push',
    },
    "cycle": {
      title: '检测环与结果',
      description: '如果结果长度不等于节点数，说明图中存在环，无法完成拓扑排序',
      tips: '拓扑排序常用于：任务调度、课程安排、编译依赖、电子表格公式计算',
      highlightTerms: 'result.length|环',
      complexityTime: 'O(V+E)',
      complexitySpace: 'O(V)',
    },
  },
} as const
