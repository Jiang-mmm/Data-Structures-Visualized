import type { LearningModeConfig } from './types'

export const dijkstraConfig: LearningModeConfig = {
  algorithmKey: 'dijkstra',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '创建距离表，起始节点距离为 0',
      codeSnippet: `function dijkstra(graph, start) {
  const distances = { [start]: 0 }
  const previous = {}
  const visited = new Set()
}`,
      highlightedLine: 2,
      highlightTerms: ['distances', '0'],
    },
    {
      id: 'select',
      title: '选择节点',
      description: '选择距离最小的未访问节点',
      codeSnippet: `  const node = selectMinDistance(distances, visited)
  visited.add(node)`,
      highlightedLine: 1,
      highlightTerms: ['selectMinDistance'],
    },
    {
      id: 'update',
      title: '更新距离',
      description: '更新邻居节点的距离',
      codeSnippet: `  for (const [neighbor, weight] of graph[node]) {
    const newDist = distances[node] + weight
    if (newDist < (distances[neighbor] ?? Infinity)) {
      distances[neighbor] = newDist
      previous[neighbor] = node
    }
  }`,
      highlightedLine: 4,
      highlightTerms: ['distances', 'newDist'],
    },
  ],
}
