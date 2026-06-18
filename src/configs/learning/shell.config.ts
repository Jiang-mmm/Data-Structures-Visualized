import type { LearningModeConfig } from './types'

/**
 * 希尔排序学习配置
 */
export const shellConfig: LearningModeConfig = {
  algorithmKey: 'shell',
  steps: [
    {
      id: 'gap',
      title: '选择间隔序列',
      description: '希尔排序使用逐步缩小的间隔（gap）对子序列排序。常用 Knuth 序列：1, 4, 13, 40, ...',
      codeSnippet: `function shellSort(arr) {
  let gap = 1
  while (gap < n / 3) gap = gap * 3 + 1
  // gap 序列: ..., 40, 13, 4, 1
}`,
      highlightedLine: 4,
      highlightTerms: ['gap * 3 + 1', 'Knuth'],
      tips: ['间隔序列的选择直接影响时间复杂度', 'Knuth 序列经验效果好且实现简单'],
      complexity: { time: 'O(n log²n)', space: 'O(1)' },
    },
    {
      id: 'gap-sort',
      title: '间隔插入排序',
      description: '对每个间隔 gap，对相距 gap 的元素组成的子序列进行插入排序',
      codeSnippet: `  while (gap >= 1) {
    for (let i = gap; i < n; i++) {
      let j = i
      while (j >= gap && arr[j - gap] > arr[j]) {
        [arr[j], arr[j - gap]] = [arr[j - gap], arr[j]]
        j -= gap
      }
    }
    gap = Math.floor(gap / 3)
  }`,
      highlightedLine: 5,
      highlightTerms: ['arr[j - gap] > arr[j]', 'j -= gap'],
      tips: ['大间隔时元素能跨越长距离移动，减少比较次数', '最后一次 gap=1 就是普通插入排序，但此时数组已基本有序'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: 'gap 缩小到 1 时完成最后一次插入排序，数组有序',
      codeSnippet: `  // gap=1 时等价于插入排序
  // 但由于前面大间隔排序已使数组基本有序
  // 插入排序在近似有序数组上接近 O(n)`,
      highlightedLine: 3,
      highlightTerms: ['gap=1', '近似有序'],
      tips: ['希尔排序是插入排序的改进，利用大间隔快速消除逆序对', '不稳定排序'],
      complexity: { time: 'O(n log²n)', space: 'O(1)' },
    },
  ],
}
