import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const heapStructureConfig: LearningModeConfig = {
  algorithmKey: 'heapStructure',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.heapStructure.steps.structure.title'),
      description: tStatic('learningSteps.heapStructure.steps.structure.description'),
      codeSnippet: `// 最大堆：父节点 ≥ 子节点
//       50
//      /  \\
//    30    40
//   /  \\
//  10   20
//
// 数组: [50, 30, 40, 10, 20]
// 父节点: (i-1)/2  左子: 2i+1  右子: 2i+2`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.heapStructure.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heapStructure.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.heapStructure.steps.structure.complexityTime'), space: tStatic('learningSteps.heapStructure.steps.structure.complexitySpace') },
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.heapStructure.steps.insert.title'),
      description: tStatic('learningSteps.heapStructure.steps.insert.description'),
      codeSnippet: `function insert(heap, value) {
  heap.push(value)
  let i = heap.length - 1
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2)
    if (heap[i] <= heap[parent]) break
    swap(heap, i, parent)  // 上浮
    i = parent
  }
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.heapStructure.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heapStructure.steps.insert.tips').split('|'),
    },
    {
      id: 'extract',
      title: tStatic('learningSteps.heapStructure.steps.extract.title'),
      description: tStatic('learningSteps.heapStructure.steps.extract.description'),
      codeSnippet: `function extractMax(heap) {
  const max = heap[0]
  heap[0] = heap[heap.length - 1]
  heap.pop()
  let i = 0
  while (true) {
    let largest = i
    const l = 2*i+1, r = 2*i+2
    if (l < heap.length && heap[l] > heap[largest])
      largest = l
    if (r < heap.length && heap[r] > heap[largest])
      largest = r
    if (largest === i) break
    swap(heap, i, largest)  // 下沉
    i = largest
  }
  return max
}`,
      highlightedLine: 12,
      highlightTerms: tStatic('learningSteps.heapStructure.steps.extract.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heapStructure.steps.extract.tips').split('|'),
    },
    {
      id: 'peek',
      title: tStatic('learningSteps.heapStructure.steps.peek.title'),
      description: tStatic('learningSteps.heapStructure.steps.peek.description'),
      codeSnippet: `function peek(heap) {
  if (heap.length === 0) throw '堆空'
  return heap[0]  // 最大值始终在堆顶
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.heapStructure.steps.peek.highlightTerms').split('|'),
      tips: tStatic('learningSteps.heapStructure.steps.peek.tips').split('|'),
    },
  ],
}
