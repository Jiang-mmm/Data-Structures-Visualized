import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const bucketConfig: LearningModeConfig = {
  algorithmKey: 'bucket',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.bucket.steps.init.title'),
      description: tStatic('learningSteps.bucket.steps.init.description'),
      codeSnippet: `function bucketSort(arr) {
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const bucketCount = Math.floor(Math.sqrt(n)) + 1
  const bucketRange = (max - min + 1) / bucketCount
  const buckets = Array.from({ length: bucketCount }, () => [])
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.bucket.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bucket.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bucket.steps.init.complexityTime'), space: tStatic('learningSteps.bucket.steps.init.complexitySpace') },
    },
    {
      id: 'distribute',
      title: tStatic('learningSteps.bucket.steps.distribute.title'),
      description: tStatic('learningSteps.bucket.steps.distribute.description'),
      codeSnippet: `  for (let i = 0; i < n; i++) {
    const bucketIdx = Math.min(
      Math.floor((arr[i] - min) / bucketRange),
      bucketCount - 1
    )
    buckets[bucketIdx].push(arr[i])
  }`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.bucket.steps.distribute.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bucket.steps.distribute.tips').split('|'),
    },
    {
      id: 'sort',
      title: tStatic('learningSteps.bucket.steps.sort.title'),
      description: tStatic('learningSteps.bucket.steps.sort.description'),
      codeSnippet: `  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, c) => a - c)
    // 每个桶内部独立排序
    // 数据均匀分布时每个桶元素很少
  }`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.bucket.steps.sort.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bucket.steps.sort.tips').split('|'),
    },
    {
      id: 'merge',
      title: tStatic('learningSteps.bucket.steps.merge.title'),
      description: tStatic('learningSteps.bucket.steps.merge.description'),
      codeSnippet: `  let idx = 0
  for (let b = 0; b < bucketCount; b++) {
    for (let j = 0; j < buckets[b].length; j++) {
      arr[idx++] = buckets[b][j]
    }
  }
  // 合并完成，数组已排序`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.bucket.steps.merge.highlightTerms').split('|'),
      tips: tStatic('learningSteps.bucket.steps.merge.tips').split('|'),
      complexity: { time: tStatic('learningSteps.bucket.steps.merge.complexityTime'), space: tStatic('learningSteps.bucket.steps.merge.complexitySpace') },
    },
  ],
}
