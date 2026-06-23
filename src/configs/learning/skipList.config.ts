import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const skipListConfig: LearningModeConfig = {
  algorithmKey: 'skipList',
  steps: [
    {
      id: 'intro',
      title: tStatic('learningSteps.skipList.steps.intro.title'),
      description: tStatic('learningSteps.skipList.steps.intro.description'),
      codeSnippet: `class SkipList {
  constructor() {
    this.head = new Node(-Infinity, MAX_LEVEL)
    this.level = 1
  }
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.skipList.steps.intro.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.intro.tips').split('|'),
      complexity: { time: tStatic('learningSteps.skipList.steps.intro.complexityTime'), space: tStatic('learningSteps.skipList.steps.intro.complexitySpace') },
    },
    {
      id: 'structure',
      title: tStatic('learningSteps.skipList.steps.structure.title'),
      description: tStatic('learningSteps.skipList.steps.structure.description'),
      codeSnippet: `// 第 0 层（最底层）：H -> 10 -> 20 -> 30 -> 40 -> 50
// 第 1 层：         H -> 10 ------> 30 ------> 50
// 第 2 层：         H ------> 30 -----------> 50`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.skipList.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.structure.tips').split('|'),
    },
    {
      id: 'randomLevel',
      title: tStatic('learningSteps.skipList.steps.randomLevel.title'),
      description: tStatic('learningSteps.skipList.steps.randomLevel.description'),
      codeSnippet: `function randomLevel() {
  let level = 1
  while (level < MAX_LEVEL && Math.random() < P) {
    level++
  }
  return level
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.skipList.steps.randomLevel.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.randomLevel.tips').split('|'),
      complexity: { time: tStatic('learningSteps.skipList.steps.randomLevel.complexityTime'), space: tStatic('learningSteps.skipList.steps.randomLevel.complexitySpace') },
    },
    {
      id: 'search',
      title: tStatic('learningSteps.skipList.steps.search.title'),
      description: tStatic('learningSteps.skipList.steps.search.description'),
      codeSnippet: `function search(value) {
  let current = head
  for (let i = level - 1; i >= 0; i--) {
    while (current.forward[i] && current.forward[i].value < value) {
      current = current.forward[i]
    }
  }
  current = current.forward[0]
  return current && current.value === value
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.skipList.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.search.tips').split('|'),
      complexity: { time: tStatic('learningSteps.skipList.steps.search.complexityTime'), space: tStatic('learningSteps.skipList.steps.search.complexitySpace') },
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.skipList.steps.insert.title'),
      description: tStatic('learningSteps.skipList.steps.insert.description'),
      codeSnippet: `function insert(value) {
  const update = new Array(MAX_LEVEL)
  let current = head
  for (let i = level - 1; i >= 0; i--) {
    while (current.forward[i] && current.forward[i].value < value) {
      current = current.forward[i]
    }
    update[i] = current
  }
  const newNode = new Node(value, randomLevel())
  for (let i = 0; i < newNode.level; i++) {
    newNode.forward[i] = update[i].forward[i]
    update[i].forward[i] = newNode
  }
}`,
      highlightedLine: 10,
      highlightTerms: tStatic('learningSteps.skipList.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.insert.tips').split('|'),
      complexity: { time: tStatic('learningSteps.skipList.steps.insert.complexityTime'), space: tStatic('learningSteps.skipList.steps.insert.complexitySpace') },
    },
    {
      id: 'delete',
      title: tStatic('learningSteps.skipList.steps.delete.title'),
      description: tStatic('learningSteps.skipList.steps.delete.description'),
      codeSnippet: `function delete(value) {
  const update = new Array(MAX_LEVEL)
  let current = head
  for (let i = level - 1; i >= 0; i--) {
    while (current.forward[i] && current.forward[i].value < value) {
      current = current.forward[i]
    }
    update[i] = current
  }
  const target = current.forward[0]
  if (target && target.value === value) {
    for (let i = 0; i < level; i++) {
      if (update[i].forward[i] !== target) break
      update[i].forward[i] = target.forward[i]
    }
  }
}`,
      highlightedLine: 11,
      highlightTerms: tStatic('learningSteps.skipList.steps.delete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.delete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.skipList.steps.delete.complexityTime'), space: tStatic('learningSteps.skipList.steps.delete.complexitySpace') },
    },
    {
      id: 'complexity',
      title: tStatic('learningSteps.skipList.steps.complexity.title'),
      description: tStatic('learningSteps.skipList.steps.complexity.description'),
      codeSnippet: `// 期望复杂度（P = 0.5）：
// 查找：O(log n)
// 插入：O(log n)
// 删除：O(log n)
// 空间：O(n)（每个节点期望出现在 2 层）
//
// 最坏情况：O(n)（概率极低）`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.skipList.steps.complexity.highlightTerms').split('|'),
      tips: tStatic('learningSteps.skipList.steps.complexity.tips').split('|'),
    },
  ],
}
