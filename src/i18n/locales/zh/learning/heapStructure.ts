/**
 * v20 M7 — learning config "heapStructure" 中文 locale（自动从 src/configs/learning/heapStructure.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const heapStructureLearningSteps = {
  steps: {
    "structure": {
      title: '堆结构',
      description: '堆是完全二叉树，用数组存储：父节点 i 的左子为 2i+1，右子为 2i+2，最大堆中父节点 ≥ 子节点',
      tips: '堆用数组存储完全二叉树，不需要指针，空间利用率高且缓存友好',
      highlightTerms: '完全二叉树|≥',
      complexityTime: '插入/提取 O(log n)，查看 O(1)',
      complexitySpace: 'O(n)',
    },
    "insert": {
      title: '插入（上浮）',
      description: '新元素先放到数组末尾，然后与父节点比较，若大于父节点则交换上浮，直到满足堆性质',
      tips: '上浮操作最多比较 log n 次（树的高度），因此插入复杂度 O(log n)',
      highlightTerms: '上浮|swap',
    },
    "extract": {
      title: '提取堆顶（下沉）',
      description: '将堆顶与末尾交换并移除，然后从堆顶开始与较大子节点比较下沉，直到满足堆性质',
      tips: '下沉时需要与较大的子节点交换，否则会破坏堆性质',
      highlightTerms: '下沉|largest',
    },
    "peek": {
      title: '查看堆顶',
      description: '直接返回数组首元素，即最大值，时间复杂度 O(1)',
      tips: '堆的典型应用：优先队列、堆排序、Top-K 问题、中位数维护、Dijkstra 优化',
      highlightTerms: 'heap[0]|O(1)',
    },
  },
} as const
