import type { LearningModeConfig } from './types'

export const insertionConfig: LearningModeConfig = {
  algorithmKey: 'insertion',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '从第二个元素开始（i=1），将当前元素插入到左侧已排序区域的正确位置',
      codeSnippet: `function insertionSort(arr) {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    let j = i
    // 将 arr[j] 插入到左侧正确位置
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['i = 1', 'j'],
      tips: ['插入排序天然地将数组分为"已排序"和"未排序"两部分'],
      complexity: { time: 'O(n²)', space: 'O(1)' },
    },
    {
      id: 'compare',
      title: '向前比较',
      description: '将当前元素与左侧相邻元素比较，如果左侧更大则交换',
      codeSnippet: `    while (j > 0) {
      if (arr[j - 1] > arr[j]) {
        // 左侧元素更大，需要交换
      } else {
        break  // 已找到正确位置
      }
    }`,
      highlightedLine: 2,
      highlightTerms: ['arr[j - 1]', 'arr[j]'],
      tips: ['一旦遇到不大于当前元素的值就停止，这是插入排序的最佳情况优化'],
    },
    {
      id: 'shift',
      title: '移动元素',
      description: '交换相邻元素，将当前元素逐步向左移动到正确位置',
      codeSnippet: `      const temp = arr[j]
      arr[j] = arr[j - 1]
      arr[j - 1] = temp
      j--`,
      highlightedLine: 4,
      highlightTerms: ['temp', 'j--'],
      tips: ['实际工程中常用"移位"代替"交换"来减少赋值次数'],
    },
    {
      id: 'sorted',
      title: '已排序区域增长',
      description: '每轮结束后 arr[0..i] 有序，继续处理下一个元素',
      codeSnippet: `  // 第 i 轮结束后
  // arr[0..i] 已排序
  // 下一轮 i++，取下一个未排序元素
  // 最佳情况 O(n)：数组已排序时只需一次比较`,
      highlightedLine: 2,
      highlightTerms: ['已排序', 'O(n)'],
      tips: ['插入排序对近乎有序的数组效率极高，接近 O(n)，常用于混合排序算法的子过程'],
      complexity: { time: '最好 O(n)，最坏 O(n²)', space: 'O(1)' },
    },
  ],
}
