import type { LearningModeConfig } from './types'

export const topoSortConfig: LearningModeConfig = {
  algorithmKey: 'topoSort',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '计算所有节点的入度',
      codeSnippet: `function topoSort(graph) {
  const inDegree = {}
  for (const node of graph) {
    inDegree[node] = 0
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['inDegree'],
    },
    {
      id: 'queue',
      title: '入队',
      description: '将入度为 0 的节点加入队列',
      codeSnippet: `  const queue = Object.keys(inDegree)
    .filter(node => inDegree[node] === 0)`,
      highlightedLine: 1,
      highlightTerms: ['queue', 'filter'],
    },
    {
      id: 'process',
      title: '处理节点',
      description: '出队并减少邻居的入度',
      codeSnippet: `  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node)
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }`,
      highlightedLine: 5,
      highlightTerms: ['inDegree', '--'],
    },
  ],
}
