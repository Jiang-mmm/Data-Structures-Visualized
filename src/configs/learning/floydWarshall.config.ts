import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * Floyd-Warshall 算法学习配置
 */
export const floydWarshallConfig: LearningModeConfig = {
  algorithmKey: 'floydWarshall',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.floydWarshall.steps.init.title'),
      description: tStatic('learningSteps.floydWarshall.steps.init.description'),
      codeSnippet: `function floydWarshall(graph) {
  const dist = Array(V).fill().map(() => Array(V).fill(Infinity))
  for (let i = 0; i < V; i++) dist[i][i] = 0
  for (const [u, v, w] of edges) dist[u][v] = w
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.floydWarshall.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.floydWarshall.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.floydWarshall.steps.init.complexityTime'), space: tStatic('learningSteps.floydWarshall.steps.init.complexitySpace') },
    },
    {
      id: 'relax',
      title: tStatic('learningSteps.floydWarshall.steps.relax.title'),
      description: tStatic('learningSteps.floydWarshall.steps.relax.description'),
      codeSnippet: `  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
        }
      }
    }
  }`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.floydWarshall.steps.relax.highlightTerms').split('|'),
      tips: tStatic('learningSteps.floydWarshall.steps.relax.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.floydWarshall.steps.complete.title'),
      description: tStatic('learningSteps.floydWarshall.steps.complete.description'),
      codeSnippet: `  // dist[i][j] = i 到 j 的最短距离
  // 例: dist[0][3] = 5 表示节点 0→3 最短距离为 5`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.floydWarshall.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.floydWarshall.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.floydWarshall.steps.complete.complexityTime'), space: tStatic('learningSteps.floydWarshall.steps.complete.complexitySpace') },
    },
  ],
}
