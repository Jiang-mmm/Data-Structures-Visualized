import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const countingConfig: LearningModeConfig = {
  algorithmKey: 'counting',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.counting.steps.init.title'),
      description: tStatic('learningSteps.counting.steps.init.description'),
      codeSnippet: `function countingSort(arr) {
  const max = Math.max(...arr)
  const min = Math.min(...arr)
  const range = max - min + 1
  // 计数数组大小为 range
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.counting.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.counting.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.counting.steps.init.complexityTime'), space: tStatic('learningSteps.counting.steps.init.complexitySpace') },
    },
    {
      id: 'count',
      title: tStatic('learningSteps.counting.steps.count.title'),
      description: tStatic('learningSteps.counting.steps.count.description'),
      codeSnippet: `  const count = new Array(range).fill(0)
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++
  }
  // count[j] 现在表示值 (j + min) 出现的次数`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.counting.steps.count.highlightTerms').split('|'),
      tips: tStatic('learningSteps.counting.steps.count.tips').split('|'),
    },
    {
      id: 'prefix',
      title: tStatic('learningSteps.counting.steps.prefix.title'),
      description: tStatic('learningSteps.counting.steps.prefix.description'),
      codeSnippet: `  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1]
  }
  // 现在 count[j] 表示值 (j + min) 在排序后的最后一个位置`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.counting.steps.prefix.highlightTerms').split('|'),
      tips: tStatic('learningSteps.counting.steps.prefix.tips').split('|'),
    },
    {
      id: 'place',
      title: tStatic('learningSteps.counting.steps.place.title'),
      description: tStatic('learningSteps.counting.steps.place.description'),
      codeSnippet: `  const output = new Array(n)
  for (let i = n - 1; i >= 0; i--) {
    const idx = arr[i] - min
    output[count[idx] - 1] = arr[i]
    count[idx]--
  }
  // 逆序遍历保证相同值的元素保持原有相对顺序`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.counting.steps.place.highlightTerms').split('|'),
      tips: tStatic('learningSteps.counting.steps.place.tips').split('|'),
    },
    {
      id: 'copy',
      title: tStatic('learningSteps.counting.steps.copy.title'),
      description: tStatic('learningSteps.counting.steps.copy.description'),
      codeSnippet: `  for (let i = 0; i < n; i++) {
    arr[i] = output[i]
  }
  return arr
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.counting.steps.copy.highlightTerms').split('|'),
      tips: tStatic('learningSteps.counting.steps.copy.tips').split('|'),
    },
  ],
}
