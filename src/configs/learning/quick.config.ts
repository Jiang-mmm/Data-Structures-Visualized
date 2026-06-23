import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const quickConfig: LearningModeConfig = {
  algorithmKey: 'quick',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.quick.steps.init.title'),
      description: tStatic('learningSteps.quick.steps.init.description'),
      codeSnippet: `function quickSort(arr, low, high) {
  if (low >= high) return
  const pivot = arr[high]
  let i = low - 1
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.quick.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.quick.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.quick.steps.init.complexityTime'), space: tStatic('learningSteps.quick.steps.init.complexitySpace') },
    },
    {
      id: 'partition',
      title: tStatic('learningSteps.quick.steps.partition.title'),
      description: tStatic('learningSteps.quick.steps.partition.description'),
      codeSnippet: `  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++
      swap(arr, i, j)
    }
  }`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.quick.steps.partition.highlightTerms').split('|'),
      tips: tStatic('learningSteps.quick.steps.partition.tips').split('|'),
    },
    {
      id: 'place',
      title: tStatic('learningSteps.quick.steps.place.title'),
      description: tStatic('learningSteps.quick.steps.place.description'),
      codeSnippet: `  swap(arr, i + 1, high)
  const pi = i + 1
  // arr[pi] 已在正确位置`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.quick.steps.place.highlightTerms').split('|'),
      tips: tStatic('learningSteps.quick.steps.place.tips').split('|'),
    },
    {
      id: 'recurse',
      title: tStatic('learningSteps.quick.steps.recurse.title'),
      description: tStatic('learningSteps.quick.steps.recurse.description'),
      codeSnippet: `  quickSort(arr, low, pi - 1)   // 左半部分
  quickSort(arr, pi + 1, high)  // 右半部分
  // 最坏 O(n²)：数组已排序且 pivot 选首/尾`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.quick.steps.recurse.highlightTerms').split('|'),
      tips: tStatic('learningSteps.quick.steps.recurse.tips').split('|'),
      complexity: { time: tStatic('learningSteps.quick.steps.recurse.complexityTime'), space: tStatic('learningSteps.quick.steps.recurse.complexitySpace') },
    },
  ],
}
