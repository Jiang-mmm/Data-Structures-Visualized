import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const arrayConfig: LearningModeConfig = {
  algorithmKey: 'array',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.array.steps.structure.title'),
      description: tStatic('learningSteps.array.steps.structure.description'),
      codeSnippet: `// 数组：连续内存布局
// 索引:  0    1    2    3    4
// 值:   [8]  [3]  [12] [5]  [9]
// 地址: base + index * sizeof(int)`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.array.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.array.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.array.steps.structure.complexityTime'), space: tStatic('learningSteps.array.steps.structure.complexitySpace') },
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.array.steps.insert.title'),
      description: tStatic('learningSteps.array.steps.insert.description'),
      codeSnippet: `function insert(arr, index, value) {
  for (let i = arr.length; i > index; i--) {
    arr[i] = arr[i - 1]  // 元素后移
  }
  arr[index] = value     // 插入新元素
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.array.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.array.steps.insert.tips').split('|'),
    },
    {
      id: 'delete',
      title: tStatic('learningSteps.array.steps.delete.title'),
      description: tStatic('learningSteps.array.steps.delete.description'),
      codeSnippet: `function remove(arr, index) {
  const value = arr[index]
  for (let i = index; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1]  // 元素前移
  }
  arr.length--           // 缩减长度
  return value
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.array.steps.delete.highlightTerms').split('|'),
      tips: tStatic('learningSteps.array.steps.delete.tips').split('|'),
    },
    {
      id: 'search',
      title: tStatic('learningSteps.array.steps.search.title'),
      description: tStatic('learningSteps.array.steps.search.description'),
      codeSnippet: `function search(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i
  }
  return -1  // 未找到
}`,
      highlightedLine: 3,
      highlightTerms: tStatic('learningSteps.array.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.array.steps.search.tips').split('|'),
    },
    {
      id: 'searchAll',
      title: tStatic('learningSteps.array.steps.searchAll.title'),
      description: tStatic('learningSteps.array.steps.searchAll.description'),
      codeSnippet: `function searchAll(arr, target) {
  const indices = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) indices.push(i)
  }
  return indices
}`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.array.steps.searchAll.highlightTerms').split('|'),
      tips: tStatic('learningSteps.array.steps.searchAll.tips').split('|'),
    },
    {
      id: 'binarySearch',
      title: tStatic('learningSteps.array.steps.binarySearch.title'),
      description: tStatic('learningSteps.array.steps.binarySearch.description'),
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
      highlightTerms: tStatic('learningSteps.array.steps.binarySearch.highlightTerms').split('|'),
      tips: tStatic('learningSteps.array.steps.binarySearch.tips').split('|'),
      complexity: { time: tStatic('learningSteps.array.steps.binarySearch.complexityTime'), space: tStatic('learningSteps.array.steps.binarySearch.complexitySpace') },
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: '数组随机访问（通过索引读取）的时间复杂度是？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 0,
      explanation: '数组在内存中连续存储，通过 base + index * sizeof 计算地址，O(1) 即可直接访问任意元素。',
    },
    {
      id: 'q2',
      question: '在数组头部插入元素的时间复杂度是？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      explanation: '头部插入需要将所有现有元素向后移动一位，共 n 次移动，时间复杂度 O(n)。',
    },
    {
      id: 'q3',
      question: '二分查找的前提条件是什么？',
      options: ['数组长度为偶数', '数组已排序', '数组元素唯一', '数组支持随机访问且已排序'],
      correctIndex: 3,
      explanation: '二分查找需要数组支持 O(1) 随机访问（能取 mid），且数组必须有序。两者缺一不可。',
    },
    {
      id: 'q4',
      question: '为什么数组的缓存命中率通常高于链表？',
      options: ['数组元素类型相同', '数组在内存中连续存储，CPU 预取友好', '数组支持随机访问', '数组长度固定'],
      correctIndex: 1,
      explanation: '连续内存布局使得 CPU 可以预取相邻元素到缓存行，遍历数组时缓存命中率高，访问速度快于链表。',
    },
    {
      id: 'q5',
      question: '数组的"以空间换时间"主要体现在什么场景？',
      options: ['动态扩容', '哈希表的桶数组', '多维数组', '栈的底层实现'],
      correctIndex: 1,
      explanation: '哈希表用额外的桶数组实现 O(1) 平均查找，典型的"以空间换时间"案例。',
    },
    {
      id: 'q6',
      question: '数组尾部追加（push）操作的均摊时间复杂度是？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 0,
      explanation: '动态数组尾部追加均摊 O(1)：虽然偶尔扩容需要 O(n) 复制，但分摊到所有操作后是 O(1)。',
    },
  ],
}
