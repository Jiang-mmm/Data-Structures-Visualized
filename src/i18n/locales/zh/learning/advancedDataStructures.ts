/**
 * v20 M7 — learning config "advancedDataStructures" 中文 locale（自动从 src/configs/learning/advancedDataStructures.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const advancedDataStructuresLearningSteps = {
  steps: {
    "redBlackTree": {
      title: '红黑树应用',
      description: '红黑树是自平衡二叉搜索树，通过颜色约束保证最长路径不超过最短路径两倍，查找/插入/删除均 O(log n)。Java TreeMap、C++ std::map、Linux 进程调度 cfs 均基于红黑树',
      tips: '红黑树比 AVL 树旋转次数少，插入删除更高效，因此工程中更常用；AVL 树查找更严格平衡',
      highlightTerms: '红黑树|O(log n)|旋转|变色',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "bTree": {
      title: 'B树数据库索引',
      description: 'B树是多路平衡查找树，每个节点可包含多个键和多个子节点，专为磁盘存储优化。数据库索引（MySQL InnoDB）使用 B+树，减少磁盘 IO 次数',
      tips: 'B 树节点大小通常等于磁盘页（如 16KB），一次 IO 读取整个节点，是"为磁盘而生"的结构',
      highlightTerms: 'B树|B+树|磁盘 IO|扇出',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "skipList": {
      title: '跳表 Redis 应用',
      description: '跳表通过多层索引链表实现 O(log n) 查找，是平衡树的概率替代方案。Redis 有序集合（ZSET）、LevelDB MemTable 均基于跳表实现',
      tips: '跳表实现比红黑树简单得多（无需旋转），且支持高效范围查询，Redis 作者明确选择跳表替代平衡树',
      highlightTerms: '跳表|多层|O(log n)|Redis',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "bloomFilter": {
      title: '布隆过滤器',
      description: '布隆过滤器是概率型数据结构，用位数组 + 多个哈希函数判断元素"可能存在"或"一定不存在"。空间效率极高，用于缓存穿透防护、垃圾邮件过滤',
      tips: '1MB 位数组 + 7 个哈希函数可容纳约 10 万元素，误判率约 1%；无法删除元素（可用计数布隆过滤器解决）',
      highlightTerms: '布隆过滤器|位数组|哈希函数|误判率',
      complexityTime: 'O(k)',
      complexitySpace: 'O(m)',
    },
    "unionFind": {
      title: '并查集',
      description: '并查集（DSU）高效处理不相交集合的合并与查询，配合路径压缩和按秩合并，单次操作近似 O(1)。用于 Kruskal 最小生成树、连通分量、网络连通性判断',
      tips: '路径压缩 + 按秩合并后，单次操作均摊复杂度为 O(α(n))，α(n) < 5（n < 10⁸⁰），实际可视为 O(1)',
      highlightTerms: '并查集|路径压缩|按秩合并|连通',
      complexityTime: 'O(α(n)) 近似 O(1)',
      complexitySpace: 'O(n)',
    },
  },
} as const
