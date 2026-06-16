import type { LearningModeConfig } from './types'

export const treeConfig: LearningModeConfig = {
  algorithmKey: 'tree',
  steps: [
    {
      id: 'init',
      title: '二叉树结构',
      description: '每个节点最多有两个子节点：左子节点和右子节点',
      codeSnippet: `class TreeNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['left', 'right'],
      tips: ['二叉搜索树（BST）的性质：左子树所有值 < 根 < 右子树所有值'],
      complexity: { time: '平均 O(log n)，最坏 O(n)', space: 'O(n)' },
    },
    {
      id: 'insert',
      title: '插入节点',
      description: '比较值大小，小于当前节点向左走，大于向右走，找到空位插入',
      codeSnippet: `function insert(node, value) {
  if (!node) return new TreeNode(value)
  if (value < node.value)
    node.left = insert(node.left, value)
  else
    node.right = insert(node.right, value)
  return node
}`,
      highlightedLine: 3,
      highlightTerms: ['value < node.value', 'left'],
      tips: ['插入操作的效率取决于树的高度，平衡树 O(log n)，退化链表 O(n)'],
    },
    {
      id: 'traversal',
      title: '遍历方式',
      description: '前序遍历（根-左-右）、中序遍历（左-根-右）、后序遍历（左-右-根）',
      codeSnippet: `function inorder(node) {
  if (!node) return
  inorder(node.left)    // 先遍历左子树
  visit(node)           // 访问根节点
  inorder(node.right)   // 再遍历右子树
}`,
      highlightedLine: 4,
      highlightTerms: ['visit', 'inorder'],
      tips: ['BST 的中序遍历结果是有序的，这是一个重要的性质'],
    },
    {
      id: 'search',
      title: '查找节点',
      description: '利用 BST 性质，比较目标值与当前节点值，决定向左或向右搜索',
      codeSnippet: `function search(node, value) {
  if (!node || node.value === value)
    return node
  if (value < node.value)
    return search(node.left, value)
  return search(node.right, value)
}`,
      highlightedLine: 4,
      highlightTerms: ['value < node.value', 'search'],
      tips: ['AVL 树和红黑树通过旋转保持平衡，确保查找始终 O(log n)'],
    },
  ],
}
