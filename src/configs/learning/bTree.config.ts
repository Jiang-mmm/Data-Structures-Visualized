import type { LearningModeConfig } from './types'

export const bTreeConfig: LearningModeConfig = {
  algorithmKey: 'bTree',
  steps: [
    {
      id: 'concept',
      title: 'B 树概念',
      description: '多路自平衡搜索树，每个节点可存储多个 key，所有叶子位于同一层',
      codeSnippet: `class BTreeNode {
  constructor() {
    this.keys = []      // 存储 key 的数组
    this.children = []  // 存储子节点的数组
    this.leaf = true    // 是否为叶子节点
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['keys', 'children', 'leaf'],
      tips: ['B 树由 Bayer 和 McCreight 于 1972 年提出', '每个节点最多 order 个子节点，order-1 个 key', '所有叶子节点位于同一层，保证平衡'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'node-structure',
      title: '节点结构',
      description: '阶数为 order 的 B 树：每个节点最多 order-1 个 key，order 个子节点；非根节点最少 ⌈order/2⌉-1 个 key',
      codeSnippet: `// order = 3 的 B 树（2-3 树）
// 每个节点最多 2 个 key，3 个子节点
// 非根节点最少 1 个 key，2 个子节点

// 节点结构示例：
//      [10 | 20]
//     /    |    \\
//  [5]  [12,15]  [25,30]`,
      highlightedLine: 2,
      highlightTerms: ['order', '2-3 树'],
      tips: ['阶数 order 决定每个节点的最大子节点数', '2-3 树是最简单的 B 树（order=3）', 'B+ 树是 B 树的变体，常用于数据库索引'],
    },
    {
      id: 'insert',
      title: '插入操作',
      description: '从根节点开始，找到合适的叶子节点插入 key。若节点已满则触发分裂',
      codeSnippet: `function insert(root, key) {
  if (!root) return new LeafNode([key])

  // 根节点已满：先分裂根
  if (root.keys.length >= maxKeys) {
    const newRoot = new InternalNode()
    newRoot.children.push(root)
    splitChild(newRoot, 0)
    root = newRoot
  }
  insertNonFull(root, key)
  return root
}`,
      highlightedLine: 6,
      highlightTerms: ['insertNonFull', 'splitChild'],
      tips: ['插入总是发生在叶子节点', '插入前检查节点是否已满', '满节点需要分裂才能继续插入'],
    },
    {
      id: 'split',
      title: '分裂机制',
      description: '当节点 key 数量超过 maxKeys 时，将中间 key 上移到父节点，原节点分裂为左右两部分',
      codeSnippet: `function splitChild(parent, index) {
  const child = parent.children[index]
  const midIndex = Math.floor(child.keys.length / 2)
  const midKey = child.keys[midIndex]

  // 右节点：midKey 之后的 keys
  const right = new Node(
    child.keys.slice(midIndex + 1),
    child.children.slice(midIndex + 1)
  )

  // 左节点：截断为 midIndex 之前的 keys
  child.keys = child.keys.slice(0, midIndex)

  // 中间 key 上移到 parent
  parent.keys.splice(index, 0, midKey)
  parent.children.splice(index + 1, 0, right)
}`,
      highlightedLine: 4,
      highlightTerms: ['midKey', 'slice', 'splice'],
      tips: ['分裂是 B 树保持平衡的核心操作', '中间 key 上移到父节点', '分裂可能向上传播，直到根节点'],
    },
    {
      id: 'search',
      title: '搜索操作',
      description: '从根节点开始，在 keys 中找到合适的位置，递归或循环进入对应子节点',
      codeSnippet: `function search(node, key) {
  let i = 0
  while (i < node.keys.length && key > node.keys[i]) {
    i++
  }
  if (i < node.keys.length && key === node.keys[i]) {
    return true  // 找到
  }
  if (node.leaf) return false  // 叶子节点，未找到
  return search(node.children[i], key)  // 递归搜索子节点
}`,
      highlightedLine: 6,
      highlightTerms: ['key === node.keys[i]', 'node.children[i]'],
      tips: ['搜索时间复杂度为 O(log n)', '每个节点的 keys 是有序的，可用二分查找加速', '搜索路径从根到叶，长度等于树高'],
    },
    {
      id: 'balance',
      title: '平衡特性',
      description: 'B 树通过分裂机制保证所有叶子节点位于同一层，树高始终为 O(log n)',
      codeSnippet: `// B 树性质保证：
// 1. 每个节点最多 order 个子节点
// 2. 非根非叶节点最少 ⌈order/2⌉ 个子节点
// 3. 所有叶子节点位于同一层
// 4. 节点的 keys 有序排列

// 树高上界：
// h ≤ log_⌈order/2⌉(n)
// 其中 n 为 key 总数

// 对于 order=3 的 2-3 树：
// h ≤ log_2(n)`,
      highlightedLine: 3,
      highlightTerms: ['同一层', 'log'],
      tips: ['B 树的平衡是天然的——分裂保证叶子同层', '与 AVL/红黑树不同，B 树不需要旋转操作', '更大的阶数意味着更矮的树，适合磁盘 I/O'],
    },
    {
      id: 'applications',
      title: '应用场景',
      description: 'B 树广泛应用于数据库索引和文件系统，其多路特性减少磁盘 I/O 次数',
      codeSnippet: `// 典型应用：
// 1. MySQL InnoDB 索引（使用 B+ 树）
// 2. 文件系统目录结构
// 3. 数据库索引（PostgreSQL、SQLite）
// 4. 大规模数据存储

// B+ 树 vs B 树：
// - B+ 树：数据只存叶子，叶子间有链表
// - B 树：数据分布在所有节点
// - B+ 树更适合范围查询

// 为什么 B 树适合磁盘？
// - 每个节点大小匹配磁盘页（如 4KB）
// - 一次 I/O 读取一个节点（多个 key）
// - 树高较低，I/O 次数少`,
      highlightedLine: 3,
      highlightTerms: ['B+ 树', '磁盘 I/O'],
      tips: ['B+ 树是数据库索引的首选结构', '节点大小通常匹配磁盘块大小（4KB-16KB）', 'B 树 vs B+ 树：B+ 树叶子间有链表，范围查询更高效'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
  ],
}
