import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * Bellman-Ford 算法学习配置
 */
export const bellmanFordConfig: LearningModeConfig = {
  algorithmKey: 'bellmanFord',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.bellmanFord.steps.init.title'),
      description: tStatic('learningSteps.bellmanFord.steps.init.description'),
      codeSnippet: `function bellmanFord(graph, start) {
  const dist = {}
  for (const node of graph) dist[node] = Infinity
  dist[start] = 0
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.bellmanFord.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bellmanFord.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bellmanFord.steps.init.complexityTime'), space: tStatic('learningSteps.bellmanFord.steps.init.complexitySpace') },
    },
    {
      id: 'relax',
      title: tStatic('learningSteps.bellmanFord.steps.relax.title'),
      description: tStatic('learningSteps.bellmanFord.steps.relax.description'),
      codeSnippet: `  for (let i = 0; i < V - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
      }
    }
  }`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.bellmanFord.steps.relax.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bellmanFord.steps.relax.tips').split('|'),
    },
    {
      id: 'negative-cycle',
      title: tStatic('learningSteps.bellmanFord.steps.negative-cycle.title'),
      description: tStatic('learningSteps.bellmanFord.steps.negative-cycle.description'),
      codeSnippet: `  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) {
      return "存在负权环"
    }
  }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.bellmanFord.steps.negative-cycle.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bellmanFord.steps.negative-cycle.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bellmanFord.steps.negative-cycle.complexityTime'), space: tStatic('learningSteps.bellmanFord.steps.negative-cycle.complexitySpace') },
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.bellmanFord.steps.complete.title'),
      description: tStatic('learningSteps.bellmanFord.steps.complete.description'),
      codeSnippet: `  // 结果: dist = { A: 0, B: -1, C: 2, D: -2 }
  // 支持负权边: B→C 权重为 -3`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.bellmanFord.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bellmanFord.steps.complete.tips').split('|'),
    },
  ],
}
