/**
 * v20 M7 — learning config "bucket" 中文 locale（自动从 src/configs/learning/bucket.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const bucketLearningSteps = {
  steps: {
    "init": {
      title: '创建桶',
      description: '确定桶的数量和范围，创建空桶数组',
      tips: '桶的数量通常取 √n，这是经验上的一个平衡点',
      highlightTerms: 'bucketCount|bucketRange',
      complexityTime: 'O(n+k)',
      complexitySpace: 'O(n+k)',
    },
    "distribute": {
      title: '分配元素',
      description: '遍历数组，将每个元素分配到对应的桶中',
      tips: 'Math.min 确保最大值不会越界到最后一个桶之外',
      highlightTerms: 'bucketIdx|push',
    },
    "sort": {
      title: '桶内排序',
      description: '对每个桶内部单独排序（通常用插入排序或内置排序）',
      tips: '桶内排序的选择取决于数据分布，元素少时插入排序更高效',
      highlightTerms: 'sort',
    },
    "merge": {
      title: '合并结果',
      description: '按桶的顺序将所有桶中的元素依次放回原数组',
      tips: '桶排序在数据均匀分布时接近 O(n)，分布极不均匀时退化为 O(n²)',
      highlightTerms: 'arr[idx]|buckets[b]',
      complexityTime: '平均 O(n+k)，最坏 O(n²)',
      complexitySpace: 'O(n+k)',
    },
  },
} as const
