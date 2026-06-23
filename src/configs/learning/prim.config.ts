import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * Prim 算法学习配置
 */
export const primConfig: LearningModeConfig = {
  algorithmKey: 'prim',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.prim.steps.init.title'),
      description: tStatic('learningSteps.prim.steps.init.description'),
      codeSnippet: `function prim(graph, start) {
  const inMST = new Set([start])
  const mst = []
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.prim.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.prim.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.prim.steps.init.complexityTime'), space: tStatic('learningSteps.prim.steps.init.complexitySpace') },
    },
    {
      id: 'select',
      title: tStatic('learningSteps.prim.steps.select.title'),
      description: tStatic('learningSteps.prim.steps.select.description'),
      codeSnippet: `  while (inMST.size < V) {
    let minEdge = null
    for (const u of inMST) {
      for (const [v, w] of graph[u]) {
        if (!inMST.has(v) && (!minEdge || w < minEdge.w)) {
          minEdge = { u, v, w }
        }
      }
    }`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.prim.steps.select.highlightTerms').split('|'),
      tips: tStatic('learningSteps.prim.steps.select.tips').split('|'),
    },
    {
      id: 'add',
      title: tStatic('learningSteps.prim.steps.add.title'),
      description: tStatic('learningSteps.prim.steps.add.description'),
      codeSnippet: `    if (minEdge) {
      inMST.add(minEdge.v)
      mst.push(minEdge)
    } else {
      break // 图不连通
    }
  }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.prim.steps.add.highlightTerms').split('|'),
      tips: tStatic('learningSteps.prim.steps.add.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.prim.steps.complete.title'),
      description: tStatic('learningSteps.prim.steps.complete.description'),
      codeSnippet: `  // mst 包含 V-1 条边
  // totalWeight = mst.reduce((s, e) => s + e.w, 0)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.prim.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.prim.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.prim.steps.complete.complexityTime'), space: tStatic('learningSteps.prim.steps.complete.complexitySpace') },
    },
  ],
}
