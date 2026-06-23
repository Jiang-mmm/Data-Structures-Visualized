import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * 希尔排序学习配置
 */
export const shellConfig: LearningModeConfig = {
  algorithmKey: 'shell',
  steps: [
    {
      id: 'gap',
      title: tStatic('learningSteps.shell.steps.gap.title'),
      description: tStatic('learningSteps.shell.steps.gap.description'),
      codeSnippet: `function shellSort(arr) {
  let gap = 1
  while (gap < n / 3) gap = gap * 3 + 1
  // gap 序列: ..., 40, 13, 4, 1
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.shell.steps.gap.highlightTerms').split('|'),
      tips: tStatic('learningSteps.shell.steps.gap.tips').split('|'),
      complexity: { time: tStatic('learningSteps.shell.steps.gap.complexityTime'), space: tStatic('learningSteps.shell.steps.gap.complexitySpace') },
    },
    {
      id: 'gap-sort',
      title: tStatic('learningSteps.shell.steps.gap-sort.title'),
      description: tStatic('learningSteps.shell.steps.gap-sort.description'),
      codeSnippet: `  while (gap >= 1) {
    for (let i = gap; i < n; i++) {
      let j = i
      while (j >= gap && arr[j - gap] > arr[j]) {
        [arr[j], arr[j - gap]] = [arr[j - gap], arr[j]]
        j -= gap
      }
    }
    gap = Math.floor(gap / 3)
  }`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.shell.steps.gap-sort.highlightTerms').split('|'),
      tips: tStatic('learningSteps.shell.steps.gap-sort.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.shell.steps.complete.title'),
      description: tStatic('learningSteps.shell.steps.complete.description'),
      codeSnippet: `  // gap=1 时等价于插入排序
  // 但由于前面大间隔排序已使数组基本有序
  // 插入排序在近似有序数组上接近 O(n)`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.shell.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.shell.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.shell.steps.complete.complexityTime'), space: tStatic('learningSteps.shell.steps.complete.complexitySpace') },
    },
  ],
}
