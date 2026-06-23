import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const radixConfig: LearningModeConfig = {
  algorithmKey: 'radix',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.radix.steps.init.title'),
      description: tStatic('learningSteps.radix.steps.init.description'),
      codeSnippet: `function radixSort(arr) {
  const max = Math.max(...arr)
  let exp = 1  // 当前位数：个位、十位、百位...
  // 当 max/exp > 0 时继续处理
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.radix.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.radix.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.radix.steps.init.complexityTime'), space: tStatic('learningSteps.radix.steps.init.complexitySpace') },
    },
    {
      id: 'count',
      title: tStatic('learningSteps.radix.steps.count.title'),
      description: tStatic('learningSteps.radix.steps.count.description'),
      codeSnippet: `  const count = new Array(10).fill(0)
  for (let i = 0; i < n; i++) {
    const digit = Math.floor(arr[i] / exp) % 10
    count[digit]++
  }
  // 累加计数，转换为位置索引
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1]
  }`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.radix.steps.count.highlightTerms').split('|'),
      tips: tStatic('learningSteps.radix.steps.count.tips').split('|'),
    },
    {
      id: 'place',
      title: tStatic('learningSteps.radix.steps.place.title'),
      description: tStatic('learningSteps.radix.steps.place.description'),
      codeSnippet: `  const output = new Array(n)
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10
    output[count[digit] - 1] = arr[i]
    count[digit]--
  }`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.radix.steps.place.highlightTerms').split('|'),
      tips: tStatic('learningSteps.radix.steps.place.tips').split('|'),
    },
    {
      id: 'nextdigit',
      title: tStatic('learningSteps.radix.steps.nextdigit.title'),
      description: tStatic('learningSteps.radix.steps.nextdigit.description'),
      codeSnippet: `  for (let i = 0; i < n; i++) {
    arr[i] = output[i]
  }
  exp *= 10  // 个位→十位→百位...
  // 重复直到所有位处理完毕`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.radix.steps.nextdigit.highlightTerms').split('|'),
      tips: tStatic('learningSteps.radix.steps.nextdigit.tips').split('|'),
      complexity: { time: tStatic('learningSteps.radix.steps.nextdigit.complexityTime'), space: tStatic('learningSteps.radix.steps.nextdigit.complexitySpace') },
    },
  ],
}
