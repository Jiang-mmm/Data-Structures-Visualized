import type { LearningModeConfig } from './types'

export const countingConfig: LearningModeConfig = {
  algorithmKey: 'counting',
  steps: [
    {
      id: 'init',
      title: '确定值域范围',
      description: '找到数组中的最大值和最小值，确定计数数组的范围 k = max - min + 1',
      codeSnippet: `function countingSort(arr) {
  const max = Math.max(...arr)
  const min = Math.min(...arr)
  const range = max - min + 1
  // 计数数组大小为 range
}`,
      highlightedLine: 3,
      highlightTerms: ['range', 'max', 'min'],
      tips: ['计数排序是非比较排序，时间复杂度为 O(n+k)，其中 k 是值域范围', '当 k << n 时效率极高，但当 k 很大时空间开销大'],
      complexity: { time: 'O(n+k)', space: 'O(n+k)' },
    },
    {
      id: 'count',
      title: '统计出现次数',
      description: '遍历数组，统计每个值出现的次数，存入计数数组',
      codeSnippet: `  const count = new Array(range).fill(0)
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++
  }
  // count[j] 现在表示值 (j + min) 出现的次数`,
      highlightedLine: 3,
      highlightTerms: ['count[arr[i] - min]', 'count'],
      tips: ['使用 arr[i] - min 作为索引，可以处理负数', '这一步的时间复杂度是 O(n)'],
    },
    {
      id: 'prefix',
      title: '累加计数',
      description: '对计数数组做前缀和，将出现次数转换为元素在输出数组中的最终位置',
      codeSnippet: `  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1]
  }
  // 现在 count[j] 表示值 (j + min) 在排序后的最后一个位置`,
      highlightedLine: 2,
      highlightTerms: ['count[i] += count[i - 1]'],
      tips: ['前缀和后，count[j] 表示值 (j+min) 在排序结果中的最后一个位置索引（从 1 开始）'],
    },
    {
      id: 'place',
      title: '逆序放置（保证稳定性）',
      description: '逆序遍历原数组，根据计数数组将每个元素放入输出数组的正确位置',
      codeSnippet: `  const output = new Array(n)
  for (let i = n - 1; i >= 0; i--) {
    const idx = arr[i] - min
    output[count[idx] - 1] = arr[i]
    count[idx]--
  }
  // 逆序遍历保证相同值的元素保持原有相对顺序`,
      highlightedLine: 4,
      highlightTerms: ['output[count[idx] - 1]', 'count[idx]--'],
      tips: ['逆序遍历是保证排序稳定性的关键——相等元素的相对顺序不变', '每次放置后 count[idx] 递减，指向下一个相同值的位置'],
    },
    {
      id: 'copy',
      title: '复制回原数组',
      description: '将排序后的输出数组复制回原数组，完成排序',
      codeSnippet: `  for (let i = 0; i < n; i++) {
    arr[i] = output[i]
  }
  return arr
}`,
      highlightedLine: 2,
      highlightTerms: ['arr[i] = output[i]'],
      tips: ['计数排序是稳定排序，适用于值域较小的非负整数排序', '时间复杂度 O(n+k)，空间复杂度 O(n+k)'],
    },
  ],
}
