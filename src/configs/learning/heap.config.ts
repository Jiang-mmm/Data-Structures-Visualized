import type { LearningModeConfig } from './types'

export const heapConfig: LearningModeConfig = {
  algorithmKey: 'heap',
  steps: [
    {
      id: 'init',
      title: '建堆',
      description: '从最后一个非叶子节点开始，自底向上执行堆化操作构建最大堆',
      codeSnippet: `function heapSort(arr) {
  const n = arr.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i)
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['heapify', 'n / 2'],
      tips: ['建堆的时间复杂度是 O(n)，不是 O(n log n)，因为底层节点不需要下沉'],
      complexity: { time: 'O(n log n)', space: 'O(1)' },
    },
    {
      id: 'heapify',
      title: '堆化操作',
      description: '比较父节点与左右子节点，将最大值上浮到父节点位置',
      codeSnippet: `function heapify(size, root) {
  let largest = root
  const left = 2 * root + 1
  const right = 2 * root + 2
  if (left < size && arr[left] > arr[largest])
    largest = left
  if (right < size && arr[right] > arr[largest])
    largest = right
}`,
      highlightedLine: 5,
      highlightTerms: ['largest', 'arr[left]'],
      tips: ['堆化是一个自顶向下的递归过程，最坏下沉到叶子节点，深度为 log n'],
    },
    {
      id: 'extract',
      title: '提取堆顶',
      description: '将堆顶（最大值）与末尾元素交换，缩小堆的范围',
      codeSnippet: `  for (let i = n - 1; i > 0; i--) {
    swap(arr, 0, i)
    heapify(arr, i, 0)
  }`,
      highlightedLine: 2,
      highlightTerms: ['swap', '0'],
      tips: ['每次交换后堆大小减 1，已排序区域从末尾向前增长'],
    },
    {
      id: 'sorted',
      title: '排序完成',
      description: '每次提取后重新堆化，重复直到堆大小为 1，数组完全有序',
      codeSnippet: `  // 每轮：堆顶 → 末尾
  // 堆大小减 1
  // 重新堆化
  // 时间复杂度 O(n log n)，空间 O(1)`,
      highlightedLine: 1,
      highlightTerms: ['O(n log n)'],
      tips: ['堆排序是唯一同时满足 O(n log n) 时间和 O(1) 空间的排序算法，但不稳定'],
      complexity: { time: 'O(n log n) 稳定', space: 'O(1)' },
    },
  ],
}
