import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const heapConfig: LearningModeConfig = {
  algorithmKey: 'heap',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.heap.steps.init.title'),
      description: tStatic('learningSteps.heap.steps.init.description'),
      codeSnippet: `function heapSort(arr) {
  const n = arr.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i)
  }
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.heap.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heap.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.heap.steps.init.complexityTime'), space: tStatic('learningSteps.heap.steps.init.complexitySpace') },
    },
    {
      id: 'heapify',
      title: tStatic('learningSteps.heap.steps.heapify.title'),
      description: tStatic('learningSteps.heap.steps.heapify.description'),
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
      highlightTerms: tStatic('learningSteps.heap.steps.heapify.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heap.steps.heapify.tips').split('|'),
    },
    {
      id: 'extract',
      title: tStatic('learningSteps.heap.steps.extract.title'),
      description: tStatic('learningSteps.heap.steps.extract.description'),
      codeSnippet: `  for (let i = n - 1; i > 0; i--) {
    swap(arr, 0, i)
    heapify(arr, i, 0)
  }`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.heap.steps.extract.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heap.steps.extract.tips').split('|'),
    },
    {
      id: 'sorted',
      title: tStatic('learningSteps.heap.steps.sorted.title'),
      description: tStatic('learningSteps.heap.steps.sorted.description'),
      codeSnippet: `  // 每轮：堆顶 → 末尾
  // 堆大小减 1
  // 重新堆化
  // 时间复杂度 O(n log n)，空间 O(1)`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.heap.steps.sorted.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heap.steps.sorted.tips').split('|'),
      complexity: { time: tStatic('learningSteps.heap.steps.sorted.complexityTime'), space: tStatic('learningSteps.heap.steps.sorted.complexitySpace') },
    },
  ],
}
