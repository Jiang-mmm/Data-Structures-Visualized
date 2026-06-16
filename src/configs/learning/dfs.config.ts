import type { LearningModeConfig } from './types'

export const dfsConfig: LearningModeConfig = {
  algorithmKey: 'dfs',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '创建栈，将起始节点压入栈',
      codeSnippet: `function dfs(graph, start) {
  const stack = [start]
  const visited = new Set()
  const result = []
}`,
      highlightedLine: 2,
      highlightTerms: ['stack', 'start'],
      tips: ['DFS 也可以用递归实现，递归调用栈本质上就是一个栈结构'],
      complexity: { time: 'O(V+E)', space: 'O(V)' },
    },
    {
      id: 'pop',
      title: '出栈',
      description: '从栈顶取出一个节点',
      codeSnippet: `while (stack.length > 0) {
  const node = stack.pop()
  if (visited.has(node)) continue
  visited.add(node)
  result.push(node)
}`,
      highlightedLine: 2,
      highlightTerms: ['pop'],
      tips: ['出栈后先检查是否已访问，因为同一个节点可能被多次压入栈'],
    },
    {
      id: 'visit',
      title: '访问节点',
      description: '将当前节点标记为已访问并加入结果',
      codeSnippet: `  visited.add(node)
  result.push(node)`,
      highlightedLine: 1,
      highlightTerms: ['visited', 'add'],
      tips: ['DFS 深度优先，会沿着一条路径走到底再回溯，适合检测环和拓扑排序'],
    },
    {
      id: 'neighbors',
      title: '遍历邻居',
      description: '将未访问的邻居节点压入栈',
      codeSnippet: `  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      stack.push(neighbor)
    }
  }`,
      highlightedLine: 3,
      highlightTerms: ['push', 'stack'],
      tips: ['DFS 常用于：连通分量检测、环检测、路径查找、迷宫求解、拓扑排序'],
    },
  ],
}
