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
      id: 'preorder',
      title: '前序遍历 Preorder',
      description: '访问顺序：根节点 → 左子树 → 右子树。常用于复制树、序列化树结构。',
      codeSnippet: `function preorder(node) {
  if (!node) return
  visit(node)            // 先访问根
  preorder(node.left)    // 再遍历左子树
  preorder(node.right)   // 最后遍历右子树
}`,
      highlightedLine: 3,
      highlightTerms: ['visit', 'preorder'],
      tips: ['前序遍历的第一个节点是根节点', '可用于树的序列化与反序列化'],
      complexity: { time: 'O(n)', space: 'O(h)，h 为树高' },
    },
    {
      id: 'inorder',
      title: '中序遍历 Inorder',
      description: '访问顺序：左子树 → 根节点 → 右子树。BST 中序遍历得到有序序列。',
      codeSnippet: `function inorder(node) {
  if (!node) return
  inorder(node.left)     // 先遍历左子树
  visit(node)            // 再访问根
  inorder(node.right)    // 最后遍历右子树
}`,
      highlightedLine: 3,
      highlightTerms: ['inorder', 'visit'],
      tips: ['BST 中序遍历结果严格递增', '中序遍历可用来验证 BST 性质'],
      complexity: { time: 'O(n)', space: 'O(h)' },
    },
    {
      id: 'postorder',
      title: '后序遍历 Postorder',
      description: '访问顺序：左子树 → 右子树 → 根节点。常用于删除树、计算目录大小。',
      codeSnippet: `function postorder(node) {
  if (!node) return
  postorder(node.left)   // 先遍历左子树
  postorder(node.right)  // 再遍历右子树
  visit(node)            // 最后访问根
}`,
      highlightedLine: 4,
      highlightTerms: ['postorder', 'visit'],
      tips: ['后序遍历的最后一个节点是根节点', '适合先处理子树再处理根的场景（如释放内存）'],
      complexity: { time: 'O(n)', space: 'O(h)' },
    },
    {
      id: 'levelorder',
      title: '层序遍历 Levelorder',
      description: '按层从上到下、从左到右访问节点。使用队列辅助实现 BFS。',
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
      highlightTerms: ['queue', 'shift', 'push'],
      tips: ['层序遍历即广度优先搜索（BFS）', '常用于求树的最小高度、按层打印树'],
      complexity: { time: 'O(n)', space: 'O(w)，w 为最大宽度' },
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
    {
      id: 'delete',
      title: '删除节点 Delete',
      description: '删除节点需处理三种情况：叶子节点（直接删）、单子节点（用子节点替换）、双子节点（用中序后继替换）。',
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
      highlightTerms: ['findMin', 'deleteNode', '中序后继'],
      tips: ['双子节点情况也可用中序前驱替换', '删除后可能破坏平衡，AVL/红黑树需旋转恢复'],
      complexity: { time: '平均 O(log n)，最坏 O(n)', space: 'O(h)' },
    },
  ],
}
