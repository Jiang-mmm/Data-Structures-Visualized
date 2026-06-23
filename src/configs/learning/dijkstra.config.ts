import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const dijkstraConfig: LearningModeConfig = {
  algorithmKey: 'dijkstra',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.dijkstra.steps.init.title'),
      description: tStatic('learningSteps.dijkstra.steps.init.description'),
      codeSnippet: `function dijkstra(graph, start) {
  const distances = {}
  for (const node of graph) distances[node] = Infinity
  distances[start] = 0
  const previous = {}
  const visited = new Set()
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.dijkstra.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dijkstra.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.dijkstra.steps.init.complexityTime'), space: tStatic('learningSteps.dijkstra.steps.init.complexitySpace') },
    },
    {
      id: 'select',
      title: tStatic('learningSteps.dijkstra.steps.select.title'),
      description: tStatic('learningSteps.dijkstra.steps.select.description'),
      codeSnippet: `  while (visited.size < Object.keys(graph).length) {
    let node = null
    let minDist = Infinity
    for (const n in distances) {
      if (!visited.has(n) && distances[n] < minDist) {
        minDist = distances[n]
        node = n
      }
    }
    if (node === null) break
    visited.add(node)
  }`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.dijkstra.steps.select.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dijkstra.steps.select.tips').split('|'),
    },
    {
      id: 'relax',
      title: tStatic('learningSteps.dijkstra.steps.relax.title'),
      description: tStatic('learningSteps.dijkstra.steps.relax.description'),
      codeSnippet: `    for (const [neighbor, weight] of graph[node]) {
      const newDist = distances[node] + weight
      if (newDist < (distances[neighbor] ?? Infinity)) {
        distances[neighbor] = newDist
        previous[neighbor] = node
      }
    }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.dijkstra.steps.relax.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dijkstra.steps.relax.tips').split('|'),
    },
    {
      id: 'path',
      title: tStatic('learningSteps.dijkstra.steps.path.title'),
      description: tStatic('learningSteps.dijkstra.steps.path.description'),
      codeSnippet: `  function getPath(end) {
    const path = []
    let current = end
    while (current !== undefined) {
      path.unshift(current)
      current = previous[current]
    }
    return path[0] === start ? path : []
  }`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.dijkstra.steps.path.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dijkstra.steps.path.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.dijkstra.steps.complete.title'),
      description: tStatic('learningSteps.dijkstra.steps.complete.description'),
      codeSnippet: `  // 最终结果
  // distances: { A: 0, B: 3, C: 5, D: 7 }
  // previous:  { B: A, C: B, D: C }
  // 路径 A→D: A → B → C → D`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.dijkstra.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.dijkstra.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.dijkstra.steps.complete.complexityTime'), space: tStatic('learningSteps.dijkstra.steps.complete.complexitySpace') },
    },
  ],
}
