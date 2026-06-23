import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const selectionConfig: LearningModeConfig = {
  algorithmKey: 'selection',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.selection.steps.init.title'),
      description: tStatic('learningSteps.selection.steps.init.description'),
      codeSnippet: `function selectionSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    // 从 i+1 开始寻找最小值
  }
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.selection.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.selection.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.selection.steps.init.complexityTime'), space: tStatic('learningSteps.selection.steps.init.complexitySpace') },
    },
    {
      id: 'scan',
      title: tStatic('learningSteps.selection.steps.scan.title'),
      description: tStatic('learningSteps.selection.steps.scan.description'),
      codeSnippet: `    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j  // 更新最小值索引
      }
    }`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.selection.steps.scan.highlightTerms').split('|'),
      tips: tStatic('learningSteps.selection.steps.scan.tips').split('|'),
      complexity: { time: tStatic('learningSteps.selection.steps.scan.complexityTime'), space: tStatic('learningSteps.selection.steps.scan.complexitySpace') },
    },
    {
      id: 'swap',
      title: tStatic('learningSteps.selection.steps.swap.title'),
      description: tStatic('learningSteps.selection.steps.swap.description'),
      codeSnippet: `    if (minIdx !== i) {
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp
    }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.selection.steps.swap.highlightTerms').split('|'),
      tips: tStatic('learningSteps.selection.steps.swap.tips').split('|'),
    },
    {
      id: 'progress',
      title: tStatic('learningSteps.selection.steps.progress.title'),
      description: tStatic('learningSteps.selection.steps.progress.description'),
      codeSnippet: `  // 第 i 轮结束后
  // arr[0..i] 已排序（每轮确定一个位置）
  // arr[i+1..n-1] 未排序
  // 继续 i++ 进入下一轮`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.selection.steps.progress.highlightTerms').split('|'),
      tips: tStatic('learningSteps.selection.steps.progress.tips').split('|'),
    },
  ],
}
