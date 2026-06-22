import type { LearningModeConfig } from './types'

export const segmentTreeConfig: LearningModeConfig = {
  algorithmKey: 'segmentTree',
  steps: [
    {
      id: 'concept',
      title: '线段树概念',
      description: '二叉树结构，每个节点代表一个区间，支持高效的区间查询和单点更新',
      codeSnippet: `class SegmentTreeNode {
  constructor(start, end, sum) {
    this.start = start  // 区间左端点
    this.end = end      // 区间右端点
    this.sum = sum      // 区间求和
    this.left = null    // 左子节点
    this.right = null   // 右子节点
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['start', 'end', 'sum', 'left', 'right'],
      tips: ['线段树由 Jon Bentley 于 1977 年提出', '每个节点代表一个区间 [start, end]', '根节点代表整个数组 [0, n-1]'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'node-structure',
      title: '节点结构',
      description: '叶子节点代表单个元素，内部节点的区间由左右子节点区间拼接而成',
      codeSnippet: `// 数组 [1, 3, 5, 7, 9] 的线段树：
//
//          [0,4] sum=25
//         /          \\
//    [0,2] sum=9    [3,4] sum=16
//    /     \\         /      \\
// [0,1]   [2,2]   [3,3]    [4,4]
// sum=4   sum=5   sum=7    sum=9
//  / \\
//[0,0][1,1]
//sum=1 sum=3`,
      highlightedLine: 2,
      highlightTerms: ['叶子节点', '内部节点'],
      tips: ['叶子节点区间长度为 1', '内部节点的 sum = 左子 sum + 右子 sum', '树高为 O(log n)'],
    },
    {
      id: 'build',
      title: '构建操作',
      description: '自底向上递归构建：叶子节点存储数组元素，内部节点存储子节点之和',
      codeSnippet: `function build(arr, start, end) {
  if (start === end) {
    // 叶子节点
    return new Node(start, end, arr[start])
  }
  const mid = Math.floor((start + end) / 2)
  const left = build(arr, start, mid)
  const right = build(arr, mid + 1, end)
  // 内部节点 sum = 左 + 右
  return new Node(start, end, left.sum + right.sum,
    left, right)
}`,
      highlightedLine: 5,
      highlightTerms: ['build', 'mid', 'left.sum + right.sum'],
      tips: ['构建时间为 O(n)', '递归到叶子节点后自底向上汇总', 'mid = (start + end) / 2，左子区间 [start, mid]，右子区间 [mid+1, end]'],
      complexity: { time: 'O(n)', space: 'O(n)' },
    },
    {
      id: 'query',
      title: '区间查询',
      description: '递归查询：无交集返回 0，完全包含返回 sum，部分交集递归左右子树',
      codeSnippet: `function query(node, qStart, qEnd) {
  if (!node) return 0
  // 无交集
  if (qEnd < node.start || qStart > node.end)
    return 0
  // 完全包含
  if (qStart <= node.start && node.end <= qEnd)
    return node.sum
  // 部分交集：递归
  return query(node.left, qStart, qEnd)
       + query(node.right, qStart, qEnd)
}`,
      highlightedLine: 6,
      highlightTerms: ['无交集', '完全包含', '部分交集'],
      tips: ['查询时间复杂度为 O(log n)', '三种情况：无交集、完全包含、部分交集', '部分交集时递归查询左右子树'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'update',
      title: '单点更新',
      description: '从根递归到目标叶子节点，更新值后自底向上重新计算 sum',
      codeSnippet: `function update(node, index, value) {
  if (node.start === node.end) {
    // 叶子节点：直接更新
    node.sum = value
    return
  }
  const mid = (node.start + node.end) / 2
  if (index <= mid)
    update(node.left, index, value)
  else
    update(node.right, index, value)
  // 自底向上重新计算 sum
  node.sum = node.left.sum + node.right.sum
}`,
      highlightedLine: 4,
      highlightTerms: ['index <= mid', 'node.left.sum + node.right.sum'],
      tips: ['更新时间复杂度为 O(log n)', '只需更新从根到叶的一条路径', '更新后自底向上重新计算 sum'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'complexity',
      title: '复杂度分析',
      description: '构建 O(n)，查询和更新均为 O(log n)，空间 O(n)',
      codeSnippet: `// 线段树复杂度总结：
// 1. 构建：O(n) — 每个节点访问一次
// 2. 查询：O(log n) — 最多访问 4 个节点每层
// 3. 更新：O(log n) — 从根到叶的一条路径
// 4. 空间：O(n) — 节点数 ≤ 4n

// 与其他数据结构对比：
// - 暴力查询：O(n) 每次查询
// - 前缀和：O(n) 构建，O(1) 查询，O(n) 更新
// - 线段树：O(n) 构建，O(log n) 查询/更新

// 树高上界：
// h ≤ ⌈log₂(n)⌉ + 1`,
      highlightedLine: 3,
      highlightTerms: ['O(log n)', 'O(n)'],
      tips: ['线段树在查询和更新之间取得了平衡', '前缀和查询快但更新慢，线段树两者都快', '节点数最多 4n（因为最后一层可能不满'],
    },
    {
      id: 'applications',
      title: '应用场景',
      description: '适用于频繁区间查询和单点更新的场景，如区间求和、区间最值、计数等',
      codeSnippet: `// 典型应用：
// 1. 区间求和（本实现）
// 2. 区间最值（RMQ 问题）
// 3. 区间计数（统计区间内满足条件的元素）
// 4. 动态规划优化
// 5. 计算几何中的面积并

// 变体：
// - 树状数组（BIT/Fenwick Tree）：更轻量，但功能受限
// - 懒标记线段树：支持区间更新
// - 可持久化线段树：支持历史版本查询
// - 动态开点线段树：支持离散化大范围

// 线段树 vs 树状数组：
// - 线段树功能更强大，支持任意区间操作
// - 树状数组常数更小，代码更简洁
// - 线段树更通用，树状数组更轻量`,
      highlightedLine: 3,
      highlightTerms: ['区间求和', '懒标记', '可持久化'],
      tips: ['懒标记线段树支持区间更新（如区间加、区间赋值）', '可持久化线段树（主席树）支持历史版本查询', '线段树是竞赛和面试中的高频考点'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
  ],
}
