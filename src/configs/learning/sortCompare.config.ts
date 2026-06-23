import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


/**
 * 排序对比页学习配置
 *
 * 引导用户理解多种排序算法的差异：
 * 1. 选择算法 — 理解每种算法的适用场景
 * 2. 初始化数组 — 观察同一数据集下不同算法的表现
 * 3. 第一轮比较 — 对比冒泡/选择/插入的初始行为
 * 4. 关键差异 — 时间复杂度与交换次数的差异
 * 5. 完成对比 — 综合评估各算法性能
 */
export const sortCompareConfig: LearningModeConfig = {
  algorithmKey: 'sortCompare',
  steps: [
    {
      id: 'select',
      title: tStatic('learningSteps.sortCompare.steps.select.title'),
      description:
        tStatic('learningSteps.sortCompare.steps.select.description'),
      codeSnippet: `// 可选算法（12 种）
const algorithms = [
  'bubble',    // O(n²)    稳定
  'selection', // O(n²)    不稳定
  'insertion', // O(n²)    稳定
  'quick',     // O(n log n) 不稳定
  'merge',     // O(n log n) 稳定
  'heap',      // O(n log n) 不稳定
  // ... 更多
]`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.sortCompare.steps.select.highlightTerms').split('|'),
      tips: tStatic('learningSteps.sortCompare.steps.select.tips').split('|'),
      complexity: { time: tStatic('learningSteps.sortCompare.steps.select.complexityTime'), space: tStatic('learningSteps.sortCompare.steps.select.complexitySpace') },
    },
    {
      id: 'init',
      title: tStatic('learningSteps.sortCompare.steps.init.title'),
      description:
        tStatic('learningSteps.sortCompare.steps.init.description'),
      codeSnippet: `// 所有算法共享同一份数据
const data = Array.from({ length: 15 }, () =>
  Math.floor(Math.random() * 95) + 5
)

// 每个算法独立拷贝，互不影响
const arr1 = [...data] // bubble
const arr2 = [...data] // merge
const arr3 = [...data] // heap`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.sortCompare.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.sortCompare.steps.init.tips').split('|'),
    },
    {
      id: 'firstRound',
      title: tStatic('learningSteps.sortCompare.steps.firstRound.title'),
      description:
        tStatic('learningSteps.sortCompare.steps.firstRound.description'),
      codeSnippet: `// 冒泡：比较相邻元素
if (arr[j] > arr[j + 1]) swap(arr, j, j + 1)

// 选择：找最小值索引
if (arr[j] < arr[minIdx]) minIdx = j

// 插入：向左查找插入位置
while (j >= 0 && arr[j] > key) {
  arr[j + 1] = arr[j]
  j--
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.sortCompare.steps.firstRound.highlightTerms').split('|'),
      tips: tStatic('learningSteps.sortCompare.steps.firstRound.tips').split('|'),
      complexity: { time: tStatic('learningSteps.sortCompare.steps.firstRound.complexityTime'), space: tStatic('learningSteps.sortCompare.steps.firstRound.complexitySpace') },
    },
    {
      id: 'keyDiff',
      title: tStatic('learningSteps.sortCompare.steps.keyDiff.title'),
      description:
        tStatic('learningSteps.sortCompare.steps.keyDiff.description'),
      codeSnippet: `// 比较次数 vs 交换次数
算法         | 比较       | 交换
-------------|-----------|--------
冒泡 O(n²)   | ~n²/2     | ~n²/2
选择 O(n²)   | ~n²/2     | ≤ n
归并 O(nlogn)| ~nlogn    | ~nlogn
快排 O(nlogn)| ~nlogn    | ~nlogn
堆   O(nlogn)| ~2nlogn   | ~nlogn`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.sortCompare.steps.keyDiff.highlightTerms').split('|'),
      tips: tStatic('learningSteps.sortCompare.steps.keyDiff.tips').split('|'),
      complexity: { time: tStatic('learningSteps.sortCompare.steps.keyDiff.complexityTime'), space: tStatic('learningSteps.sortCompare.steps.keyDiff.complexitySpace') },
    },
    {
      id: 'complete',
      title: tStatic('learningSteps.sortCompare.steps.complete.title'),
      description:
        tStatic('learningSteps.sortCompare.steps.complete.description'),
      codeSnippet: `// 性能对比结论
1. 数据量 n < 20：插入排序可能最快（常数因子小）
2. 数据量 n > 50：O(n log n) 算法显著领先
3. 稳定性需求：选择归并排序（稳定 + O(n log n)）
4. 内存受限：选择堆排序（O(1) 额外空间）
5. 平均最快：快速排序（常数因子最小）`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.sortCompare.steps.complete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.sortCompare.steps.complete.tips').split('|'),
      complexity: { time: tStatic('learningSteps.sortCompare.steps.complete.complexityTime'), space: tStatic('learningSteps.sortCompare.steps.complete.complexitySpace') },
    },
  ],
}
