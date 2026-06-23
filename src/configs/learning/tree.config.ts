import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const treeConfig: LearningModeConfig = {
  algorithmKey: 'tree',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.tree.steps.init.title'),
      description: tStatic('learningSteps.tree.steps.init.description'),
      codeSnippet: `class TreeNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.tree.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tree.steps.init.complexityTime'), space: tStatic('learningSteps.tree.steps.init.complexitySpace') },
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.tree.steps.insert.title'),
      description: tStatic('learningSteps.tree.steps.insert.description'),
      codeSnippet: `function insert(node, value) {
  if (!node) return new TreeNode(value)
  if (value < node.value)
    node.left = insert(node.left, value)
  else
    node.right = insert(node.right, value)
  return node
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.tree.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.insert.tips').split('|'),
    },
    {
      id: 'traversal',
      title: tStatic('learningSteps.tree.steps.traversal.title'),
      description: tStatic('learningSteps.tree.steps.traversal.description'),
      codeSnippet: `function inorder(node) {
  if (!node) return
  inorder(node.left)    // 先遍历左子树
  visit(node)           // 访问根节点
  inorder(node.right)   // 再遍历右子树
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.tree.steps.traversal.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.traversal.tips').split('|'),
    },
    {
      id: 'preorder',
      title: tStatic('learningSteps.tree.steps.preorder.title'),
      description: tStatic('learningSteps.tree.steps.preorder.description'),
      codeSnippet: `function preorder(node) {
  if (!node) return
  visit(node)            // 先访问根
  preorder(node.left)    // 再遍历左子树
  preorder(node.right)   // 最后遍历右子树
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.tree.steps.preorder.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.preorder.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tree.steps.preorder.complexityTime'), space: tStatic('learningSteps.tree.steps.preorder.complexitySpace') },
    },
    {
      id: 'inorder',
      title: tStatic('learningSteps.tree.steps.inorder.title'),
      description: tStatic('learningSteps.tree.steps.inorder.description'),
      codeSnippet: `function inorder(node) {
  if (!node) return
  inorder(node.left)     // 先遍历左子树
  visit(node)            // 再访问根
  inorder(node.right)    // 最后遍历右子树
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.tree.steps.inorder.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.inorder.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tree.steps.inorder.complexityTime'), space: tStatic('learningSteps.tree.steps.inorder.complexitySpace') },
    },
    {
      id: 'postorder',
      title: tStatic('learningSteps.tree.steps.postorder.title'),
      description: tStatic('learningSteps.tree.steps.postorder.description'),
      codeSnippet: `function postorder(node) {
  if (!node) return
  postorder(node.left)   // 先遍历左子树
  postorder(node.right)  // 再遍历右子树
  visit(node)            // 最后访问根
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.tree.steps.postorder.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.postorder.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tree.steps.postorder.complexityTime'), space: tStatic('learningSteps.tree.steps.postorder.complexitySpace') },
    },
    {
      id: 'levelorder',
      title: tStatic('learningSteps.tree.steps.levelorder.title'),
      description: tStatic('learningSteps.tree.steps.levelorder.description'),
      codeSnippet: `function levelorder(root) {
  if (!root) return
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    visit(node)
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
}`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.tree.steps.levelorder.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.levelorder.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tree.steps.levelorder.complexityTime'), space: tStatic('learningSteps.tree.steps.levelorder.complexitySpace') },
    },
    {
      id: 'search',
      title: tStatic('learningSteps.tree.steps.search.title'),
      description: tStatic('learningSteps.tree.steps.search.description'),
      codeSnippet: `function search(node, value) {
  if (!node || node.value === value)
    return node
  if (value < node.value)
    return search(node.left, value)
  return search(node.right, value)
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.tree.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.search.tips').split('|'),
    },
    {
      id: 'delete',
      title: tStatic('learningSteps.tree.steps.delete.title'),
      description: tStatic('learningSteps.tree.steps.delete.description'),
      codeSnippet: `function deleteNode(node, value) {
  if (!node) return null
  if (value < node.value)
    node.left = deleteNode(node.left, value)
  else if (value > node.value)
    node.right = deleteNode(node.right, value)
  else {
    // 双子节点：用中序后继替换
    if (node.left && node.right) {
      const succ = findMin(node.right)
      node.value = succ.value
      node.right = deleteNode(node.right, succ.value)
    } else {
      node = node.left || node.right
    }
  }
  return node
}`,
      highlightedLine: 9,
      highlightTerms: tStatic('learningSteps.tree.steps.delete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tree.steps.delete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tree.steps.delete.complexityTime'), space: tStatic('learningSteps.tree.steps.delete.complexitySpace') },
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: '二叉搜索树（BST）的中序遍历结果有什么特点？',
      options: ['降序排列', '升序排列', '随机排列', '按插入顺序'],
      correctIndex: 1,
      explanation: 'BST 的中序遍历（左→根→右）会得到升序排列的节点值，这是 BST 的核心性质之一。',
    },
    {
      id: 'q2',
      question: '在平衡 BST 中查找一个元素的平均时间复杂度是？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 1,
      explanation: '平衡 BST 的高度约为 log n，因此查找操作的平均和最坏时间复杂度均为 O(log n)。',
    },
    {
      id: 'q3',
      question: 'BST 删除节点时，若节点有两个子节点，通常用什么策略？',
      options: ['直接删除并断开子树', '用中序后继（右子树最小值）替换', '用左子节点替换', '标记为已删除但不移除'],
      correctIndex: 1,
      explanation: '双子节点删除常用中序后继（右子树的最小值）替换被删节点，保持 BST 性质不变。也可用中序前驱（左子树最大值）。',
    },
    {
      id: 'q4',
      question: 'BST 退化为链表时（按升序插入），查找时间复杂度会变成？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      explanation: 'BST 退化为链表后，每个节点只有右子节点，树高等于 n，查找退化为 O(n)。这正是 AVL/红黑树等平衡树要解决的问题。',
    },
    {
      id: 'q5',
      question: '层序遍历（BFS）通常使用什么数据结构辅助？',
      options: ['栈', '队列', '哈希表', '堆'],
      correctIndex: 1,
      explanation: 'BFS 按层访问节点，使用队列（FIFO）保证"先入先出"特性，符合按层扩展的访问顺序。',
    },
    {
      id: 'q6',
      question: '前序遍历（preorder）的访问顺序是？',
      options: ['左→根→右', '根→左→右', '左→右→根', '按层从左到右'],
      correctIndex: 1,
      explanation: '前序遍历顺序是"根→左→右"，常用于树的复制与序列化（前序的第一个节点就是根）。',
    },
  ],
}
