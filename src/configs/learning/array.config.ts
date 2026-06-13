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
    },
  ],
}
