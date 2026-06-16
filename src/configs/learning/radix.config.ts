import type { LearningModeConfig } from './types'

export const radixConfig: LearningModeConfig = {
  algorithmKey: 'radix',
  steps: [
    {
      id: 'init',
      title: '找到最大值',
      description: '首先找到数组中的最大值，确定需要处理的位数',
      codeSnippet: `function radixSort(arr) {
  const max = Math.max(...arr)
  let exp = 1  // 当前位数：个位、十位、百位...
  // 当 max/exp > 0 时继续处理
}`,
      highlightedLine: 2,
      highlightTerms: ['max', 'exp'],
      tips: ['基数排序是非比较排序，时间复杂度可以突破 O(n log n) 的下界'],
      complexity: { time: 'O(d·n)', space: 'O(n+k)' },
    },
    {
      id: 'count',
      title: '统计当前位',
      description: '对当前位（个位/十位/...）统计 0-9 各数字出现的频率',
      codeSnippet: `  const count = new Array(10).fill(0)
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10
    count[digit]++
  }
  // 累加计数，转换为位置索引
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
  }`,
      highlightedLine: 3,
      highlightTerms: ['digit', 'count[digit]'],
      tips: ['这里使用的是 LSD（最低位优先）基数排序，从个位开始逐步向高位处理'],
    },
    {
      id: 'place',
      title: '按位放置',
      description: '根据当前位的值，将元素放入输出数组的正确位置（逆序遍历保证稳定性）',
      codeSnippet: `  const output = new Array(n)
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10
    output[count[digit] - 1] = arr[i]
    count[digit]--
  }`,
      highlightedLine: 4,
      highlightTerms: ['output', 'count[digit]'],
      tips: ['逆序遍历是为了保证排序的稳定性——相等元素保持原有相对顺序'],
    },
    {
      id: 'nextdigit',
      title: '处理下一位',
      description: '将输出数组复制回原数组，exp 乘以 10 移动到下一位，重复上述过程',
      codeSnippet: `  for (let i = 0; i < n; i++) {
    arr[i] = output[i]
  }
  exp *= 10  // 个位→十位→百位...
  // 重复直到所有位处理完毕`,
      highlightedLine: 4,
      highlightTerms: ['exp *= 10'],
      tips: ['基数排序适合位数固定且范围不大的整数排序，d 为最大位数'],
      complexity: { time: 'O(d·n)，d 为最大位数', space: 'O(n+k)，k 为基数' },
    },
  ],
}
