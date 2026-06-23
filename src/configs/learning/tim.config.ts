import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * TimSort 学习配置
 */
export const timConfig: LearningModeConfig = {
  algorithmKey: 'tim',
  steps: [
    {
      id: 'run',
      title: tStatic('learningSteps.tim.steps.run.title'),
      description: tStatic('learningSteps.tim.steps.run.description'),
      codeSnippet: `function timSort(arr) {
  const RUN = 32
  for (let i = 0; i < n; i += RUN) {
    insertionSort(arr, i, Math.min(i + RUN - 1, n - 1))
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.tim.steps.run.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tim.steps.run.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tim.steps.run.complexityTime'), space: tStatic('learningSteps.tim.steps.run.complexitySpace') },
    },
    {
      id: 'merge',
      title: tStatic('learningSteps.tim.steps.merge.title'),
      description: tStatic('learningSteps.tim.steps.merge.description'),
      codeSnippet: `  for (let size = RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1
      const right = Math.min(left + 2 * size - 1, n - 1)
      merge(arr, left, mid, right)
    }
  }`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.tim.steps.merge.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tim.steps.merge.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.tim.steps.complete.title'),
      description: tStatic('learningSteps.tim.steps.complete.description'),
      codeSnippet: `  // TimSort = 插入排序（小规模）+ 归并排序（大规模）
  // Python/Java 默认排序算法
  // 最佳情况 O(n)，最坏 O(n log n)`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.tim.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.tim.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.tim.steps.complete.complexityTime'), space: tStatic('learningSteps.tim.steps.complete.complexitySpace') },
    },
  ],
}
