/**
 * v20 M7 — learning config "insertion" 中文 locale（自动从 src/configs/learning/insertion.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const insertionLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '从第二个元素开始（i=1），将当前元素插入到左侧已排序区域的正确位置',
      tips: '插入排序天然地将数组分为"已排序"和"未排序"两部分',
      highlightTerms: 'i = 1|j',
      complexityTime: 'O(n²)',
      complexitySpace: 'O(1)',
    },
    "compare": {
      title: '向前比较',
      description: '将当前元素与左侧相邻元素比较，如果左侧更大则交换',
      tips: '一旦遇到不大于当前元素的值就停止，这是插入排序的最佳情况优化',
      highlightTerms: 'arr[j - 1]|arr[j]',
    },
    "shift": {
      title: '移动元素',
      description: '交换相邻元素，将当前元素逐步向左移动到正确位置',
      tips: '实际工程中常用"移位"代替"交换"来减少赋值次数',
      highlightTerms: 'temp|j--',
    },
    "sorted": {
      title: '已排序区域增长',
      description: '每轮结束后 arr[0..i] 有序，继续处理下一个元素',
      tips: '插入排序对近乎有序的数组效率极高，接近 O(n)，常用于混合排序算法的子过程',
      highlightTerms: '已排序|O(n)',
      complexityTime: '最好 O(n)，最坏 O(n²)',
      complexitySpace: 'O(1)',
    },
  },
} as const
