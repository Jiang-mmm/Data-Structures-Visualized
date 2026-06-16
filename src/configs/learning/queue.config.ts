import type { LearningModeConfig } from './types'

export const queueConfig: LearningModeConfig = {
  algorithmKey: 'queue',
  steps: [
    {
      id: 'structure',
      title: '队列结构',
      description: '队列是先进先出（FIFO）的线性结构，从队尾入队、从队首出队',
      codeSnippet: `// 队列：先进先出 FIFO
//  出队 ← [3] [5] [9] [12] ← 入队
//        队首(Front)    队尾(Rear)`,
      highlightedLine: 2,
      highlightTerms: ['FIFO', '队首', '队尾'],
      tips: ['队列的应用：BFS 遍历、任务调度、消息队列、打印队列、缓冲区'],
      complexity: { time: '所有操作 O(1)', space: 'O(n)' },
    },
    {
      id: 'enqueue',
      title: '入队 Enqueue',
      description: '将新元素添加到队尾，队尾指针后移，时间复杂度 O(1)',
      codeSnippet: `function enqueue(queue, value) {
  queue.items.push(value)
  queue.rear++
  // 新元素进入队尾，等待被处理
}`,
      highlightedLine: 2,
      highlightTerms: ['push', 'O(1)'],
      tips: ['循环队列可以避免"假溢出"问题，充分利用数组空间'],
    },
    {
      id: 'dequeue',
      title: '出队 Dequeue',
      description: '移除并返回队首元素，队首指针后移，时间复杂度 O(1)',
      codeSnippet: `function dequeue(queue) {
  if (queue.front > queue.rear) throw '队空'
  const value = queue.items[queue.front]
  queue.front++
  return value  // 返回队首元素
}`,
      highlightedLine: 4,
      highlightTerms: ['queue.front++', '队空'],
      tips: ['JavaScript 数组的 shift() 是 O(n)，用双指针可以避免这个问题'],
    },
    {
      id: 'front',
      title: '查看队首 Front',
      description: '仅查看队首元素而不移除，不改变队列状态，时间复杂度 O(1)',
      codeSnippet: `function front(queue) {
  if (queue.front > queue.rear) throw '队空'
  return queue.items[queue.front]
  // 只读取，不修改指针
}`,
      highlightedLine: 3,
      highlightTerms: ['items[queue.front]', '只读取'],
      tips: ['优先队列（堆）是队列的扩展：出队时返回优先级最高的元素'],
    },
  ],
}
