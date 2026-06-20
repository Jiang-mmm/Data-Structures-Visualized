import type { LearningModeConfig } from './types'

export const skipListConfig: LearningModeConfig = {
  algorithmKey: 'skipList',
  steps: [
    {
      id: 'intro',
      title: '跳表简介',
      description: '跳表是概率性平衡数据结构，通过多层链表实现 O(log n) 查找，是平衡树的简洁替代方案',
      codeSnippet: `class SkipList {
  constructor() {
    this.head = new Node(-Infinity, MAX_LEVEL)
    this.level = 1
  }
}`,
      highlightedLine: 3,
      highlightTerms: ['head', 'level', 'MAX_LEVEL'],
      tips: ['跳表由 William Pugh 于 1989 年发明', 'Redis 的有序集合（ZSET）底层使用跳表实现', '相比红黑树，跳表实现更简单且支持范围查询'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'structure',
      title: '多层链表结构',
      description: '跳表由多层链表组成，第 0 层包含所有节点，高层是低层的"快速通道"，节点出现在哪些层由随机决定',
      codeSnippet: `// 第 0 层（最底层）：H -> 10 -> 20 -> 30 -> 40 -> 50
// 第 1 层：         H -> 10 ------> 30 ------> 50
// 第 2 层：         H ------> 30 -----------> 50`,
      highlightedLine: 1,
      highlightTerms: ['第 0 层', '第 1 层', '第 2 层'],
      tips: ['每个节点出现在第 0 层，以概率 P 出现在更高层', '高层节点稀疏，起到索引作用', '层数期望为 O(log n)，保证查找效率'],
    },
    {
      id: 'randomLevel',
      title: '随机层数生成',
      description: '插入新节点时，通过抛硬币（概率 P=0.5）决定节点层数，避免手动平衡的复杂性',
      codeSnippet: `function randomLevel() {
  let level = 1
  while (level < MAX_LEVEL && Math.random() < P) {
    level++
  }
  return level
}`,
      highlightedLine: 3,
      highlightTerms: ['randomLevel', 'Math.random', 'P'],
      tips: ['P 通常取 0.5，即每层有 50% 概率提升', 'MAX_LEVEL 限制最大层数，通常取 16 或 32', '随机化保证整体平衡，无需旋转操作'],
      complexity: { time: 'O(log n)', space: 'O(1)' },
    },
    {
      id: 'search',
      title: '搜索路径',
      description: '从最高层开始，向右走到下一个节点值大于目标前停止，然后下降一层，直到第 0 层',
      codeSnippet: `function search(value) {
  let current = head
  for (let i = level - 1; i >= 0; i--) {
    while (current.forward[i] && current.forward[i].value < value) {
      current = current.forward[i]
    }
  }
  current = current.forward[0]
  return current && current.value === value
}`,
      highlightedLine: 4,
      highlightTerms: ['forward[i]', 'level - 1', 'current'],
      tips: ['从最高层开始可以快速跳过大量节点', '下降到第 0 层时即定位到目标或确认不存在', '期望查找路径长度为 O(log n)'],
      complexity: { time: 'O(log n)', space: 'O(1)' },
    },
    {
      id: 'insert',
      title: '插入与连接',
      description: '搜索插入位置时记录每层的前驱节点，然后用 randomLevel 决定新节点层数，逐层插入连接',
      codeSnippet: `function insert(value) {
  const update = new Array(MAX_LEVEL)
  let current = head
  for (let i = level - 1; i >= 0; i--) {
    while (current.forward[i] && current.forward[i].value < value) {
      current = current.forward[i]
    }
    update[i] = current
  }
  const newNode = new Node(value, randomLevel())
  for (let i = 0; i < newNode.level; i++) {
    newNode.forward[i] = update[i].forward[i]
    update[i].forward[i] = newNode
  }
}`,
      highlightedLine: 10,
      highlightTerms: ['update', 'randomLevel', 'forward'],
      tips: ['update 数组记录每层的前驱节点', '新节点层数可能超过当前 level，需更新 level', '插入操作期望 O(log n)'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'delete',
      title: '删除节点',
      description: '类似插入，记录每层前驱节点，然后逐层解除连接，最后更新 level',
      codeSnippet: `function delete(value) {
  const update = new Array(MAX_LEVEL)
  let current = head
  for (let i = level - 1; i >= 0; i--) {
    while (current.forward[i] && current.forward[i].value < value) {
      current = current.forward[i]
    }
    update[i] = current
  }
  const target = current.forward[0]
  if (target && target.value === value) {
    for (let i = 0; i < level; i++) {
      if (update[i].forward[i] !== target) break
      update[i].forward[i] = target.forward[i]
    }
  }
}`,
      highlightedLine: 11,
      highlightTerms: ['update', 'forward', 'target'],
      tips: ['删除时需更新所有包含该节点的层', '删除后可能需要降低 level', '删除操作期望 O(log n)'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'complexity',
      title: '复杂度分析',
      description: '跳表所有操作期望 O(log n)，最坏 O(n) 但概率极低，空间复杂度 O(n)',
      codeSnippet: `// 期望复杂度（P = 0.5）：
// 查找：O(log n)
// 插入：O(log n)
// 删除：O(log n)
// 空间：O(n)（每个节点期望出现在 2 层）
//
// 最坏情况：O(n)（概率极低）`,
      highlightedLine: 2,
      highlightTerms: ['O(log n)', 'O(n)'],
      tips: ['跳表与红黑树性能相当，但实现更简单', '跳表支持高效的范围查询，红黑树需要中序遍历', '并发场景下跳表更易实现无锁版本'],
    },
  ],
}
