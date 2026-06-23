import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const hashConfig: LearningModeConfig = {
  algorithmKey: 'hash',
  steps: [
    {
      id: 'init',
      title: tStatic('learningSteps.hash.steps.init.title'),
      description: tStatic('learningSteps.hash.steps.init.description'),
      codeSnippet: `function hash(key, size) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i)
  }
  return hash % size
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.hash.steps.init.highlightTerms').split('|'),
      tips: tStatic('learningSteps.hash.steps.init.tips').split('|'),
      complexity: { time: tStatic('learningSteps.hash.steps.init.complexityTime'), space: tStatic('learningSteps.hash.steps.init.complexitySpace') },
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.hash.steps.insert.title'),
      description: tStatic('learningSteps.hash.steps.insert.description'),
      codeSnippet: `function insert(key, value) {
  const index = hash(key, this.size)
  this.buckets[index].push({ key, value })
}`,
      highlightedLine: 2,
      highlightTerms: tStatic('learningSteps.hash.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.hash.steps.insert.tips').split('|'),
    },
    {
      id: 'collision',
      title: tStatic('learningSteps.hash.steps.collision.title'),
      description: tStatic('learningSteps.hash.steps.collision.description'),
      codeSnippet: `// 桶内链式存储
// bucket[2] -> (key1, val1) -> (key2, val2)
// 遍历链表找到目标键
function get(key) {
  const index = hash(key, this.size)
  return this.buckets[index]
    .find(item => item.key === key)
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.hash.steps.collision.highlightTerms').split('|'),
      tips: tStatic('learningSteps.hash.steps.collision.tips').split('|'),
    },
    {
      id: 'search',
      title: tStatic('learningSteps.hash.steps.search.title'),
      description: tStatic('learningSteps.hash.steps.search.description'),
      codeSnippet: `function search(key) {
  const index = hash(key, this.size)
  const bucket = this.buckets[index]
  for (const item of bucket) {
    if (item.key === key) return item.value
  }
  return undefined
}`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.hash.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.hash.steps.search.tips').split('|'),
    },
    {
      id: 'remove',
      title: tStatic('learningSteps.hash.steps.remove.title'),
      description: tStatic('learningSteps.hash.steps.remove.description'),
      codeSnippet: `function remove(key) {
  const index = hash(key, this.size)
  const bucket = this.buckets[index]
  const i = bucket.findIndex(item => item.key === key)
  if (i === -1) return false
  bucket.splice(i, 1)
  return true
}`,
      highlightedLine: 6,
      highlightTerms: tStatic('learningSteps.hash.steps.remove.highlightTerms').split('|'),
      tips: tStatic('learningSteps.hash.steps.remove.tips').split('|'),
      complexity: { time: tStatic('learningSteps.hash.steps.remove.complexityTime'), space: tStatic('learningSteps.hash.steps.remove.complexitySpace') },
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: '哈希表查找的平均时间复杂度是？',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 0,
      explanation: '好的哈希函数 + 合理冲突处理下，哈希表平均查找 O(1)。最坏情况（所有键都冲突）为 O(n)。',
    },
    {
      id: 'q2',
      question: '哈希冲突的两种主要处理方式是？',
      options: ['栈/队列', '链地址法/开放寻址法', '冒泡/快排', 'BFS/DFS'],
      correctIndex: 1,
      explanation: '链地址法（拉链法）每个桶存一个链表；开放寻址法（线性/二次/双重哈希）冲突时探测下一个空位。',
    },
    {
      id: 'q3',
      question: '哈希表的"负载因子"（load factor）指什么？',
      options: ['键值对的总数', '桶的数量', '已存元素数 / 桶数', '哈希函数返回值'],
      correctIndex: 2,
      explanation: '负载因子 = 元素数 / 桶数。负载因子越大冲突概率越高，超过 0.75 通常需要扩容 rehash 以保持 O(1) 性能。',
    },
    {
      id: 'q4',
      question: '为什么好的哈希函数要"均匀分布"？',
      options: ['加快计算速度', '减少冲突', '节省内存', '支持范围查询'],
      correctIndex: 1,
      explanation: '均匀分布让键尽量分散到不同桶，减少冲突次数。冲突多了，链地址法链表变长，开放寻址法探测次数增加，性能退化。',
    },
    {
      id: 'q5',
      question: 'JavaScript 的 Object / Map 底层使用什么结构？',
      options: ['二叉树', '哈希表', '跳表', 'B+ 树'],
      correctIndex: 1,
      explanation: 'V8 等主流 JS 引擎中 Object 和 Map 底层都是哈希表（V8 使用开放寻址 + 线性探测的优化变体）。',
    },
  ],
}
