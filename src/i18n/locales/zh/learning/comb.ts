/**
 * v20 M7 — learning config "comb" 中文 locale（自动从 src/configs/learning/comb.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const combLearningSteps = {
  steps: {
    "gap": {
      title: '收缩间隔',
      description: '梳排序使用收缩因子 1.3 逐步减小比较间隔，消除冒泡排序的"乌龟"问题',
      tips: '1.3 是经验最优收缩因子|乌龟问题：小值在数组末尾移动缓慢',
      highlightTerms: 'shrink = 1.3|gap',
      complexityTime: 'O(n log n)',
      complexitySpace: 'O(1)',
    },
    "compare-swap": {
      title: '间隔比较与交换',
      description: '比较相距 gap 的元素，如果逆序则交换',
      tips: '大间隔时元素能快速跨越长距离|swapped 标志确保 gap=1 时完全有序',
      highlightTerms: 'arr[i] > arr[i + gap]|swapped = true',
    },
    "complete": {
      title: '算法完成',
      description: '当 gap=1 且无交换时排序完成',
      tips: '梳排序是冒泡排序的改进|平均性能优于冒泡，接近 O(n log n)',
      highlightTerms: 'gap=1|基本有序',
      complexityTime: 'O(n log n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
