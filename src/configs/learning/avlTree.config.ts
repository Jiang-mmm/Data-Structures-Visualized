import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const avlTreeConfig: LearningModeConfig = {
  algorithmKey: 'avlTree',
  steps: [
    {
      id: 'concept',
      title: tStatic('learningSteps.avlTree.steps.concept.title'),
      description: tStatic('learningSteps.avlTree.steps.concept.description'),
      codeSnippet: `class AvlNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
    this.height = 1
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.avlTree.steps.concept.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.concept.tips').split('|'),
      complexity: { time: tStatic('learningSteps.avlTree.steps.concept.complexityTime'), space: tStatic('learningSteps.avlTree.steps.concept.complexitySpace') },
    },
    {
      id: 'height-balance',
      title: tStatic('learningSteps.avlTree.steps.height-balance.title'),
      description: tStatic('learningSteps.avlTree.steps.height-balance.description'),
      codeSnippet: `function getHeight(node) {
  return node ? node.height : 0
}

function getBalanceFactor(node) {
  if (!node) return 0
  return getHeight(node.left) - getHeight(node.right)
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.avlTree.steps.height-balance.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.height-balance.tips').split('|'),
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.avlTree.steps.insert.title'),
      description: tStatic('learningSteps.avlTree.steps.insert.description'),
      codeSnippet: `function insert(node, value) {
  if (!node) return new AvlNode(value)
  if (value < node.value)
    node.left = insert(node.left, value)
  else if (value > node.value)
    node.right = insert(node.right, value)
  else
    return node  // 不允许重复

  node.height = 1 + max(getHeight(node.left), getHeight(node.right))
  return rebalance(node)
}`,
      highlightedLine: 9,
      highlightTerms: tStatic('learningSteps.avlTree.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.insert.tips').split('|'),
    },
    {
      id: 'rotations',
      title: tStatic('learningSteps.avlTree.steps.rotations.title'),
      description: tStatic('learningSteps.avlTree.steps.rotations.description'),
      codeSnippet: `// LL 型：右旋
function rotateRight(y) {
  const x = y.left
  const T2 = x.right
  x.right = y
  y.left = T2
  y.height = 1 + max(getHeight(y.left), getHeight(y.right))
  x.height = 1 + max(getHeight(x.left), getHeight(x.right))
  return x
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.avlTree.steps.rotations.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.rotations.tips').split('|'),
    },
    {
      id: 'rebalance',
      title: tStatic('learningSteps.avlTree.steps.rebalance.title'),
      description: tStatic('learningSteps.avlTree.steps.rebalance.description'),
      codeSnippet: `function rebalance(node) {
  const bf = getBalanceFactor(node)
  // LL 型
  if (bf > 1 && getBalanceFactor(node.left) >= 0)
    return rotateRight(node)
  // LR 型
  if (bf > 1 && getBalanceFactor(node.left) < 0) {
    node.left = rotateLeft(node.left)
    return rotateRight(node)
  }
  // RR 型
  if (bf < -1 && getBalanceFactor(node.right) <= 0)
    return rotateLeft(node)
  // RL 型
  if (bf < -1 && getBalanceFactor(node.right) > 0) {
    node.right = rotateRight(node.right)
    return rotateLeft(node)
  }
  return node
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.avlTree.steps.rebalance.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.rebalance.tips').split('|'),
    },
    {
      id: 'delete',
      title: tStatic('learningSteps.avlTree.steps.delete.title'),
      description: tStatic('learningSteps.avlTree.steps.delete.description'),
      codeSnippet: `function deleteNode(node, value) {
  if (!node) return null
  if (value < node.value)
    node.left = deleteNode(node.left, value)
  else if (value > node.value)
    node.right = deleteNode(node.right, value)
  else {
    if (!node.left) return node.right
    if (!node.right) return node.left
    const successor = findMin(node.right)
    node.value = successor.value
    node.right = deleteNode(node.right, successor.value)
  }
  node.height = 1 + max(getHeight(node.left), getHeight(node.right))
  return rebalance(node)
}`,
      highlightedLine: 9,
      highlightTerms: tStatic('learningSteps.avlTree.steps.delete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.delete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.avlTree.steps.delete.complexityTime'), space: tStatic('learningSteps.avlTree.steps.delete.complexitySpace') },
    },
    {
      id: 'complexity',
      title: tStatic('learningSteps.avlTree.steps.complexity.title'),
      description: tStatic('learningSteps.avlTree.steps.complexity.description'),
      codeSnippet: `// AVL 树高度上界
// h ≤ 1.44 * log2(n + 2) - 0.328
//
// 操作复杂度：
// 查找：O(log n)
// 插入：O(log n)（最多 1 次旋转）
// 删除：O(log n)（最多 O(log n) 次旋转）
// 空间：O(n)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.avlTree.steps.complexity.highlightTerms').split('|'),
      tips: tStatic('learningSteps.avlTree.steps.complexity.tips').split('|'),
    },
  ],
}
