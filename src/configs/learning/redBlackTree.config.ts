import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const redBlackTreeConfig: LearningModeConfig = {
  algorithmKey: 'redBlackTree',
  steps: [
    {
      id: 'intro',
      title: tStatic('learningSteps.redBlackTree.steps.intro.title'),
      description: tStatic('learningSteps.redBlackTree.steps.intro.description'),
      codeSnippet: `class RBNode {
  constructor(value) {
    this.value = value
    this.color = 'red'  // 新节点默认红色
    this.left = null
    this.right = null
    this.parent = null
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.redBlackTree.steps.intro.highlightTerms').split('|'),
      tips: tStatic('learningSteps.redBlackTree.steps.intro.tips').split('|'),
      complexity: { time: tStatic('learningSteps.redBlackTree.steps.intro.complexityTime'), space: tStatic('learningSteps.redBlackTree.steps.intro.complexitySpace') },
    },
    {
      id: 'properties',
      title: tStatic('learningSteps.redBlackTree.steps.properties.title'),
      description: tStatic('learningSteps.redBlackTree.steps.properties.description'),
      codeSnippet: `// 红黑树五大性质：
// 1. 每个节点是红色或黑色
// 2. 根节点是黑色
// 3. 每个叶子节点（NIL）是黑色
// 4. 红色节点的子节点必须是黑色
//    （不能有连续两个红色节点）
// 5. 从任一节点到其所有后代叶子的路径
//    包含相同数量的黑色节点`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.redBlackTree.steps.properties.highlightTerms').split('|'),
      tips: tStatic('learningSteps.redBlackTree.steps.properties.tips').split('|'),
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.redBlackTree.steps.insert.title'),
      description: tStatic('learningSteps.redBlackTree.steps.insert.description'),
      codeSnippet: `function insert(root, value) {
  const newNode = new RBNode(value)  // 红色
  // 标准 BST 插入
  let parent = null
  let current = root
  while (current) {
    parent = current
    current = value < current.value
      ? current.left : current.right
  }
  newNode.parent = parent
  if (!parent) return newNode
  if (value < parent.value) parent.left = newNode
  else parent.right = newNode
  return fixInsert(root, newNode)
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.redBlackTree.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.redBlackTree.steps.insert.tips').split('|'),
      complexity: { time: tStatic('learningSteps.redBlackTree.steps.insert.complexityTime'), space: tStatic('learningSteps.redBlackTree.steps.insert.complexitySpace') },
    },
    {
      id: 'fixup',
      title: tStatic('learningSteps.redBlackTree.steps.fixup.title'),
      description: tStatic('learningSteps.redBlackTree.steps.fixup.description'),
      codeSnippet: `function fixInsert(root, z) {
  while (z.parent && z.parent.color === 'red') {
    const uncle = getUncle(z)
    if (uncle && uncle.color === 'red') {
      // 情况 1：叔节点为红色
      z.parent.color = 'black'
      uncle.color = 'black'
      z.parent.parent.color = 'red'
      z = z.parent.parent  // 上移两层
    } else {
      // 情况 2/3：叔节点为黑色，需旋转
      // 情况 2：z 是内侧孩子，先旋转变为情况 3
      // 情况 3：z 是外侧孩子，重染色 + 旋转祖父
    }
  }
  root.color = 'black'  // 保证性质 2
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.redBlackTree.steps.fixup.highlightTerms').split('|'),
      tips: tStatic('learningSteps.redBlackTree.steps.fixup.tips').split('|'),
      complexity: { time: tStatic('learningSteps.redBlackTree.steps.fixup.complexityTime'), space: tStatic('learningSteps.redBlackTree.steps.fixup.complexitySpace') },
    },
    {
      id: 'rotation',
      title: tStatic('learningSteps.redBlackTree.steps.rotation.title'),
      description: tStatic('learningSteps.redBlackTree.steps.rotation.description'),
      codeSnippet: `// 左旋（以 x 为支点）
//     x                y
//    / \\              / \\
//   T1  y      →     x   T3
//      / \\          / \\
//    T2  T3        T1  T2
function rotateLeft(root, x) {
  const y = x.right
  x.right = y.left
  if (y.left) y.left.parent = x
  y.parent = x.parent
  if (!x.parent) root = y
  else if (x === x.parent.left) x.parent.left = y
  else x.parent.right = y
  y.left = x
  x.parent = y
  return root
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.redBlackTree.steps.rotation.highlightTerms').split('|'),
      tips: tStatic('learningSteps.redBlackTree.steps.rotation.tips').split('|'),
    },
    {
      id: 'complexity',
      title: tStatic('learningSteps.redBlackTree.steps.complexity.title'),
      description: tStatic('learningSteps.redBlackTree.steps.complexity.description'),
      codeSnippet: `// 红黑树复杂度：
// 查找：O(log n)
// 插入：O(log n)，最多 2 次旋转
// 删除：O(log n)，最多 3 次旋转
// 空间：O(n)
//
// 树高上限：2 * log2(n + 1)
// 最长路径 / 最短路径 ≤ 2`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.redBlackTree.steps.complexity.highlightTerms').split('|'),
      tips: tStatic('learningSteps.redBlackTree.steps.complexity.tips').split('|'),
    },
  ],
}
