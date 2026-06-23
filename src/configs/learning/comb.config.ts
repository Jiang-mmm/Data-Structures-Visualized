import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

/**
 * 梳排序学习配置
 */
export const combConfig: LearningModeConfig = {
  algorithmKey: 'comb',
  steps: [
    {
      id: 'gap',
      title: tStatic('learningSteps.comb.steps.gap.title'),
      description: tStatic('learningSteps.comb.steps.gap.description'),
      codeSnippet: `function combSort(arr) {
  let gap = arr.length
  const shrink = 1.3
  let swapped = true
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.comb.steps.gap.highlightTerms').split('|'),
      tips: tStatic('learningSteps.comb.steps.gap.tips').split('|'),
      complexity: { time: tStatic('learningSteps.comb.steps.gap.complexityTime'), space: tStatic('learningSteps.comb.steps.gap.complexitySpace') },
    },
    {
      id: 'compare-swap',
      title: tStatic('learningSteps.comb.steps.compare-swap.title'),
      description: tStatic('learningSteps.comb.steps.compare-swap.description'),
      codeSnippet: `  while (gap > 1 || swapped) {
    gap = Math.floor(gap / shrink)
    if (gap < 1) gap = 1
    swapped = false
    for (let i = 0; i + gap < n; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]]
        swapped = true
      }
    }
  }`,
      highlightedLine: 7,
      highlightTerms: tStatic('learningSteps.comb.steps.compare-swap.highlightTerms').split('|'),
      tips: tStatic('learningSteps.comb.steps.compare-swap.tips').split('|'),
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.comb.steps.complete.title'),
      description: tStatic('learningSteps.comb.steps.complete.description'),
      codeSnippet: `  // gap=1 且 swapped=false 时退出
  // 最后一轮 gap=1 等价于冒泡排序
  // 但此时数组已基本有序，交换很少`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.comb.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.comb.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.comb.steps.complete.complexityTime'), space: tStatic('learningSteps.comb.steps.complete.complexitySpace') },
    },
  ],
}
