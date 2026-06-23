/**
 * v20 M7 — learning config "queue" 中文 locale（自动从 src/configs/learning/queue.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const queueLearningSteps = {
  steps: {
    "structure": {
      title: '队列结构',
      description: '队列是先进先出（FIFO）的线性结构，从队尾入队、从队首出队',
      tips: '队列的应用：BFS 遍历、任务调度、消息队列、打印队列、缓冲区',
      highlightTerms: 'FIFO|队首|队尾',
      complexityTime: '所有操作 O(1)',
      complexitySpace: 'O(n)',
    },
    "enqueue": {
      title: '入队 Enqueue',
      description: '将新元素添加到队尾，队尾指针后移，时间复杂度 O(1)',
      tips: '循环队列可以避免"假溢出"问题，充分利用数组空间',
      highlightTerms: 'push|O(1)',
    },
    "dequeue": {
      title: '出队 Dequeue',
      description: '移除并返回队首元素，队首指针后移，时间复杂度 O(1)',
      tips: 'JavaScript 数组的 shift() 是 O(n)，用双指针可以避免这个问题',
      highlightTerms: 'queue.front++|队空',
    },
    "front": {
      title: '查看队首 Front',
      description: '仅查看队首元素而不移除，不改变队列状态，时间复杂度 O(1)',
      tips: '优先队列（堆）是队列的扩展：出队时返回优先级最高的元素',
      highlightTerms: 'items[queue.front]|只读取',
    },
    "clear": {
      title: '清空队列 Clear',
      description: '移除队列中所有元素，front 和 rear 指针重置。时间复杂度 O(1) 或 O(n)。',
      tips: '清空后队列为空|循环队列实现中需重置 front=0, rear=-1',
      highlightTerms: 'front|rear|clear',
      complexityTime: 'O(1) 或 O(n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
