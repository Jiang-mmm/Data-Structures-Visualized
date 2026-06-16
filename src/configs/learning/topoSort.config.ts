import type { LearningModeConfig } from './types'

export const topoSortConfig: LearningModeConfig = {
  algorithmKey: 'topoSort',
  steps: [
    {
      id: 'init',
      title: '计算入度',
      description: '遍历图中所有边，统计每个节点的入度（被指向的次数）',
      codeSnippet: `function topoSort(graph) {
  const inDegree = {}
  for (const node of graph) inDegree[node] = 0
  for (const node of graph) {
    for (const neighbor of graph[node]) {
      inDegree[neighbor]++
    }
  }
}`,
      highlightedLine: 6,
      highlightTerms: ['inDegree[neighbor]++'],
      tips: ['入度为 0 意味着该节点不依赖任何其他节点，可以最先执行'],
      complexity: { time: 'O(V+E)', space: 'O(V)' },
    },
    {
      id: 'queue',
      title: '入度为 0 入队',
      description: '将所有入度为 0 的节点加入队列，它们是拓扑排序的起始点',
      codeSnippet: `  const queue = []
  for (const node in inDegree) {
    if (inDegree[node] === 0) {
      queue.push(node)
    }
  }
  const result = []`,
      highlightedLine: 3,
      highlightTerms: ['inDegree[node] === 0', 'queue'],
      tips: ['如果有多个入度为 0 的节点，拓扑排序的结果不唯一'],
    },
    {
      id: 'process',
      title: '处理节点',
      description: '出队一个节点加入结果，然后将其所有邻居的入度减 1',
      codeSnippet: `  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node)
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--
      // 入度减为 0 则入队
    }
  }`,
      highlightedLine: 5,
      highlightTerms: ['inDegree[neighbor]--', 'result.push'],
      tips: ['出队即"移除"该节点，相当于从图中删除它和它的所有出边'],
    },
    {
      id: 'requeue',
      title: '新节点就绪',
      description: '当某节点的入度减为 0 时，说明它的所有前驱都已处理，可以入队',
      codeSnippet: `      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }`,
      highlightedLine: 2,
      highlightTerms: ['inDegree[neighbor] === 0', 'push'],
      tips: ['入度变为 0 是"所有依赖已满足"的信号，这是拓扑排序的核心思想'],
    },
    {
      id: 'cycle',
      title: '检测环与结果',
      description: '如果结果长度不等于节点数，说明图中存在环，无法完成拓扑排序',
      codeSnippet: `  if (result.length !== Object.keys(graph).length) {
    throw new Error('图中存在环，无法拓扑排序')
  }
  return result
  // 例: [A, B, C, D] 表示合法的执行顺序`,
      highlightedLine: 2,
      highlightTerms: ['result.length', '环'],
      tips: ['拓扑排序常用于：任务调度、课程安排、编译依赖、电子表格公式计算'],
      complexity: { time: 'O(V+E)', space: 'O(V)' },
    },
  ],
}
