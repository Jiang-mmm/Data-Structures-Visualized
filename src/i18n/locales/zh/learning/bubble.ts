/**
 * v20 M7 — learning config "bubble" 中文 locale（自动从 src/configs/learning/bubble.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const bubbleLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '外层循环从左到右遍历数组，每轮将最大值"冒泡"到末尾',
      tips: '冒泡排序是最直观的排序算法，但效率较低，适合教学而非生产环境',
      highlightTerms: 'n - 1',
      complexityTime: 'O(n²)',
      complexitySpace: 'O(1)',
    },
    "compare": {
      title: '比较相邻元素',
      description: '比较 arr[j] 和 arr[j+1]，判断是否需要交换',
      tips: '每轮比较范围缩小 i 个元素，因为末尾已有 i 个元素归位',
      highlightTerms: 'arr[j]|arr[j + 1]',
    },
    "swap": {
      title: '交换元素',
      description: '如果左侧元素大于右侧，交换两个元素的位置',
      tips: '冒泡排序是稳定排序——相等元素不会交换位置',
      highlightTerms: 'temp|arr[j]',
    },
    "sorted": {
      title: '已排序区域',
      description: '每轮结束后，最大元素已到达正确位置，缩小比较范围',
      tips: '添加一个 swapped 标志，如果某轮没有交换就可以提前终止，最佳情况 O(n)',
      highlightTerms: '已排序|O(n)',
    },
  },
} as const
