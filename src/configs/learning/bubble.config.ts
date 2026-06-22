import type { LearningModeConfig } from './types'

export const bubbleConfig: LearningModeConfig = {
  algorithmKey: 'bubble',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '外层循环从左到右遍历数组，每轮将最大值"冒泡"到末尾',
      codeSnippet: `function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
    }
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['n - 1'],
      tips: ['冒泡排序是最直观的排序算法，但效率较低，适合教学而非生产环境'],
      complexity: { time: 'O(n²)', space: 'O(1)' },
    },
    {
      id: 'compare',
      title: '比较相邻元素',
      description: '比较 arr[j] 和 arr[j+1]，判断是否需要交换',
      codeSnippet: `    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // 需要交换
      }
    }`,
      highlightedLine: 2,
      highlightTerms: ['arr[j]', 'arr[j + 1]'],
      tips: ['每轮比较范围缩小 i 个元素，因为末尾已有 i 个元素归位'],
    },
    {
      id: 'swap',
      title: '交换元素',
      description: '如果左侧元素大于右侧，交换两个元素的位置',
      codeSnippet: `      if (arr[j] > arr[j + 1]) {
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }`,
      highlightedLine: 2,
      highlightTerms: ['temp', 'arr[j]'],
      tips: ['冒泡排序是稳定排序——相等元素不会交换位置'],
    },
    {
      id: 'sorted',
      title: '已排序区域',
      description: '每轮结束后，最大元素已到达正确位置，缩小比较范围',
      codeSnippet: `  // 第 i 轮结束后
  // arr[n-i-1..n-1] 已排序
  // 下一轮只需比较 [0..n-i-2]
  // 最佳 O(n)：加 flag 检测已排序数组`,
      highlightedLine: 2,
      highlightTerms: ['已排序', 'O(n)'],
      tips: ['添加一个 swapped 标志，如果某轮没有交换就可以提前终止，最佳情况 O(n)'],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: '冒泡排序的平均时间复杂度是多少？',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      correctIndex: 2,
      explanation: '冒泡排序使用双重嵌套循环，平均和最坏情况均为 O(n²)。加 swapped 标志后最佳情况为 O(n)。',
    },
    {
      id: 'q2',
      question: '冒泡排序是稳定排序吗？',
      options: ['是，相等元素不会交换', '否，相等元素可能交换', '取决于数据', '不确定'],
      correctIndex: 0,
      explanation: '冒泡排序只在前元素大于后元素时交换（arr[j] > arr[j+1]），相等元素不会交换，因此是稳定排序。',
    },
    {
      id: 'q3',
      question: '添加 swapped 标志后，冒泡排序的最佳时间复杂度变为？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      explanation: '如果数组已经有序，带 swapped 标志的冒泡排序只需一轮遍历即可终止，最佳情况为 O(n)。',
    },
    {
      id: 'q4',
      question: '冒泡排序中"冒泡"一词指的是什么？',
      options: ['小元素下沉到数组开头', '大元素经过比较交换上浮到数组末尾', '随机交换元素', '元素按值大小聚类'],
      correctIndex: 1,
      explanation: '"冒泡"指每轮内层循环将较大的元素通过两两交换逐步推到数组末尾（右侧），类似水中气泡上浮。',
    },
    {
      id: 'q5',
      question: '对 n=100 的随机数组排序，冒泡排序大约需要多少次比较？',
      options: ['~100', '~1000', '~5000', '~10000'],
      correctIndex: 2,
      explanation: 'O(n²) = 100² = 10000 次最坏情况比较，平均约为一半 ≈ 5000 次（n*(n-1)/4 ≈ 2475）。简化记忆：~n²/2 量级。',
    },
  ],
}
