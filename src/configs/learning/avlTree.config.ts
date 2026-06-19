import type { LearningModeConfig } from './types'

export const avlTreeConfig: LearningModeConfig = {
  algorithmKey: 'avlTree',
  steps: [
    {
      id: 'concept',
      title: 'AVL 树概念',
      description: '自平衡二叉搜索树，任意节点平衡因子绝对值不超过 1',
      codeSnippet: `class AvlNode {
  constructor(value) {
    this.value = value
    this.left = null
    this.right = null
    this.height = 1
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['height'],
      tips: ['AVL 树由 Adelson-Velsky 和 Landis 于 1962 年发明', '通过旋转操作保持平衡，确保查找/插入/删除始终 O(log n)'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'height-balance',
      title: '高度与平衡因子',
      description: '节点高度 = max(左子树高度, 右子树高度) + 1；平衡因子 = 左子树高度 - 右子树高度',
      codeSnippet: `function getHeight(node) {
  return node ? node.height : 0
}

function getBalanceFactor(node) {
  if (!node) return 0
  return getHeight(node.left) - getHeight(node.right)
}`,
      highlightedLine: 6,
      highlightTerms: ['getHeight', 'getBalanceFactor'],
      tips: ['叶子节点高度为 1，空节点高度为 0', '平衡因子取值范围为 {-1, 0, 1}，超出则需旋转'],
    },
    {
      id: 'insert',
      title: '插入节点',
      description: '先按 BST 规则插入，然后沿路径向上更新高度并检查平衡',
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
      highlightTerms: ['height', 'rebalance'],
      tips: ['插入后需要从插入点向上回溯到根节点', '回溯过程中更新高度并检查平衡因子'],
    },
    {
      id: 'rotations',
      title: '旋转操作',
      description: '四种失衡情况：LL（右旋）、RR（左旋）、LR（先左旋再右旋）、RL（先右旋再左旋）',
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
      highlightTerms: ['rotateRight', 'x.right = y'],
      tips: ['LL 型：平衡因子 > 1 且新节点在左子树的左子树', 'LR 型：先对左子树左旋，再对根右旋', 'RR 和 RL 型是对称情况'],
    },
    {
      id: 'rebalance',
      title: '重新平衡',
      description: '根据平衡因子判断失衡类型并执行对应旋转',
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
      highlightTerms: ['bf > 1', 'bf < -1', 'rotateRight', 'rotateLeft'],
      tips: ['判断失衡类型时需同时检查子节点的平衡因子', 'LR 和 RL 型需要两次旋转才能恢复平衡'],
    },
    {
      id: 'delete',
      title: '删除节点',
      description: '按 BST 规则删除，用中序后继替换有两个子节点的节点，然后重新平衡',
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
      highlightTerms: ['successor', 'findMin', 'rebalance'],
      tips: ['删除后可能需要多次旋转才能恢复平衡', '中序后继是右子树中最小的节点'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'complexity',
      title: '复杂度分析',
      description: 'AVL 树保证高度为 O(log n)，所有操作为 O(log n)',
      codeSnippet: `// AVL 树高度上界
// h ≤ 1.44 * log2(n + 2) - 0.328
//
// 操作复杂度：
// 查找：O(log n)
// 插入：O(log n)（最多 1 次旋转）
// 删除：O(log n)（最多 O(log n) 次旋转）
// 空间：O(n)`,
      highlightedLine: 2,
      highlightTerms: ['log2', 'O(log n)'],
      tips: ['AVL 树比红黑树更严格平衡，查找更快但插入/删除旋转更多', '适合查找密集型场景，如数据库索引缓存'],
    },
  ],
}
