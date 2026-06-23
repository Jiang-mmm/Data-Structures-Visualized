import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const complexityAnalysisConfig: LearningModeConfig = {
  algorithmKey: 'complexityAnalysis',
  steps: [
    {
      id: 'concept',
      title: tStatic('learningSteps.complexityAnalysis.steps.concept.title'),
      description: tStatic('learningSteps.complexityAnalysis.steps.concept.description'),
      codeSnippet: `// 时间复杂度：操作次数与输入规模 n 的关系
// 关注趋势，忽略常数和低阶项
// 例：3n² + 5n + 100 → O(n²)
function sum(n) {
  let total = 0           // 1 次
  for (let i = 1; i <= n; i++) {
    total += i            // n 次
  }
  return total            // 1 次
}
// 总操作次数: 2n + 2 → O(n)`,
      highlightedLine: 8,
      highlightTerms: tStatic('learningSteps.complexityAnalysis.steps.concept.highlightTerms').split('|'),
      tips: tStatic('learningSteps.complexityAnalysis.steps.concept.tips').split('|'),
      complexity: { time: tStatic('learningSteps.complexityAnalysis.steps.concept.complexityTime'), space: tStatic('learningSteps.complexityAnalysis.steps.concept.complexitySpace') },
    },
    {
      id: 'bigO',
      title: tStatic('learningSteps.complexityAnalysis.steps.bigO.title'),
      description: tStatic('learningSteps.complexityAnalysis.steps.bigO.description'),
      codeSnippet: `// 常见时间复杂度示例
// O(1) - 常数
function access(arr, i) { return arr[i] }

// O(log n) - 对数（每轮折半）
function binarySearch(arr, x) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] === x) return mid
    arr[mid] < x ? lo = mid + 1 : hi = mid - 1
  }
  return -1
}

// O(n) - 线性
function traverse(arr) { for (const x of arr) console.log(x) }

// O(n²) - 平方
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length - 1; j++)
      if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]]
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.complexityAnalysis.steps.bigO.highlightTerms').split('|'),
      tips: tStatic('learningSteps.complexityAnalysis.steps.bigO.tips').split('|'),
    },
    {
      id: 'space',
      title: tStatic('learningSteps.complexityAnalysis.steps.space.title'),
      description: tStatic('learningSteps.complexityAnalysis.steps.space.description'),
      codeSnippet: `// 空间复杂度示例
// O(1) 空间 - 原地操作
function reverse(arr) {
  let lo = 0, hi = arr.length - 1
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]]
    lo++; hi--
  }
  return arr
}

// O(n) 空间 - 辅助数组
function copy(arr) {
  const result = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) result[i] = arr[i]
  return result
}

// O(log n) 空间 - 递归栈（快速排序平均）
function quickSort(arr, lo, hi) {
  if (lo >= hi) return
  const p = partition(arr, lo, hi)
  quickSort(arr, lo, p - 1)
  quickSort(arr, p + 1, hi)
}`,
      highlightedLine: 15,
      highlightTerms: tStatic('learningSteps.complexityAnalysis.steps.space.highlightTerms').split('|'),
      tips: tStatic('learningSteps.complexityAnalysis.steps.space.tips').split('|'),
    },
    {
      id: 'cases',
      title: tStatic('learningSteps.complexityAnalysis.steps.cases.title'),
      description: tStatic('learningSteps.complexityAnalysis.steps.cases.description'),
      codeSnippet: `// 以数组查找为例分析三种情况
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1
}
// 最好情况：target 在首位 → O(1)
// 最坏情况：target 在末尾或不存在 → O(n)
// 平均情况：target 等概率出现在任一位置 → O(n)
//   期望 = (1+2+...+n)/n = (n+1)/2 → O(n)

// 快速排序三种情况
// 最好：每次 pivot 居中 → O(n log n)
// 最坏：每次 pivot 为极值 → O(n²)
// 平均：随机 pivot → O(n log n)`,
      highlightedLine: 9,
      highlightTerms: tStatic('learningSteps.complexityAnalysis.steps.cases.highlightTerms').split('|'),
      tips: tStatic('learningSteps.complexityAnalysis.steps.cases.tips').split('|'),
    },
    {
      id: 'amortized',
      title: tStatic('learningSteps.complexityAnalysis.steps.amortized.title'),
      description: tStatic('learningSteps.complexityAnalysis.steps.amortized.description'),
      codeSnippet: `// 动态数组扩容的均摊分析
class DynamicArray {
  constructor() { this.arr = new Array(1); this.size = 0 }
  push(x) {
    if (this.size === this.arr.length) {
      // 扩容：复制 n 个元素 → O(n)
      const newArr = new Array(this.arr.length * 2)
      for (let i = 0; i < this.size; i++) newArr[i] = this.arr[i]
      this.arr = newArr
    }
    this.arr[this.size++] = x  // 普通 push → O(1)
  }
}
// 单次扩容 O(n)，但扩容发生在 1,2,4,8,... 容量边界
// n 次 push 总代价 = n (普通) + (1+2+4+...+n) (扩容) < 3n
// 均摊每次 push → O(1)`,
      highlightedLine: 14,
      highlightTerms: tStatic('learningSteps.complexityAnalysis.steps.amortized.highlightTerms').split('|'),
      tips: tStatic('learningSteps.complexityAnalysis.steps.amortized.tips').split('|'),
      complexity: { time: tStatic('learningSteps.complexityAnalysis.steps.amortized.complexityTime'), space: tStatic('learningSteps.complexityAnalysis.steps.amortized.complexitySpace') },
    },
  ],
}
