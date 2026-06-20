import type { LearningModeConfig } from './types'

export const redBlackTreeConfig: LearningModeConfig = {
  algorithmKey: 'redBlackTree',
  steps: [
    {
      id: 'intro',
      title: '红黑树简介',
      description: '红黑树是自平衡二叉搜索树，通过节点颜色（红/黑）与旋转保持近似平衡，保证 O(log n) 操作',
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
      highlightTerms: ['color', 'red', 'parent'],
      tips: ['红黑树由 Rudolf Bayer 于 1972 年发明，称为「对称二叉 B 树」', 'Linux 内核的 CFS 调度器、Java TreeMap、C++ std::map 底层均使用红黑树', '相比 AVL 树，红黑树旋转次数更少，适合写多读少场景'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'properties',
      title: '红黑树五大性质',
      description: '红黑树通过五条性质维持平衡：根黑、叶黑、红节点子必黑、等黑高',
      codeSnippet: `// 红黑树五大性质：
// 1. 每个节点是红色或黑色
// 2. 根节点是黑色
// 3. 每个叶子节点（NIL）是黑色
// 4. 红色节点的子节点必须是黑色
//    （不能有连续两个红色节点）
// 5. 从任一节点到其所有后代叶子的路径
//    包含相同数量的黑色节点`,
      highlightedLine: 2,
      highlightTerms: ['根节点', '叶子节点', '红色节点', '黑色节点'],
      tips: ['性质 4 保证没有连续两个红色节点', '性质 5 保证最长路径不超过最短路径的 2 倍', 'NIL 叶子指空节点（null），隐式为黑色'],
    },
    {
      id: 'insert',
      title: '插入节点',
      description: '新节点默认为红色（避免破坏性质 5），按 BST 规则插入后通过 fixInsert 修复红黑性质',
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
      highlightTerms: ['newNode', 'parent', 'fixInsert'],
      tips: ['新节点为红色，可能违反性质 4（父红子红）', '若父节点为黑色，无需修复，直接完成', '若父节点为红色，需进入 fixInsert 修复'],
      complexity: { time: 'O(log n)', space: 'O(1)' },
    },
    {
      id: 'fixup',
      title: '插入修复（重染色 + 旋转）',
      description: '当父节点为红色时，根据叔节点颜色分三种情况修复：叔红重染色、叔黑旋转',
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
      highlightTerms: ['uncle', 'color', 'black', 'red'],
      tips: ['情况 1（叔红）：重染色后 z 上移两层，可能继续修复', '情况 2（叔黑，z 内侧）：旋转父节点，转为情况 3', '情况 3（叔黑，z 外侧）：重染色 + 旋转祖父，修复结束'],
      complexity: { time: 'O(log n)', space: 'O(1)' },
    },
    {
      id: 'rotation',
      title: '旋转操作',
      description: '左旋与右旋保持 BST 性质，用于调整树形结构，是红黑树平衡的核心',
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
      highlightTerms: ['rotateLeft', 'y', 'parent'],
      tips: ['旋转是局部操作，仅改变 3 个节点的指针关系', '左旋与右旋互为逆操作', '旋转后 BST 中序遍历结果不变'],
    },
    {
      id: 'complexity',
      title: '复杂度分析',
      description: '红黑树高度最多 2log(n+1)，所有操作 O(log n)，旋转次数少于 AVL 树',
      codeSnippet: `// 红黑树复杂度：
// 查找：O(log n)
// 插入：O(log n)，最多 2 次旋转
// 删除：O(log n)，最多 3 次旋转
// 空间：O(n)
//
// 树高上限：2 * log2(n + 1)
// 最长路径 / 最短路径 ≤ 2`,
      highlightedLine: 2,
      highlightTerms: ['O(log n)', '2 * log2', '旋转'],
      tips: ['红黑树插入最多 2 次旋转，AVL 树可能更多', '红黑树查找略慢于 AVL（树更高），但插入/删除更快', '实际工程中红黑树应用更广（如 STL map/set）'],
    },
  ],
}
