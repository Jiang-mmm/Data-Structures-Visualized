import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const bTreeConfig: LearningModeConfig = {
  algorithmKey: 'bTree',
  steps: [
    {
      id: 'concept',
      title: tStatic('learningSteps.bTree.steps.concept.title'),
      description: tStatic('learningSteps.bTree.steps.concept.description'),
      codeSnippet: `class BTreeNode {
  constructor() {
    this.keys = []      // 存储 key 的数组
    this.children = []  // 存储子节点的数组
    this.leaf = true    // 是否为叶子节点
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.bTree.steps.concept.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.concept.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bTree.steps.concept.complexityTime'), space: tStatic('learningSteps.bTree.steps.concept.complexitySpace') },
    },
    {
      id: 'node-structure',
      title: tStatic('learningSteps.bTree.steps.node-structure.title'),
      description: tStatic('learningSteps.bTree.steps.node-structure.description'),
      codeSnippet: `// order = 3 的 B 树（2-3 树）
// 每个节点最多 2 个 key，3 个子节点
// 非根节点最少 1 个 key，2 个子节点

// 节点结构示例：
//      [10 | 20]
//     /    |    \\
//  [5]  [12,15]  [25,30]`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.bTree.steps.node-structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.node-structure.tips').split('|'),
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.bTree.steps.insert.title'),
      description: tStatic('learningSteps.bTree.steps.insert.description'),
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
      highlightTerms: tStatic('learningSteps.bTree.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.insert.tips').split('|'),
    },
    {
      id: 'split',
      title: tStatic('learningSteps.bTree.steps.split.title'),
      description: tStatic('learningSteps.bTree.steps.split.description'),
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
      highlightTerms: tStatic('learningSteps.bTree.steps.split.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.split.tips').split('|'),
    },
    {
      id: 'search',
      title: tStatic('learningSteps.bTree.steps.search.title'),
      description: tStatic('learningSteps.bTree.steps.search.description'),
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
      highlightTerms: tStatic('learningSteps.bTree.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.search.tips').split('|'),
    },
    {
      id: 'balance',
      title: tStatic('learningSteps.bTree.steps.balance.title'),
      description: tStatic('learningSteps.bTree.steps.balance.description'),
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
      highlightTerms: tStatic('learningSteps.bTree.steps.balance.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.balance.tips').split('|'),
    },
    {
      id: 'applications',
      title: tStatic('learningSteps.bTree.steps.applications.title'),
      description: tStatic('learningSteps.bTree.steps.applications.description'),
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
      highlightTerms: tStatic('learningSteps.bTree.steps.applications.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bTree.steps.applications.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bTree.steps.applications.complexityTime'), space: tStatic('learningSteps.bTree.steps.applications.complexitySpace') },
    },
  ],
}
