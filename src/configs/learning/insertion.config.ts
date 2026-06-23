import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const insertionConfig: LearningModeConfig = {
  algorithmKey: 'insertion',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.insertion.steps.init.title'),
      description: tStatic('learningSteps.insertion.steps.init.description'),
      codeSnippet: `function insertionSort(arr) {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    let j = i
    // 将 arr[j] 插入到左侧正确位置
  }
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.insertion.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.insertion.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.insertion.steps.init.complexityTime'), space: tStatic('learningSteps.insertion.steps.init.complexitySpace') },
    },
    {
      id: 'compare',
      title: tStatic('learningSteps.insertion.steps.compare.title'),
      description: tStatic('learningSteps.insertion.steps.compare.description'),
      codeSnippet: `    while (j > 0) {
      if (arr[j - 1] > arr[j]) {
        // 左侧元素更大，需要交换
      } else {
        break  // 已找到正确位置
      }
    }`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.insertion.steps.compare.highlightTerms').split('|'),
      tips: tStatic('learningSteps.insertion.steps.compare.tips').split('|'),
    },
    {
      id: 'shift',
      title: tStatic('learningSteps.insertion.steps.shift.title'),
      description: tStatic('learningSteps.insertion.steps.shift.description'),
      codeSnippet: `      const temp = arr[j]
      arr[j] = arr[j - 1]
      arr[j - 1] = temp
      j--`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.insertion.steps.shift.highlightTerms').split('|'),
      tips: tStatic('learningSteps.insertion.steps.shift.tips').split('|'),
    },
    {
      id: 'sorted',
      title: tStatic('learningSteps.insertion.steps.sorted.title'),
      description: tStatic('learningSteps.insertion.steps.sorted.description'),
      codeSnippet: `  // 第 i 轮结束后
  // arr[0..i] 已排序
  // 下一轮 i++，取下一个未排序元素
  // 最佳情况 O(n)：数组已排序时只需一次比较`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.insertion.steps.sorted.highlightTerms').split('|'),
      tips: tStatic('learningSteps.insertion.steps.sorted.tips').split('|'),
      complexity: { time: tStatic('learningSteps.insertion.steps.sorted.complexityTime'), space: tStatic('learningSteps.insertion.steps.sorted.complexitySpace') },
    },
  ],
}
