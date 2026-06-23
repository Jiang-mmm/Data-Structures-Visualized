import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const bfsConfig: LearningModeConfig = {
  algorithmKey: 'bfs',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.bfs.steps.init.title'),
      description: tStatic('learningSteps.bfs.steps.init.description'),
      codeSnippet: `function bfs(graph, start) {
  const queue = [start]
  const visited = new Set([start])
  const result = []
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.bfs.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bfs.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bfs.steps.init.complexityTime'), space: tStatic('learningSteps.bfs.steps.init.complexitySpace') },
    },
    {
      id: 'dequeue',
      title: tStatic('learningSteps.bfs.steps.dequeue.title'),
      description: tStatic('learningSteps.bfs.steps.dequeue.description'),
      codeSnippet: `while (queue.length > 0) {
  const node = queue.shift()
  result.push(node)
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.bfs.steps.dequeue.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bfs.steps.dequeue.tips').split('|'),
    },
    {
      id: 'visit',
      title: tStatic('learningSteps.bfs.steps.visit.title'),
      description: tStatic('learningSteps.bfs.steps.visit.description'),
      codeSnippet: `  result.push(node)
  visited.add(node)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.bfs.steps.visit.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bfs.steps.visit.tips').split('|'),
    },
    {
      id: 'neighbors',
      title: tStatic('learningSteps.bfs.steps.neighbors.title'),
      description: tStatic('learningSteps.bfs.steps.neighbors.description'),
      codeSnippet: `  for (const neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor)
      queue.push(neighbor)
    }
  }`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.bfs.steps.neighbors.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bfs.steps.neighbors.tips').split('|'),
    },
  ],
}
