import type { LearningModeConfig } from './types'

export const quickConfig: LearningModeConfig = {
  algorithmKey: 'quick',
  steps: [
    {
      id: 'init',
      title: '选择基准',
      description: '选择一个元素作为基准（pivot），通常选最后一个元素',
      codeSnippet: `function quickSort(arr, low, high) {
  if (low >= high) return
  const pivot = arr[high]
  let i = low - 1
}`,
      highlightedLine: 3,
      highlightTerms: ['pivot'],
      tips: ['pivot 的选择直接影响性能，三数取中法可以避免最坏情况'],
      complexity: { time: '平均 O(n log n)', space: 'O(log n)' },
    },
    {
      id: 'partition',
      title: '分区操作',
      description: '遍历数组，将小于 pivot 的元素移到左侧，大于的移到右侧',
      codeSnippet: `  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++
      swap(arr, i, j)
    }
  }`,
      highlightedLine: 2,
      highlightTerms: ['arr[j]', 'pivot'],
      tips: ['分区是快排的核心，一次分区就能确定一个元素的最终位置'],
    },
    {
      id: 'place',
      title: '放置基准',
      description: '将 pivot 放到正确位置（i+1），左侧都小于它，右侧都大于它',
      codeSnippet: `  swap(arr, i + 1, high)
  const pi = i + 1
  // arr[pi] 已在正确位置`,
      highlightedLine: 1,
      highlightTerms: ['pi', 'i + 1'],
      tips: ['分区完成后 pivot 就在最终位置，不需要再移动'],
    },
    {
      id: 'recurse',
      title: '递归排序',
      description: '对基准左侧和右侧的子数组分别递归执行快速排序',
      codeSnippet: `  quickSort(arr, low, pi - 1)   // 左半部分
  quickSort(arr, pi + 1, high)  // 右半部分
  // 最坏 O(n²)：数组已排序且 pivot 选首/尾`,
      highlightedLine: 1,
      highlightTerms: ['quickSort'],
      tips: ['快排平均性能最优，但最坏 O(n²) 发生在数组已排序且 pivot 选首尾时'],
      complexity: { time: '最坏 O(n²)', space: 'O(log n)' },
    },
  ],
}
