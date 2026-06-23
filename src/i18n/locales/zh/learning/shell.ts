/**
 * v20 M7 — learning config "shell" 中文 locale（自动从 src/configs/learning/shell.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const shellLearningSteps = {
  steps: {
    "gap": {
      title: '选择间隔序列',
      description: '希尔排序使用逐步缩小的间隔（gap）对子序列排序。常用 Knuth 序列：1, 4, 13, 40, ...',
      tips: '间隔序列的选择直接影响时间复杂度|Knuth 序列经验效果好且实现简单',
      highlightTerms: 'gap * 3 + 1|Knuth',
      complexityTime: 'O(n log²n)',
      complexitySpace: 'O(1)',
    },
    "gap-sort": {
      title: '间隔插入排序',
      description: '对每个间隔 gap，对相距 gap 的元素组成的子序列进行插入排序',
      tips: '大间隔时元素能跨越长距离移动，减少比较次数|最后一次 gap=1 就是普通插入排序，但此时数组已基本有序',
      highlightTerms: 'arr[j - gap] > arr[j]|j -= gap',
    },
    "complete": {
      title: '算法完成',
      description: 'gap 缩小到 1 时完成最后一次插入排序，数组有序',
      tips: '希尔排序是插入排序的改进，利用大间隔快速消除逆序对|不稳定排序',
      highlightTerms: 'gap=1|近似有序',
      complexityTime: 'O(n log²n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
