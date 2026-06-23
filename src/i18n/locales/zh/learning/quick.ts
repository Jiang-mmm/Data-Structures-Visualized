/**
 * v20 M7 — learning config "quick" 中文 locale（自动从 src/configs/learning/quick.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const quickLearningSteps = {
  steps: {
    "init": {
      title: '选择基准',
      description: '选择一个元素作为基准（pivot），通常选最后一个元素',
      tips: 'pivot 的选择直接影响性能，三数取中法可以避免最坏情况',
      highlightTerms: 'pivot',
      complexityTime: '平均 O(n log n)',
      complexitySpace: 'O(log n)',
    },
    "partition": {
      title: '分区操作',
      description: '遍历数组，将小于 pivot 的元素移到左侧，大于的移到右侧',
      tips: '分区是快排的核心，一次分区就能确定一个元素的最终位置',
      highlightTerms: 'arr[j]|pivot',
    },
    "place": {
      title: '放置基准',
      description: '将 pivot 放到正确位置（i+1），左侧都小于它，右侧都大于它',
      tips: '分区完成后 pivot 就在最终位置，不需要再移动',
      highlightTerms: 'pi|i + 1',
    },
    "recurse": {
      title: '递归排序',
      description: '对基准左侧和右侧的子数组分别递归执行快速排序',
      tips: '快排平均性能最优，但最坏 O(n²) 发生在数组已排序且 pivot 选首尾时',
      highlightTerms: 'quickSort',
      complexityTime: '最坏 O(n²)',
      complexitySpace: 'O(log n)',
    },
  },
} as const
