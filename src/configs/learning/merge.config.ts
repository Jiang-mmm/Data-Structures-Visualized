import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const mergeConfig: LearningModeConfig = {
  algorithmKey: 'merge',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.merge.steps.init.title'),
      description: tStatic('learningSteps.merge.steps.init.description'),
      codeSnippet: `function mergeSort(arr, left, right) {
  if (left >= right) return
  const mid = Math.floor((left + right) / 2)
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.merge.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.merge.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.merge.steps.init.complexityTime'), space: tStatic('learningSteps.merge.steps.init.complexitySpace') },
    },
    {
      id: 'split',
      title: tStatic('learningSteps.merge.steps.split.title'),
      description: tStatic('learningSteps.merge.steps.split.description'),
      codeSnippet: `  mergeSort(arr, left, mid)
  mergeSort(arr, mid + 1, right)
  // 左右两部分各自有序`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.merge.steps.split.highlightTerms').split('|'),
      tips: tStatic('learningSteps.merge.steps.split.tips').split('|'),
    },
    {
      id: 'merge',
      title: tStatic('learningSteps.merge.steps.merge.title'),
      description: tStatic('learningSteps.merge.steps.merge.description'),
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
      highlightTerms: tStatic('learningSteps.merge.steps.merge.highlightTerms').split('|'),
      tips: tStatic('learningSteps.merge.steps.merge.tips').split('|'),
    },
    {
      id: 'copy',
      title: tStatic('learningSteps.merge.steps.copy.title'),
      description: tStatic('learningSteps.merge.steps.copy.description'),
      codeSnippet: `  while (i < leftArr.length) arr[k++] = leftArr[i++]
  while (j < rightArr.length) arr[k++] = rightArr[j++]
  // 合并完成，arr[left..right] 有序`,
      highlightedLine: 1,
      highlightTerms: tStatic('learningSteps.merge.steps.copy.highlightTerms').split('|'),
      tips: tStatic('learningSteps.merge.steps.copy.tips').split('|'),
      complexity: { time: tStatic('learningSteps.merge.steps.copy.complexityTime'), space: tStatic('learningSteps.merge.steps.copy.complexitySpace') },
    },
  ],
}
