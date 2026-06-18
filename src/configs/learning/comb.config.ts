import type { LearningModeConfig } from './types'

/**
 * 梳排序学习配置
 */
export const combConfig: LearningModeConfig = {
  algorithmKey: 'comb',
  steps: [
    {
      id: 'gap',
      title: '收缩间隔',
      description: '梳排序使用收缩因子 1.3 逐步减小比较间隔，消除冒泡排序的"乌龟"问题',
      codeSnippet: `function combSort(arr) {
  let gap = arr.length
  const shrink = 1.3
  let swapped = true
}`,
      highlightedLine: 3,
      highlightTerms: ['shrink = 1.3', 'gap'],
      tips: ['1.3 是经验最优收缩因子', '乌龟问题：小值在数组末尾移动缓慢'],
      complexity: { time: 'O(n log n)', space: 'O(1)' },
    },
    {
      id: 'compare-swap',
      title: '间隔比较与交换',
      description: '比较相距 gap 的元素，如果逆序则交换',
      codeSnippet: `  while (gap > 1 || swapped) {
    gap = Math.floor(gap / shrink)
    if (gap < 1) gap = 1
    swapped = false
    for (let i = 0; i + gap < n; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]]
        swapped = true
      }
    }
  }`,
      highlightedLine: 7,
      highlightTerms: ['arr[i] > arr[i + gap]', 'swapped = true'],
      tips: ['大间隔时元素能快速跨越长距离', 'swapped 标志确保 gap=1 时完全有序'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: '当 gap=1 且无交换时排序完成',
      codeSnippet: `  // gap=1 且 swapped=false 时退出
  // 最后一轮 gap=1 等价于冒泡排序
  // 但此时数组已基本有序，交换很少`,
      highlightedLine: 3,
      highlightTerms: ['gap=1', '基本有序'],
      tips: ['梳排序是冒泡排序的改进', '平均性能优于冒泡，接近 O(n log n)'],
      complexity: { time: 'O(n log n)', space: 'O(1)' },
    },
  ],
}
