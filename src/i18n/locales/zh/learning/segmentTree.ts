/**
 * v20 M7 — learning config "segmentTree" 中文 locale（自动从 src/configs/learning/segmentTree.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const segmentTreeLearningSteps = {
  steps: {
    "concept": {
      title: '线段树概念',
      description: '二叉树结构，每个节点代表一个区间，支持高效的区间查询和单点更新',
      tips: '线段树由 Jon Bentley 于 1977 年提出|每个节点代表一个区间 [start, end]|根节点代表整个数组 [0, n-1]',
      highlightTerms: 'start|end|sum|left|right',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "node-structure": {
      title: '节点结构',
      description: '叶子节点代表单个元素，内部节点的区间由左右子节点区间拼接而成',
      tips: '叶子节点区间长度为 1|内部节点的 sum = 左子 sum + 右子 sum|树高为 O(log n)',
      highlightTerms: '叶子节点|内部节点',
    },
    "build": {
      title: '构建操作',
      description: '自底向上递归构建：叶子节点存储数组元素，内部节点存储子节点之和',
      tips: '构建时间为 O(n)|递归到叶子节点后自底向上汇总|mid = (start + end) / 2，左子区间 [start, mid]，右子区间 [mid+1, end]',
      highlightTerms: 'build|mid|left.sum + right.sum',
      complexityTime: 'O(n)',
      complexitySpace: 'O(n)',
    },
    "query": {
      title: '区间查询',
      description: '递归查询：无交集返回 0，完全包含返回 sum，部分交集递归左右子树',
      tips: '查询时间复杂度为 O(log n)|三种情况：无交集、完全包含、部分交集|部分交集时递归查询左右子树',
      highlightTerms: '无交集|完全包含|部分交集',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(log n)',
    },
    "update": {
      title: '单点更新',
      description: '从根递归到目标叶子节点，更新值后自底向上重新计算 sum',
      tips: '更新时间复杂度为 O(log n)|只需更新从根到叶的一条路径|更新后自底向上重新计算 sum',
      highlightTerms: 'index <= mid|node.left.sum + node.right.sum',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(log n)',
    },
    "complexity": {
      title: '复杂度分析',
      description: '构建 O(n)，查询和更新均为 O(log n)，空间 O(n)',
      tips: '线段树在查询和更新之间取得了平衡|前缀和查询快但更新慢，线段树两者都快|节点数最多 4n（因为最后一层可能不满',
      highlightTerms: 'O(log n)|O(n)',
    },
    "applications": {
      title: '应用场景',
      description: '适用于频繁区间查询和单点更新的场景，如区间求和、区间最值、计数等',
      tips: '懒标记线段树支持区间更新（如区间加、区间赋值）|可持久化线段树（主席树）支持历史版本查询|线段树是竞赛和面试中的高频考点',
      highlightTerms: '区间求和|懒标记|可持久化',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
  },
} as const
