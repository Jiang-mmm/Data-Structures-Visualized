import type { LearningModeConfig } from './types'

export const stackConfig: LearningModeConfig = {
  algorithmKey: 'stack',
  steps: [
    {
      id: 'structure',
      title: '栈结构',
      description: '栈是后进先出（LIFO）的线性结构，只能在栈顶进行插入和删除操作',
      codeSnippet: `// 栈：后进先出 LIFO
//    ┌───┐
//    │ 9 │ ← 栈顶 (Top)
//    ├───┤
//    │ 5 │
//    ├───┤
//    │ 3 │
//    └───┘ ← 栈底 (Bottom)`,
      highlightedLine: 2,
      highlightTerms: ['LIFO', '栈顶'],
      tips: ['栈的应用：函数调用栈、括号匹配、表达式求值、浏览器前进/后退'],
      complexity: { time: '所有操作 O(1)', space: 'O(n)' },
    },
    {
      id: 'push',
      title: '入栈 Push',
      description: '将新元素放到栈顶，栈顶指针上移，时间复杂度 O(1)',
      codeSnippet: `function push(stack, value) {
  stack.top++
  stack.items[stack.top] = value
  // 栈顶指针上移，新元素成为栈顶
}`,
      highlightedLine: 3,
      highlightTerms: ['stack.top', 'O(1)'],
      tips: ['入栈前应检查是否栈满（固定大小数组实现时）'],
    },
    {
      id: 'pop',
      title: '出栈 Pop',
      description: '移除并返回栈顶元素，栈顶指针下移，时间复杂度 O(1)',
      codeSnippet: `function pop(stack) {
  if (stack.top < 0) throw '栈空'
  const value = stack.items[stack.top]
  stack.top--
  return value  // 返回原栈顶元素
}`,
      highlightedLine: 4,
      highlightTerms: ['stack.top--', '栈空'],
      tips: ['出栈前必须检查栈是否为空，否则会产生下溢错误'],
    },
    {
      id: 'peek',
      title: '查看栈顶 Peek',
      description: '仅查看栈顶元素而不移除，不改变栈的状态，时间复杂度 O(1)',
      codeSnippet: `function peek(stack) {
  if (stack.top < 0) throw '栈空'
  return stack.items[stack.top]
  // 只读取，不修改栈顶指针
}`,
      highlightedLine: 3,
      highlightTerms: ['items[stack.top]', '只读取'],
      tips: ['JavaScript 中用数组模拟栈：push/pop 对应入栈/出栈'],
    },
    {
      id: 'clear',
      title: '清空栈 Clear',
      description: '将栈中所有元素移除，栈顶指针重置为 -1。时间复杂度 O(1)（重置指针）或 O(n)（清空数组）。',
      codeSnippet: `function clear(stack) {
  stack.top = -1
  // 或 stack.items = []
}`,
      highlightedLine: 2,
      highlightTerms: ['top', 'clear'],
      tips: ['清空后栈为空，再次 pop/peek 会报下溢错误', '数组实现中可复用空间只需重置 top 指针'],
      complexity: { time: 'O(1) 或 O(n)', space: 'O(1)' },
    },
  ],
}
