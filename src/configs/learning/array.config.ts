import type { LearningModeConfig } from './types'

export const arrayConfig: LearningModeConfig = {
  algorithmKey: 'array',
  steps: [
    {
      id: 'structure',
      title: '数组结构',
      description: '数组在内存中连续存储，每个元素通过索引直接访问，支持 O(1) 随机读取',
      codeSnippet: `// 数组：连续内存布局
// 索引:  0    1    2    3    4
// 值:   [8]  [3]  [12] [5]  [9]
// 地址: base + index * sizeof(int)`,
      highlightedLine: 2,
      highlightTerms: ['索引', '连续'],
      tips: ['数组的连续存储使得缓存命中率高，这是数组遍历速度快的根本原因'],
      complexity: { time: '随机访问 O(1)', space: 'O(n)' },
    },
    {
      id: 'insert',
      title: '插入操作',
      description: '在指定位置插入元素，需要将该位置之后的所有元素向后移动一位，时间复杂度 O(n)',
      codeSnippet: `function insert(arr, index, value) {
  for (let i = arr.length; i > index; i--) {
    arr[i] = arr[i - 1]  // 元素后移
  }
  arr[index] = value     // 插入新元素
}`,
      highlightedLine: 3,
      highlightTerms: ['arr[i - 1]', '后移'],
      tips: ['尾部插入 O(1)，中间/头部插入 O(n)，这是数组的主要劣势'],
    },
    {
      id: 'delete',
      title: '删除操作',
      description: '删除指定位置的元素，需要将该位置之后的所有元素向前移动一位，时间复杂度 O(n)',
      codeSnippet: `function remove(arr, index) {
  const value = arr[index]
  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1]  // 元素前移
  }
  arr.length--           // 缩减长度
  return value
}`,
      highlightedLine: 4,
      highlightTerms: ['arr[i + 1]', '前移'],
      tips: ['删除时如果不关心顺序，可以用 arr[i] = arr[arr.length-1] 来 O(1) 删除'],
    },
    {
      id: 'search',
      title: '查找操作',
      description: '线性查找逐个比较元素，时间复杂度 O(n)；若数组有序可用二分查找 O(log n)',
      codeSnippet: `function search(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1  // 未找到
}`,
      highlightedLine: 3,
      highlightTerms: ['arr[i] === target', 'O(n)'],
      tips: ['数组是最基础的数据结构，几乎所有其他数据结构都建立在数组之上'],
    },
    {
      id: 'searchAll',
      title: '查找全部',
      description: '线性查找收集所有匹配项的索引，时间复杂度 O(n)。适用于重复元素的场景',
      codeSnippet: `function searchAll(arr, target) {
  const indices = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) indices.push(i)
  }
  return indices
}`,
      highlightedLine: 4,
      highlightTerms: ['indices.push(i)', 'O(n)'],
      tips: ['查找全部仍为 O(n)，无法利用有序性加速，因为需要检查每个元素'],
    },
    {
      id: 'binarySearch',
      title: '二分查找',
      description: '要求数组升序有序。每次比较中点元素，将搜索范围缩小一半，时间复杂度 O(log n)',
      codeSnippet: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] === target) return mid
    else if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1  // 未找到
}`,
      highlightedLine: 5,
      highlightTerms: ['mid = (lo + hi) >> 1', 'O(log n)'],
      tips: [
        '二分查找的前提是数组有序，否则结果不可靠',
        '每次迭代范围减半：n → n/2 → n/4 → ... → 1，共 log₂(n) 步',
        'mid = (lo + hi) >> 1 等价于 Math.floor((lo + hi) / 2)，位运算更快',
      ],
      complexity: { time: 'O(log n)', space: 'O(1)' },
    },
  ],
}
