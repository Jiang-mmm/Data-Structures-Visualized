import type { LearningModeConfig } from './types'

export const complexityAnalysisConfig: LearningModeConfig = {
  algorithmKey: 'complexityAnalysis',
  steps: [
    {
      id: 'concept',
      title: '时间复杂度概念',
      description: '时间复杂度衡量算法运行时间随输入规模增长的趋势，而非具体执行时间，便于横向比较算法效率',
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
      highlightTerms: ['O(n)', '趋势', '输入规模'],
      tips: ['时间复杂度是"增长趋势"而非"实际耗时"，O(n) 的算法在 n 小时可能比 O(log n) 还慢（常数项影响）'],
      complexity: { time: '分析框架', space: 'O(1)' },
    },
    {
      id: 'bigO',
      title: '大O表示法',
      description: '大O表示法描述算法上界，常见复杂度从优到劣：O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)',
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
      highlightTerms: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      tips: ['O(log n) 意味着每轮把问题规模减半，2³² 个元素只需 32 次操作即可定位'],
    },
    {
      id: 'space',
      title: '空间复杂度',
      description: '空间复杂度衡量算法运行过程中额外占用的内存随输入规模增长的趋势，包括辅助变量、递归栈、动态分配的结构',
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
      highlightTerms: ['O(1)', 'O(n)', 'O(log n)', '递归栈'],
      tips: ['递归算法的空间复杂度要算上调用栈，深度为 d 的递归占用 O(d) 空间'],
    },
    {
      id: 'cases',
      title: '最好/最坏/平均情况',
      description: '同一算法在不同输入下表现不同。快速排序最坏 O(n²)（已排序输入），平均 O(n log n)；查找最好 O(1)（首元素命中），最坏 O(n)',
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
      highlightTerms: ['最好情况', '最坏情况', '平均情况'],
      tips: ['工程实践中更关注平均情况，因为最坏情况往往需要特殊构造的输入；但实时系统需考虑最坏情况'],
    },
    {
      id: 'amortized',
      title: '均摊分析',
      description: '均摊分析评估一系列操作的总代价除以操作次数。动态数组扩容单次 O(n)，但 n 次插入均摊 O(1)，因为扩容频率随规模递减',
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
      highlightTerms: ['均摊', 'O(1)', '扩容'],
      tips: ['均摊分析的三种方法：聚合法（求和平均）、记账法（预存代价）、势能法（势能函数）'],
      complexity: { time: '均摊 O(1)', space: 'O(n)' },
    },
  ],
}
