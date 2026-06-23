/**
 * v20 M7 — learning config "stack" 中文 locale（自动从 src/configs/learning/stack.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const stackLearningSteps = {
  steps: {
    "structure": {
      title: '栈结构',
      description: '栈是后进先出（LIFO）的线性结构，只能在栈顶进行插入和删除操作',
      tips: '栈的应用：函数调用栈、括号匹配、表达式求值、浏览器前进/后退',
      highlightTerms: 'LIFO|栈顶',
      complexityTime: '所有操作 O(1)',
      complexitySpace: 'O(n)',
    },
    "push": {
      title: '入栈 Push',
      description: '将新元素放到栈顶，栈顶指针上移，时间复杂度 O(1)',
      tips: '入栈前应检查是否栈满（固定大小数组实现时）',
      highlightTerms: 'stack.top|O(1)',
    },
    "pop": {
      title: '出栈 Pop',
      description: '移除并返回栈顶元素，栈顶指针下移，时间复杂度 O(1)',
      tips: '出栈前必须检查栈是否为空，否则会产生下溢错误',
      highlightTerms: 'stack.top--|栈空',
    },
    "peek": {
      title: '查看栈顶 Peek',
      description: '仅查看栈顶元素而不移除，不改变栈的状态，时间复杂度 O(1)',
      tips: 'JavaScript 中用数组模拟栈：push/pop 对应入栈/出栈',
      highlightTerms: 'items[stack.top]|只读取',
    },
    "clear": {
      title: '清空栈 Clear',
      description: '将栈中所有元素移除，栈顶指针重置为 -1。时间复杂度 O(1)（重置指针）或 O(n)（清空数组）。',
      tips: '清空后栈为空，再次 pop/peek 会报下溢错误|数组实现中可复用空间只需重置 top 指针',
      highlightTerms: 'top|clear',
      complexityTime: 'O(1) 或 O(n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
