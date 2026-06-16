import type { LearningModeConfig } from './types'

export const heapStructureConfig: LearningModeConfig = {
  algorithmKey: 'heapStructure',
  steps: [
    {
      id: 'structure',
      title: '堆结构',
      description: '堆是完全二叉树，用数组存储：父节点 i 的左子为 2i+1，右子为 2i+2，最大堆中父节点 ≥ 子节点',
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
      highlightTerms: ['完全二叉树', '≥'],
      tips: ['堆用数组存储完全二叉树，不需要指针，空间利用率高且缓存友好'],
      complexity: { time: '插入/提取 O(log n)，查看 O(1)', space: 'O(n)' },
    },
    {
      id: 'insert',
      title: '插入（上浮）',
      description: '新元素先放到数组末尾，然后与父节点比较，若大于父节点则交换上浮，直到满足堆性质',
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
      highlightTerms: ['上浮', 'swap'],
      tips: ['上浮操作最多比较 log n 次（树的高度），因此插入复杂度 O(log n)'],
    },
    {
      id: 'extract',
      title: '提取堆顶（下沉）',
      description: '将堆顶与末尾交换并移除，然后从堆顶开始与较大子节点比较下沉，直到满足堆性质',
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
      highlightTerms: ['下沉', 'largest'],
      tips: ['下沉时需要与较大的子节点交换，否则会破坏堆性质'],
    },
    {
      id: 'peek',
      title: '查看堆顶',
      description: '直接返回数组首元素，即最大值，时间复杂度 O(1)',
      codeSnippet: `function peek(heap) {
  if (heap.length === 0) throw '堆空'
  return heap[0]  // 最大值始终在堆顶
}`,
      highlightedLine: 3,
      highlightTerms: ['heap[0]', 'O(1)'],
      tips: ['堆的典型应用：优先队列、堆排序、Top-K 问题、中位数维护、Dijkstra 优化'],
    },
  ],
}
