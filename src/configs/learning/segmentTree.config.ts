import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const segmentTreeConfig: LearningModeConfig = {
  algorithmKey: 'segmentTree',
  steps: [
    {
      id: 'concept',
      title: tStatic('learningSteps.segmentTree.steps.concept.title'),
      description: tStatic('learningSteps.segmentTree.steps.concept.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.concept.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.concept.tips').split('|'),
      complexity: { time: tStatic('learningSteps.segmentTree.steps.concept.complexityTime'), space: tStatic('learningSteps.segmentTree.steps.concept.complexitySpace') },
    },
    {
      id: 'node-structure',
      title: tStatic('learningSteps.segmentTree.steps.node-structure.title'),
      description: tStatic('learningSteps.segmentTree.steps.node-structure.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.node-structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.node-structure.tips').split('|'),
    },
    {
      id: 'build',
      title: tStatic('learningSteps.segmentTree.steps.build.title'),
      description: tStatic('learningSteps.segmentTree.steps.build.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.build.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.build.tips').split('|'),
      complexity: { time: tStatic('learningSteps.segmentTree.steps.build.complexityTime'), space: tStatic('learningSteps.segmentTree.steps.build.complexitySpace') },
    },
    {
      id: 'query',
      title: tStatic('learningSteps.segmentTree.steps.query.title'),
      description: tStatic('learningSteps.segmentTree.steps.query.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.query.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.query.tips').split('|'),
      complexity: { time: tStatic('learningSteps.segmentTree.steps.query.complexityTime'), space: tStatic('learningSteps.segmentTree.steps.query.complexitySpace') },
    },
    {
      id: 'update',
      title: tStatic('learningSteps.segmentTree.steps.update.title'),
      description: tStatic('learningSteps.segmentTree.steps.update.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.update.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.update.tips').split('|'),
      complexity: { time: tStatic('learningSteps.segmentTree.steps.update.complexityTime'), space: tStatic('learningSteps.segmentTree.steps.update.complexitySpace') },
    },
    {
      id: 'complexity',
      title: tStatic('learningSteps.segmentTree.steps.complexity.title'),
      description: tStatic('learningSteps.segmentTree.steps.complexity.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.complexity.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.complexity.tips').split('|'),
    },
    {
      id: 'applications',
      title: tStatic('learningSteps.segmentTree.steps.applications.title'),
      description: tStatic('learningSteps.segmentTree.steps.applications.description'),
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
      highlightTerms: tStatic('learningSteps.segmentTree.steps.applications.highlightTerms').split('|'),
      tips: tStatic('learningSteps.segmentTree.steps.applications.tips').split('|'),
      complexity: { time: tStatic('learningSteps.segmentTree.steps.applications.complexityTime'), space: tStatic('learningSteps.segmentTree.steps.applications.complexitySpace') },
    },
  ],
}
