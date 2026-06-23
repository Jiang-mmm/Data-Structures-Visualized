/**
 * v20 M7 — learning config "heap" 中文 locale（自动从 src/configs/learning/heap.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const heapLearningSteps = {
  steps: {
    "init": {
      title: '建堆',
      description: '从最后一个非叶子节点开始，自底向上执行堆化操作构建最大堆',
      tips: '建堆的时间复杂度是 O(n)，不是 O(n log n)，因为底层节点不需要下沉',
      highlightTerms: 'heapify|n / 2',
      complexityTime: 'O(n log n)',
      complexitySpace: 'O(1)',
    },
    "heapify": {
      title: '堆化操作',
      description: '比较父节点与左右子节点，将最大值上浮到父节点位置',
      tips: '堆化是一个自顶向下的递归过程，最坏下沉到叶子节点，深度为 log n',
      highlightTerms: 'largest|arr[left]',
    },
    "extract": {
      title: '提取堆顶',
      description: '将堆顶（最大值）与末尾元素交换，缩小堆的范围',
      tips: '每次交换后堆大小减 1，已排序区域从末尾向前增长',
      highlightTerms: 'swap|0',
    },
    "sorted": {
      title: '排序完成',
      description: '每次提取后重新堆化，重复直到堆大小为 1，数组完全有序',
      tips: '堆排序是唯一同时满足 O(n log n) 时间和 O(1) 空间的排序算法，但不稳定',
      highlightTerms: 'O(n log n)',
      complexityTime: 'O(n log n) 稳定',
      complexitySpace: 'O(1)',
    },
  },
} as const
