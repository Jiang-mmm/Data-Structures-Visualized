import type { LearningModeConfig } from './types'

/**
 * TimSort 学习配置
 */
export const timConfig: LearningModeConfig = {
  algorithmKey: 'tim',
  steps: [
    {
      id: 'run',
      title: '分块插入排序',
      description: '将数组分成大小为 RUN（通常 32）的块，每块用插入排序。小规模数据插入排序效率高',
      codeSnippet: `function timSort(arr) {
  const RUN = 32
  for (let i = 0; i < n; i += RUN) {
    insertionSort(arr, i, Math.min(i + RUN - 1, n - 1))
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['RUN = 32', 'insertionSort'],
      tips: ['插入排序在小规模数据上接近 O(n)', 'RUN=32 是经验最优值'],
      complexity: { time: 'O(n log n)', space: 'O(n)' },
    },
    {
      id: 'merge',
      title: '归并有序块',
      description: '逐步合并有序块，每次合并的跨度翻倍（32→64→128...）',
      codeSnippet: `  for (let size = RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1
      const right = Math.min(left + 2 * size - 1, n - 1)
      merge(arr, left, mid, right)
    }
  }`,
      highlightedLine: 5,
      highlightTerms: ['merge', 'size *= 2'],
      tips: ['归并排序在已排序块上效率为 O(n)', '结合插入排序和归并排序的优势'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: '所有块合并完成，数组有序',
      codeSnippet: `  // TimSort = 插入排序（小规模）+ 归并排序（大规模）
  // Python/Java 默认排序算法
  // 最佳情况 O(n)，最坏 O(n log n)`,
      highlightedLine: 3,
      highlightTerms: ['Python/Java', 'O(n)'],
      tips: ['TimSort 是工业级排序算法', '对部分有序数据特别高效', '稳定排序'],
      complexity: { time: 'O(n log n)', space: 'O(n)' },
    },
  ],
}
