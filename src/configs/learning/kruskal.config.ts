import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * Kruskal 算法学习配置
 */
export const kruskalConfig: LearningModeConfig = {
  algorithmKey: 'kruskal',
  steps: [
    {
      id: 'sort',
      title: tStatic('learningSteps.kruskal.steps.sort.title'),
      description: tStatic('learningSteps.kruskal.steps.sort.description'),
      codeSnippet: `function kruskal(graph) {
  const edges = graph.getAllEdges()
  edges.sort((a, b) => a.w - b.w)
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.kruskal.steps.sort.highlightTerms').split('|'),
      tips: tStatic('learningSteps.kruskal.steps.sort.tips').split('|'),
      complexity: { time: tStatic('learningSteps.kruskal.steps.sort.complexityTime'), space: tStatic('learningSteps.kruskal.steps.sort.complexitySpace') },
    },
    {
      id: 'union-find',
      title: tStatic('learningSteps.kruskal.steps.union-find.title'),
      description: tStatic('learningSteps.kruskal.steps.union-find.description'),
      codeSnippet: `  const uf = new UnionFind(nodes)
  // find(x): 查找 x 的根节点（带路径压缩）
  // union(a, b): 合并 a, b 所在集合，返回是否成功（不成环）`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.kruskal.steps.union-find.highlightTerms').split('|'),
      tips: tStatic('learningSteps.kruskal.steps.union-find.tips').split('|'),
    },
    {
      id: 'select',
      title: tStatic('learningSteps.kruskal.steps.select.title'),
      description: tStatic('learningSteps.kruskal.steps.select.description'),
      codeSnippet: `  const mst = []
  for (const edge of edges) {
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge)
      if (mst.length === V - 1) break
    }
  }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.kruskal.steps.select.highlightTerms').split('|'),
      tips: tStatic('learningSteps.kruskal.steps.select.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.kruskal.steps.complete.title'),
      description: tStatic('learningSteps.kruskal.steps.complete.description'),
      codeSnippet: `  // mst.length === V - 1
  // totalWeight = mst.reduce((s, e) => s + e.w, 0)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.kruskal.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.kruskal.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.kruskal.steps.complete.complexityTime'), space: tStatic('learningSteps.kruskal.steps.complete.complexitySpace') },
    },
  ],
}
