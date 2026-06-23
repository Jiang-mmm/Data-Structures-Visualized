/**
 * v20 M7 — learning config "radix" 中文 locale（自动从 src/configs/learning/radix.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const radixLearningSteps = {
  steps: {
    "init": {
      title: '找到最大值',
      description: '首先找到数组中的最大值，确定需要处理的位数',
      tips: '基数排序是非比较排序，时间复杂度可以突破 O(n log n) 的下界',
      highlightTerms: 'max|exp',
      complexityTime: 'O(d·n)',
      complexitySpace: 'O(n+k)',
    },
    "count": {
      title: '统计当前位',
      description: '对当前位（个位/十位/...）统计 0-9 各数字出现的频率',
      tips: '这里使用的是 LSD（最低位优先）基数排序，从个位开始逐步向高位处理',
      highlightTerms: 'digit|count[digit]',
    },
    "place": {
      title: '按位放置',
      description: '根据当前位的值，将元素放入输出数组的正确位置（逆序遍历保证稳定性）',
      tips: '逆序遍历是为了保证排序的稳定性——相等元素保持原有相对顺序',
      highlightTerms: 'output|count[digit]',
    },
    "nextdigit": {
      title: '处理下一位',
      description: '将输出数组复制回原数组，exp 乘以 10 移动到下一位，重复上述过程',
      tips: '基数排序适合位数固定且范围不大的整数排序，d 为最大位数',
      highlightTerms: 'exp *= 10',
      complexityTime: 'O(d·n)，d 为最大位数',
      complexitySpace: 'O(n+k)，k 为基数',
    },
  },
} as const
