import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const dfsConfig: LearningModeConfig = {
  algorithmKey: 'dfs',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.dfs.steps.init.title'),
      description: tStatic('learningSteps.dfs.steps.init.description'),
      codeSnippet: `function dfs(graph, start) {
  const stack = [start]
  const visited = new Set()
  const result = []
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.dfs.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dfs.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.dfs.steps.init.complexityTime'), space: tStatic('learningSteps.dfs.steps.init.complexitySpace') },
    },
    {
      id: 'pop',
      title: tStatic('learningSteps.dfs.steps.pop.title'),
      description: tStatic('learningSteps.dfs.steps.pop.description'),
      codeSnippet: `while (stack.length > 0) {
  const node = stack.pop()
  if (visited.has(node)) continue
  visited.add(node)
  result.push(node)
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.dfs.steps.pop.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dfs.steps.pop.tips').split('|'),
    },
    {
      id: 'visit',
      title: tStatic('learningSteps.dfs.steps.visit.title'),
      description: tStatic('learningSteps.dfs.steps.visit.description'),
      codeSnippet: `  visited.add(node)
  result.push(node)`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.dfs.steps.visit.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dfs.steps.visit.tips').split('|'),
    },
    {
      id: 'neighbors',
      title: tStatic('learningSteps.dfs.steps.neighbors.title'),
      description: tStatic('learningSteps.dfs.steps.neighbors.description'),
      codeSnippet: `  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      stack.push(neighbor)
    }
  }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.dfs.steps.neighbors.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dfs.steps.neighbors.tips').split('|'),
    },
  ],
}
