import type { LearningModeConfig } from './types'

export const bfsConfig: LearningModeConfig = {
  algorithmKey: 'bfs',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '创建队列，将起始节点加入队列',
      codeSnippet: `function bfs(graph, start) {
  const queue = [start]
  const visited = new Set([start])
  const result = []
}`,
      highlightedLine: 2,
      highlightTerms: ['queue', 'start'],
      tips: ['BFS 使用队列（FIFO），DFS 使用栈（LIFO），这是两者最本质的区别'],
      complexity: { time: 'O(V+E)', space: 'O(V)' },
    },
    {
      id: 'dequeue',
      title: '出队',
      description: '从队列头部取出一个节点',
      codeSnippet: `while (queue.length > 0) {
  const node = queue.shift()
  result.push(node)
}`,
      highlightedLine: 2,
      highlightTerms: ['shift'],
      tips: ['BFS 天然按层遍历，第一次到达的路径就是最短路径（无权图）'],
    },
    {
      id: 'visit',
      title: '访问节点',
      description: '将当前节点标记为已访问',
      codeSnippet: `  result.push(node)
  visited.add(node)`,
      highlightedLine: 2,
      highlightTerms: ['visited', 'add'],
      tips: ['入队时就标记已访问，而不是出队时，可以避免重复入队'],
    },
    {
      id: 'neighbors',
      title: '遍历邻居',
      description: '将未访问的邻居节点加入队列',
      codeSnippet: `  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor)
      queue.push(neighbor)
    }
  }`,
      highlightedLine: 4,
      highlightTerms: ['push', 'queue'],
      tips: ['BFS 常用于：最短路径（无权图）、层序遍历、社交网络中找一度/二度好友'],
    },
  ],
}
