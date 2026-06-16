import type { LearningModeConfig } from './types'

export const selectionConfig: LearningModeConfig = {
  algorithmKey: 'selection',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '外层循环从数组起始位置开始，每轮从未排序部分选出最小元素',
      codeSnippet: `function selectionSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    // 从 i+1 开始寻找最小值
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['minIdx', 'i'],
      tips: ['选择排序每轮只做一次交换，这是它与冒泡排序的关键区别'],
      complexity: { time: 'O(n²)', space: 'O(1)' },
    },
    {
      id: 'scan',
      title: '扫描未排序区域',
      description: '遍历 i+1 到 n-1 的元素，找到最小值的索引',
      codeSnippet: `    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j  // 更新最小值索引
      }
    }`,
      highlightedLine: 2,
      highlightTerms: ['arr[j]', 'arr[minIdx]', 'minIdx'],
      tips: ['内层循环只做比较，不做交换，因此移动次数为 O(n)'],
      complexity: { time: 'O(n²)', space: 'O(1)' },
    },
    {
      id: 'swap',
      title: '交换最小值',
      description: '将找到的最小值与当前位置 i 交换，使其归位',
      codeSnippet: `    if (minIdx !== i) {
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp
    }`,
      highlightedLine: 3,
      highlightTerms: ['arr[i]', 'arr[minIdx]', 'temp'],
      tips: ['选择排序是不稳定的排序：相等元素的相对顺序可能改变'],
    },
    {
      id: 'progress',
      title: '逐步缩小范围',
      description: '每轮结束后，已排序区域扩大一位，下一轮从未排序区域继续选择',
      codeSnippet: `  // 第 i 轮结束后
  // arr[0..i] 已排序（每轮确定一个位置）
  // arr[i+1..n-1] 未排序
  // 继续 i++ 进入下一轮`,
      highlightedLine: 2,
      highlightTerms: ['已排序', '未排序'],
      tips: ['无论输入数据如何，选择排序总是 O(n²)，没有最好情况优化'],
    },
  ],
}
