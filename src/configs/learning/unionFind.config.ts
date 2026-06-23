import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const unionFindConfig: LearningModeConfig = {
  algorithmKey: 'unionFind',
  steps: [
    {
      id: 'intro',
      title: tStatic('learningSteps.unionFind.steps.intro.title'),
      description: tStatic('learningSteps.unionFind.steps.intro.description'),
      codeSnippet: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.unionFind.steps.intro.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.intro.tips').split('|'),
      complexity: { time: tStatic('learningSteps.unionFind.steps.intro.complexityTime'), space: tStatic('learningSteps.unionFind.steps.intro.complexitySpace') },
    },
    {
      id: 'makeSet',
      title: tStatic('learningSteps.unionFind.steps.makeSet.title'),
      description: tStatic('learningSteps.unionFind.steps.makeSet.description'),
      codeSnippet: `function makeSet(x) {
  parent[x] = x
  rank[x] = 0
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.unionFind.steps.makeSet.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.makeSet.tips').split('|'),
    },
    {
      id: 'find',
      title: tStatic('learningSteps.unionFind.steps.find.title'),
      description: tStatic('learningSteps.unionFind.steps.find.description'),
      codeSnippet: `function find(x) {
  if (parent[x] !== x) {
    parent[x] = find(parent[x])  // 路径压缩
  }
  return parent[x]
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.unionFind.steps.find.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.find.tips').split('|'),
      complexity: { time: tStatic('learningSteps.unionFind.steps.find.complexityTime'), space: tStatic('learningSteps.unionFind.steps.find.complexitySpace') },
    },
    {
      id: 'union',
      title: tStatic('learningSteps.unionFind.steps.union.title'),
      description: tStatic('learningSteps.unionFind.steps.union.description'),
      codeSnippet: `function union(x, y) {
  const rootX = find(x)
  const rootY = find(y)
  if (rootX === rootY) return
  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX
  } else {
    parent[rootY] = rootX
    rank[rootX]++
  }
}`,
      highlightedLine: 9,
      highlightTerms: tStatic('learningSteps.unionFind.steps.union.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.union.tips').split('|'),
      complexity: { time: tStatic('learningSteps.unionFind.steps.union.complexityTime'), space: tStatic('learningSteps.unionFind.steps.union.complexitySpace') },
    },
    {
      id: 'connected',
      title: tStatic('learningSteps.unionFind.steps.connected.title'),
      description: tStatic('learningSteps.unionFind.steps.connected.description'),
      codeSnippet: `function connected(x, y) {
  return find(x) === find(y)
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.unionFind.steps.connected.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.connected.tips').split('|'),
      complexity: { time: tStatic('learningSteps.unionFind.steps.connected.complexityTime'), space: tStatic('learningSteps.unionFind.steps.connected.complexitySpace') },
    },
    {
      id: 'components',
      title: tStatic('learningSteps.unionFind.steps.components.title'),
      description: tStatic('learningSteps.unionFind.steps.components.description'),
      codeSnippet: `function countComponents() {
  const roots = new Set()
  for (let i = 0; i < n; i++) {
    roots.add(find(i))
  }
  return roots.size
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.unionFind.steps.components.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.components.tips').split('|'),
      complexity: { time: tStatic('learningSteps.unionFind.steps.components.complexityTime'), space: tStatic('learningSteps.unionFind.steps.components.complexitySpace') },
    },
    {
      id: 'complexity',
      title: tStatic('learningSteps.unionFind.steps.complexity.title'),
      description: tStatic('learningSteps.unionFind.steps.complexity.description'),
      codeSnippet: `// 均摊复杂度（路径压缩 + 按秩合并）：
// find:    O(α(n)) ≈ O(1)
// union:   O(α(n)) ≈ O(1)
// connected: O(α(n)) ≈ O(1)
// 空间：O(n)
//
// α(n) < 5 对所有 n < 10^80 成立`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.unionFind.steps.complexity.highlightTerms').split('|'),
      tips: tStatic('learningSteps.unionFind.steps.complexity.tips').split('|'),
    },
  ],
}
