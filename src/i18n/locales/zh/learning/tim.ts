/**
 * v20 M7 — learning config "tim" 中文 locale（自动从 src/configs/learning/tim.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const timLearningSteps = {
  steps: {
    "run": {
      title: '分块插入排序',
      description: '将数组分成大小为 RUN（通常 32）的块，每块用插入排序。小规模数据插入排序效率高',
      tips: '插入排序在小规模数据上接近 O(n)|RUN=32 是经验最优值',
      highlightTerms: 'RUN = 32|insertionSort',
      complexityTime: 'O(n log n)',
      complexitySpace: 'O(n)',
    },
    "merge": {
      title: '归并有序块',
      description: '逐步合并有序块，每次合并的跨度翻倍（32→64→128...）',
      tips: '归并排序在已排序块上效率为 O(n)|结合插入排序和归并排序的优势',
      highlightTerms: 'merge|size *= 2',
    },
    "complete": {
      title: '算法完成',
      description: '所有块合并完成，数组有序',
      tips: 'TimSort 是工业级排序算法|对部分有序数据特别高效|稳定排序',
      highlightTerms: 'Python/Java|O(n)',
      complexityTime: 'O(n log n)',
      complexitySpace: 'O(n)',
    },
  },
} as const
