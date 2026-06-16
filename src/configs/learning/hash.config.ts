import type { LearningModeConfig } from './types'

export const hashConfig: LearningModeConfig = {
  algorithmKey: 'hash',
  steps: [
    {
      id: 'init',
      title: '哈希函数',
      description: '将键通过哈希函数映射到数组索引，实现 O(1) 平均访问',
      codeSnippet: `function hash(key, size) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i)
  }
  return hash % size
}`,
      highlightedLine: 6,
      highlightTerms: ['hash % size'],
      tips: ['好的哈希函数应均匀分布，减少冲突。常见的有乘法哈希、MurmurHash 等'],
      complexity: { time: '平均 O(1)，最坏 O(n)', space: 'O(n)' },
    },
    {
      id: 'insert',
      title: '插入键值对',
      description: '计算哈希值确定桶位置，将键值对存入对应桶中',
      codeSnippet: `function insert(key, value) {
  const index = hash(key, this.size)
  this.buckets[index].push({ key, value })
}`,
      highlightedLine: 2,
      highlightTerms: ['hash(key)', 'push'],
      tips: ['当负载因子（元素数/桶数）超过 0.75 时，通常需要扩容并重新哈希'],
    },
    {
      id: 'collision',
      title: '冲突处理',
      description: '当多个键映射到同一索引时，使用链地址法在桶中存储多个元素',
      codeSnippet: `// 桶内链式存储
// bucket[2] -> (key1, val1) -> (key2, val2)
// 遍历链表找到目标键
function get(key) {
  const index = hash(key, this.size)
  return this.buckets[index]
    .find(item => item.key === key)
}`,
      highlightedLine: 6,
      highlightTerms: ['find', 'item.key'],
      tips: ['冲突处理的两种主要方式：链地址法（本例）和开放寻址法'],
    },
    {
      id: 'search',
      title: '查找操作',
      description: '计算哈希值定位桶，遍历桶内链表找到匹配的键',
      codeSnippet: `function search(key) {
  const index = hash(key, this.size)
  const bucket = this.buckets[index]
  for (const item of bucket) {
    if (item.key === key) return item.value
  }
  return undefined
}`,
      highlightedLine: 5,
      highlightTerms: ['item.key === key'],
      tips: ['哈希表是 JavaScript 对象/Map 的底层实现，是最重要的数据结构之一'],
    },
  ],
}
