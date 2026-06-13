import type { LearningModeConfig } from './types'

export const mergeConfig: LearningModeConfig = {
  algorithmKey: 'merge',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '将数组不断对半分割，直到每个子数组只有一个元素',
      codeSnippet: `function mergeSort(arr, left, right) {
  if (left >= right) return
  const mid = Math.floor((left + right) / 2)
}`,
      highlightedLine: 3,
      highlightTerms: ['mid'],
    },
    {
      id: 'split',
      title: '递归分割',
      description: '递归地对左半部分和右半部分分别进行归并排序',
      codeSnippet: `  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  // 左右两部分各自有序`,
      highlightedLine: 1,
      highlightTerms: ['mergeSort'],
    },
    {
      id: 'merge',
      title: '合并操作',
      description: '创建临时数组，用双指针将两个有序子数组合并为一个有序数组',
      codeSnippet: `  const leftArr = arr.slice(left, mid + 1)
  const rightArr = arr.slice(mid + 1, right + 1)
  let i = 0, j = 0, k = left
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k++] = leftArr[i++]
    } else {
      arr[k++] = rightArr[j++]
    }
  }`,
      highlightedLine: 5,
      highlightTerms: ['leftArr[i]', 'rightArr[j]'],
    },
    {
      id: 'copy',
      title: '复制剩余',
      description: '将两个子数组中剩余的元素复制回原数组',
      codeSnippet: `  while (i < leftArr.length) arr[k++] = leftArr[i++]
  while (j < rightArr.length) arr[k++] = rightArr[j++]`,
      highlightedLine: 1,
      highlightTerms: ['leftArr[i]', 'arr[k]'],
    },
  ],
}
