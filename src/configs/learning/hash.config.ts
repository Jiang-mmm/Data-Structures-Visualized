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
    {
      id: 'remove',
      title: '删除键值对 Remove',
      description: '根据 key 计算哈希定位桶，在桶内查找并删除对应键值对。链地址法需处理链表节点删除。',
      codeSnippet: `function remove(key) {
  const index = hash(key, this.size)
  const bucket = this.buckets[index]
  const i = bucket.findIndex(item => item.key === key)
  if (i === -1) return false
  bucket.splice(i, 1)
  return true
}`,
      highlightedLine: 6,
      highlightTerms: ['splice', 'findIndex', 'remove'],
      tips: ['删除前需检查 key 是否存在', '链地址法删除链表节点需维护前驱指针', '开放寻址法删除需标记"已删除"而非真正移除（避免中断探测链）'],
      complexity: { time: '平均 O(1)，最坏 O(n)', space: 'O(1)' },
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
