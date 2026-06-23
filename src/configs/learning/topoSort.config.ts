import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const topoSortConfig: LearningModeConfig = {
  algorithmKey: 'topoSort',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.topoSort.steps.init.title'),
      description: tStatic('learningSteps.topoSort.steps.init.description'),
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
      highlightTerms: tStatic('learningSteps.topoSort.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.topoSort.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.topoSort.steps.init.complexityTime'), space: tStatic('learningSteps.topoSort.steps.init.complexitySpace') },
    },
    {
      id: 'queue',
      title: tStatic('learningSteps.topoSort.steps.queue.title'),
      description: tStatic('learningSteps.topoSort.steps.queue.description'),
      codeSnippet: `  const queue = []
  for (const node in inDegree) {
    if (inDegree[node] === 0) {
      queue.push(node)
    }
  }
  const result = []`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.topoSort.steps.queue.highlightTerms').split('|'),
      tips: tStatic('learningSteps.topoSort.steps.queue.tips').split('|'),
    },
    {
      id: 'process',
      title: tStatic('learningSteps.topoSort.steps.process.title'),
      description: tStatic('learningSteps.topoSort.steps.process.description'),
      codeSnippet: `  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node)
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--
      // 入度减为 0 则入队
    }
  }`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.topoSort.steps.process.highlightTerms').split('|'),
      tips: tStatic('learningSteps.topoSort.steps.process.tips').split('|'),
    },
    {
      id: 'requeue',
      title: tStatic('learningSteps.topoSort.steps.requeue.title'),
      description: tStatic('learningSteps.topoSort.steps.requeue.description'),
      codeSnippet: `      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.topoSort.steps.requeue.highlightTerms').split('|'),
      tips: tStatic('learningSteps.topoSort.steps.requeue.tips').split('|'),
    },
    {
      id: 'cycle',
      title: tStatic('learningSteps.topoSort.steps.cycle.title'),
      description: tStatic('learningSteps.topoSort.steps.cycle.description'),
      codeSnippet: `  if (result.length !== Object.keys(graph).length) {
    throw new Error('图中存在环，无法拓扑排序')
  }
  return result
  // 例: [A, B, C, D] 表示合法的执行顺序`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.topoSort.steps.cycle.highlightTerms').split('|'),
      tips: tStatic('learningSteps.topoSort.steps.cycle.tips').split('|'),
      complexity: { time: tStatic('learningSteps.topoSort.steps.cycle.complexityTime'), space: tStatic('learningSteps.topoSort.steps.cycle.complexitySpace') },
    },
  ],
}
