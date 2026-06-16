import type { LearningModeConfig } from './types'

export const bucketConfig: LearningModeConfig = {
  algorithmKey: 'bucket',
  steps: [
    {
      id: 'init',
      title: '创建桶',
      description: '确定桶的数量和范围，创建空桶数组',
      codeSnippet: `function bucketSort(arr) {
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const bucketCount = Math.floor(Math.sqrt(n)) + 1
  const bucketRange = (max - min + 1) / bucketCount
  const buckets = Array.from({ length: bucketCount }, () => [])
}`,
      highlightedLine: 4,
      highlightTerms: ['bucketCount', 'bucketRange'],
      tips: ['桶的数量通常取 √n，这是经验上的一个平衡点'],
      complexity: { time: 'O(n+k)', space: 'O(n+k)' },
    },
    {
      id: 'distribute',
      title: '分配元素',
      description: '遍历数组，将每个元素分配到对应的桶中',
      codeSnippet: `  for (let i = 0; i < n; i++) {
    const bucketIdx = Math.min(
      Math.floor((arr[i] - min) / bucketRange),
      bucketCount - 1
    )
    buckets[bucketIdx].push(arr[i])
  }`,
      highlightedLine: 6,
      highlightTerms: ['bucketIdx', 'push'],
      tips: ['Math.min 确保最大值不会越界到最后一个桶之外'],
    },
    {
      id: 'sort',
      title: '桶内排序',
      description: '对每个桶内部单独排序（通常用插入排序或内置排序）',
      codeSnippet: `  for (let b = 0; b < bucketCount; b++) {
    buckets[b].sort((a, c) => a - c)
    // 每个桶内部独立排序
    // 数据均匀分布时每个桶元素很少
  }`,
      highlightedLine: 2,
      highlightTerms: ['sort'],
      tips: ['桶内排序的选择取决于数据分布，元素少时插入排序更高效'],
    },
    {
      id: 'merge',
      title: '合并结果',
      description: '按桶的顺序将所有桶中的元素依次放回原数组',
      codeSnippet: `  let idx = 0
  for (let b = 0; b < bucketCount; b++) {
    for (let j = 0; j < buckets[b].length; j++) {
      arr[idx++] = buckets[b][j]
    }
  }
  // 合并完成，数组已排序`,
      highlightedLine: 4,
      highlightTerms: ['arr[idx]', 'buckets[b]'],
      tips: ['桶排序在数据均匀分布时接近 O(n)，分布极不均匀时退化为 O(n²)'],
      complexity: { time: '平均 O(n+k)，最坏 O(n²)', space: 'O(n+k)' },
    },
  ],
}
