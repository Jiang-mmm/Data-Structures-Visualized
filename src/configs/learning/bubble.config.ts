import type { LearningModeConfig } from './types'

export const bubbleConfig: LearningModeConfig = {
  algorithmKey: 'bubble',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '外层循环从左到右遍历数组，每轮将最大值"冒泡"到末尾',
      codeSnippet: `function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
    }
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['n - 1'],
    },
    {
      id: 'compare',
      title: '比较相邻元素',
      description: '比较 arr[j] 和 arr[j+1]，判断是否需要交换',
      codeSnippet: `    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // 需要交换
      }
    }`,
      highlightedLine: 2,
      highlightTerms: ['arr[j]', 'arr[j + 1]'],
    },
    {
      id: 'swap',
      title: '交换元素',
      description: '如果左侧元素大于右侧，交换两个元素的位置',
      codeSnippet: `      if (arr[j] > arr[j + 1]) {
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }`,
      highlightedLine: 2,
      highlightTerms: ['temp', 'arr[j]'],
    },
    {
      id: 'sorted',
      title: '已排序区域',
      description: '每轮结束后，最大元素已到达正确位置，缩小比较范围',
      codeSnippet: `  // 第 i 轮结束后
  // arr[n-i-1..n-1] 已排序
  // 下一轮只需比较 [0..n-i-2]`,
      highlightedLine: 2,
      highlightTerms: ['已排序'],
    },
  ],
}
