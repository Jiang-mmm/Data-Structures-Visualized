/**
 * v20 M7 — learning config "selection" 中文 locale（自动从 src/configs/learning/selection.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const selectionLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '外层循环从数组起始位置开始，每轮从未排序部分选出最小元素',
      tips: '选择排序每轮只做一次交换，这是它与冒泡排序的关键区别',
      highlightTerms: 'minIdx|i',
      complexityTime: 'O(n²)',
      complexitySpace: 'O(1)',
    },
    "scan": {
      title: '扫描未排序区域',
      description: '遍历 i+1 到 n-1 的元素，找到最小值的索引',
      tips: '内层循环只做比较，不做交换，因此移动次数为 O(n)',
      highlightTerms: 'arr[j]|arr[minIdx]|minIdx',
      complexityTime: 'O(n²)',
      complexitySpace: 'O(1)',
    },
    "swap": {
      title: '交换最小值',
      description: '将找到的最小值与当前位置 i 交换，使其归位',
      tips: '选择排序是不稳定的排序：相等元素的相对顺序可能改变',
      highlightTerms: 'arr[i]|arr[minIdx]|temp',
    },
    "progress": {
      title: '逐步缩小范围',
      description: '每轮结束后，已排序区域扩大一位，下一轮从未排序区域继续选择',
      tips: '无论输入数据如何，选择排序总是 O(n²)，没有最好情况优化',
      highlightTerms: '已排序|未排序',
    },
  },
} as const
