/**
 * v20 M7 — learning config "counting" 中文 locale（自动从 src/configs/learning/counting.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const countingLearningSteps = {
  steps: {
    "init": {
      title: '确定值域范围',
      description: '找到数组中的最大值和最小值，确定计数数组的范围 k = max - min + 1',
      tips: '计数排序是非比较排序，时间复杂度为 O(n+k)，其中 k 是值域范围|当 k << n 时效率极高，但当 k 很大时空间开销大',
      highlightTerms: 'range|max|min',
      complexityTime: 'O(n+k)',
      complexitySpace: 'O(n+k)',
    },
    "count": {
      title: '统计出现次数',
      description: '遍历数组，统计每个值出现的次数，存入计数数组',
      tips: '使用 arr[i] - min 作为索引，可以处理负数|这一步的时间复杂度是 O(n)',
      highlightTerms: 'count[arr[i] - min]|count',
    },
    "prefix": {
      title: '累加计数',
      description: '对计数数组做前缀和，将出现次数转换为元素在输出数组中的最终位置',
      tips: '前缀和后，count[j] 表示值 (j+min) 在排序结果中的最后一个位置索引（从 1 开始）',
      highlightTerms: 'count[i] += count[i - 1]',
    },
    "place": {
      title: '逆序放置（保证稳定性）',
      description: '逆序遍历原数组，根据计数数组将每个元素放入输出数组的正确位置',
      tips: '逆序遍历是保证排序稳定性的关键——相等元素的相对顺序不变|每次放置后 count[idx] 递减，指向下一个相同值的位置',
      highlightTerms: 'output[count[idx] - 1]|count[idx]--',
    },
    "copy": {
      title: '复制回原数组',
      description: '将排序后的输出数组复制回原数组，完成排序',
      tips: '计数排序是稳定排序，适用于值域较小的非负整数排序|时间复杂度 O(n+k)，空间复杂度 O(n+k)',
      highlightTerms: 'arr[i] = output[i]',
    },
  },
} as const
