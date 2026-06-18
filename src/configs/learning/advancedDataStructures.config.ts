import type { LearningModeConfig } from './types'

export const advancedDataStructuresConfig: LearningModeConfig = {
  algorithmKey: 'advancedDataStructures',
  steps: [
    {
      id: 'redBlackTree',
      title: '红黑树应用',
      description: '红黑树是自平衡二叉搜索树，通过颜色约束保证最长路径不超过最短路径两倍，查找/插入/删除均 O(log n)。Java TreeMap、C++ std::map、Linux 进程调度 cfs 均基于红黑树',
      codeSnippet: `// 红黑树五大性质
// 1. 节点是红色或黑色
// 2. 根节点是黑色
// 3. 叶子节点（NIL）是黑色
// 4. 红色节点的子节点必须是黑色（不能有连续红节点）
// 5. 任一节点到其叶子节点的所有路径包含相同数量的黑色节点

// 插入后通过"变色 + 旋转"恢复平衡
function insert(root, node) {
  // 1. 按 BST 规则插入，新节点标记为红色
  root = bstInsert(root, node)
  node.color = RED
  // 2. 修复红黑性质（叔节点变色 / 旋转）
  return fixViolation(root, node)
}
// 应用：Java TreeMap、Linux CFS 调度器、C++ std::map`,
      highlightedLine: 11,
      highlightTerms: ['红黑树', 'O(log n)', '旋转', '变色'],
      tips: ['红黑树比 AVL 树旋转次数少，插入删除更高效，因此工程中更常用；AVL 树查找更严格平衡'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'bTree',
      title: 'B树数据库索引',
      description: 'B树是多路平衡查找树，每个节点可包含多个键和多个子节点，专为磁盘存储优化。数据库索引（MySQL InnoDB）使用 B+树，减少磁盘 IO 次数',
      codeSnippet: `// B树（m 阶）性质
// - 每个节点最多 m 个子节点，最多 m-1 个键
// - 非根非叶节点至少 ⌈m/2⌉ 个子节点
// - 所有叶子节点在同一层（绝对平衡）
// - 节点内键有序，键之间的子树范围确定

// B+树（数据库索引常用变体）
// - 非叶节点仅存索引，数据只在叶子
// - 叶子节点通过链表相连，支持范围查询
// 优势：扇出大 → 树矮 → 磁盘 IO 少
// 例：3 层 B+树，扇出 1000 → 可索引 10⁹ 条记录
//   根(1次IO) → 中间(1次IO) → 叶子(1次IO) = 3 次 IO`,
      highlightedLine: 11,
      highlightTerms: ['B树', 'B+树', '磁盘 IO', '扇出'],
      tips: ['B 树节点大小通常等于磁盘页（如 16KB），一次 IO 读取整个节点，是"为磁盘而生"的结构'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'skipList',
      title: '跳表 Redis 应用',
      description: '跳表通过多层索引链表实现 O(log n) 查找，是平衡树的概率替代方案。Redis 有序集合（ZSET）、LevelDB MemTable 均基于跳表实现',
      codeSnippet: `// 跳表：多层有序链表
// Level 3: 1 ───────────────────── 9
// Level 2: 1 ──────── 5 ─────────── 9
// Level 1: 1 ── 3 ── 5 ── 7 ─────── 9
// Level 0: 1 ── 2 ── 3 ── 4 ── 5 ── 6 ── 7 ── 8 ── 9

// 查找：从最高层开始，向右走，遇大则下降
function search(head, target) {
  let node = head
  for (let level = maxLevel; level >= 0; level--) {
    while (node.forward[level] && node.forward[level].val < target)
      node = node.forward[level]
  }
  node = node.forward[0]
  return node && node.val === target
}
// 插入时通过随机数决定节点层数（概率 p=1/2 升级）
// Redis ZSET 用跳表 + 哈希表，跳表支持范围查询，哈希表支持 O(1) 单点查找`,
      highlightedLine: 9,
      highlightTerms: ['跳表', '多层', 'O(log n)', 'Redis'],
      tips: ['跳表实现比红黑树简单得多（无需旋转），且支持高效范围查询，Redis 作者明确选择跳表替代平衡树'],
      complexity: { time: 'O(log n)', space: 'O(n)' },
    },
    {
      id: 'bloomFilter',
      title: '布隆过滤器',
      description: '布隆过滤器是概率型数据结构，用位数组 + 多个哈希函数判断元素"可能存在"或"一定不存在"。空间效率极高，用于缓存穿透防护、垃圾邮件过滤',
      codeSnippet: `// 布隆过滤器
// 位数组 + k 个哈希函数
class BloomFilter {
  constructor(size, hashCount) {
    this.bits = new Uint8Array(size)
    this.k = hashCount
  }
  add(item) {
    for (let i = 0; i < this.k; i++) {
      const h = hash(item + i) % this.bits.length
      this.bits[h] = 1
    }
  }
  contains(item) {
    for (let i = 0; i < this.k; i++) {
      const h = hash(item + i) % this.bits.length
      if (this.bits[h] === 0) return false  // 一定不存在
    }
    return true  // 可能存在（有误判率）
  }
}
// 特性：无假阴性，有假阳性
// 应用：缓存穿透防护、垃圾邮件过滤、URL 去重、区块链 SPV 验证`,
      highlightedLine: 14,
      highlightTerms: ['布隆过滤器', '位数组', '哈希函数', '误判率'],
      tips: ['1MB 位数组 + 7 个哈希函数可容纳约 10 万元素，误判率约 1%；无法删除元素（可用计数布隆过滤器解决）'],
      complexity: { time: 'O(k)', space: 'O(m)' },
    },
    {
      id: 'unionFind',
      title: '并查集',
      description: '并查集（DSU）高效处理不相交集合的合并与查询，配合路径压缩和按秩合并，单次操作近似 O(1)。用于 Kruskal 最小生成树、连通分量、网络连通性判断',
      codeSnippet: `// 并查集（带路径压缩 + 按秩合并）
class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }
  find(x) {
    // 路径压缩：查找时把节点直接挂到根
    if (this.parent[x] !== x)
      this.parent[x] = this.find(this.parent[x])
    return this.parent[x]
  }
  union(x, y) {
    const px = this.find(x), py = this.find(y)
    if (px === py) return false  // 已连通
    // 按秩合并：矮树挂高树
    if (this.rank[px] < this.rank[py]) this.parent[px] = py
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px
    else { this.parent[py] = px; this.rank[px]++ }
    return true
  }
}
// 应用：Kruskal MST、连通分量、网络连通、岛屿数量`,
      highlightedLine: 8,
      highlightTerms: ['并查集', '路径压缩', '按秩合并', '连通'],
      tips: ['路径压缩 + 按秩合并后，单次操作均摊复杂度为 O(α(n))，α(n) < 5（n < 10⁸⁰），实际可视为 O(1)'],
      complexity: { time: 'O(α(n)) 近似 O(1)', space: 'O(n)' },
    },
  ],
}
