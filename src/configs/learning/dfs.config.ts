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
    },
    {
      id: 'visit',
      title: '访问节点',
      description: '将当前节点标记为已访问并加入结果',
      codeSnippet: `  visited.add(node)
  result.push(node)`,
      highlightedLine: 1,
      highlightTerms: ['visited', 'add'],
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
    },
  ],
}
