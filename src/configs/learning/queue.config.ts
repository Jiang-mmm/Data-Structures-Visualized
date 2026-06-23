import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const queueConfig: LearningModeConfig = {
  algorithmKey: 'queue',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.queue.steps.structure.title'),
      description: tStatic('learningSteps.queue.steps.structure.description'),
      codeSnippet: `// 队列：先进先出 FIFO
//  出队 ← [3] [5] [9] [12] ← 入队
//        队首(Front)    队尾(Rear)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.queue.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.queue.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.queue.steps.structure.complexityTime'), space: tStatic('learningSteps.queue.steps.structure.complexitySpace') },
    },
    {
      id: 'enqueue',
      title: tStatic('learningSteps.queue.steps.enqueue.title'),
      description: tStatic('learningSteps.queue.steps.enqueue.description'),
      codeSnippet: `function enqueue(queue, value) {
  queue.items.push(value)
  queue.rear++
  // 新元素进入队尾，等待被处理
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.queue.steps.enqueue.highlightTerms').split('|'),
      tips: tStatic('learningSteps.queue.steps.enqueue.tips').split('|'),
    },
    {
      id: 'dequeue',
      title: tStatic('learningSteps.queue.steps.dequeue.title'),
      description: tStatic('learningSteps.queue.steps.dequeue.description'),
      codeSnippet: `function dequeue(queue) {
  if (queue.front > queue.rear) throw '队空'
  const value = queue.items[queue.front]
  queue.front++
  return value  // 返回队首元素
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.queue.steps.dequeue.highlightTerms').split('|'),
      tips: tStatic('learningSteps.queue.steps.dequeue.tips').split('|'),
    },
    {
      id: 'front',
      title: tStatic('learningSteps.queue.steps.front.title'),
      description: tStatic('learningSteps.queue.steps.front.description'),
      codeSnippet: `function front(queue) {
  if (queue.front > queue.rear) throw '队空'
  return queue.items[queue.front]
  // 只读取，不修改指针
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.queue.steps.front.highlightTerms').split('|'),
      tips: tStatic('learningSteps.queue.steps.front.tips').split('|'),
    },
    {
      id: 'clear',
      title: tStatic('learningSteps.queue.steps.clear.title'),
      description: tStatic('learningSteps.queue.steps.clear.description'),
      codeSnippet: `function clear(queue) {
  queue.front = 0
  queue.rear = -1
  // 或 queue.items = []
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.queue.steps.clear.highlightTerms').split('|'),
      tips: tStatic('learningSteps.queue.steps.clear.tips').split('|'),
      complexity: { time: tStatic('learningSteps.queue.steps.clear.complexityTime'), space: tStatic('learningSteps.queue.steps.clear.complexitySpace') },
    },
  ],
}
