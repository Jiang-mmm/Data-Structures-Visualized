/**
 * v20 M7 — learning config "merge" 中文 locale（自动从 src/configs/learning/merge.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const mergeLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '将数组不断对半分割，直到每个子数组只有一个元素',
      tips: '归并排序采用分治策略，分割阶段不涉及任何比较或交换',
      highlightTerms: 'mid',
      complexityTime: 'O(n log n)',
      complexitySpace: 'O(n)',
    },
    "split": {
      title: '递归分割',
      description: '递归地对左半部分和右半部分分别进行归并排序',
      tips: '递归深度为 log n，每层总共需要 n 次操作，因此总复杂度 O(n log n)',
      highlightTerms: 'mergeSort',
    },
    "merge": {
      title: '合并操作',
      description: '创建临时数组，用双指针将两个有序子数组合并为一个有序数组',
      tips: '使用 <= 而非 < 可以保证归并排序的稳定性',
      highlightTerms: 'leftArr[i]|rightArr[j]',
    },
    "copy": {
      title: '复制剩余',
      description: '将两个子数组中剩余的元素复制回原数组',
      tips: '归并排序缺点是需要 O(n) 额外空间，但在链表排序和外部排序中优势明显',
      highlightTerms: 'leftArr[i]|arr[k]',
      complexityTime: 'O(n log n) 稳定',
      complexitySpace: 'O(n)',
    },
  },
} as const
