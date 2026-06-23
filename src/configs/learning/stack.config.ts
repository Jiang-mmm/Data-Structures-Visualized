import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const stackConfig: LearningModeConfig = {
  algorithmKey: 'stack',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.stack.steps.structure.title'),
      description: tStatic('learningSteps.stack.steps.structure.description'),
      codeSnippet: `// 栈：后进先出 LIFO
//    ┌───┐
//    │ 9 │ ← 栈顶 (Top)
//    ├───┤
//    │ 5 │
//    ├───┤
//    │ 3 │
//    └───┘ ← 栈底 (Bottom)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.stack.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.stack.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.stack.steps.structure.complexityTime'), space: tStatic('learningSteps.stack.steps.structure.complexitySpace') },
    },
    {
      id: 'push',
      title: tStatic('learningSteps.stack.steps.push.title'),
      description: tStatic('learningSteps.stack.steps.push.description'),
      codeSnippet: `function push(stack, value) {
  stack.top++
  stack.items[stack.top] = value
  // 栈顶指针上移，新元素成为栈顶
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.stack.steps.push.highlightTerms').split('|'),
      tips: tStatic('learningSteps.stack.steps.push.tips').split('|'),
    },
    {
      id: 'pop',
      title: tStatic('learningSteps.stack.steps.pop.title'),
      description: tStatic('learningSteps.stack.steps.pop.description'),
      codeSnippet: `function pop(stack) {
  if (stack.top < 0) throw '栈空'
  const value = stack.items[stack.top]
  stack.top--
  return value  // 返回原栈顶元素
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.stack.steps.pop.highlightTerms').split('|'),
      tips: tStatic('learningSteps.stack.steps.pop.tips').split('|'),
    },
    {
      id: 'peek',
      title: tStatic('learningSteps.stack.steps.peek.title'),
      description: tStatic('learningSteps.stack.steps.peek.description'),
      codeSnippet: `function peek(stack) {
  if (stack.top < 0) throw '栈空'
  return stack.items[stack.top]
  // 只读取，不修改栈顶指针
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.stack.steps.peek.highlightTerms').split('|'),
      tips: tStatic('learningSteps.stack.steps.peek.tips').split('|'),
    },
    {
      id: 'clear',
      title: tStatic('learningSteps.stack.steps.clear.title'),
      description: tStatic('learningSteps.stack.steps.clear.description'),
      codeSnippet: `function clear(stack) {
  stack.top = -1
  // 或 stack.items = []
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.stack.steps.clear.highlightTerms').split('|'),
      tips: tStatic('learningSteps.stack.steps.clear.tips').split('|'),
      complexity: { time: tStatic('learningSteps.stack.steps.clear.complexityTime'), space: tStatic('learningSteps.stack.steps.clear.complexitySpace') },
    },
  ],
}
