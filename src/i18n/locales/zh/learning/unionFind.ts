/**
 * v20 M7 — learning config "unionFind" 中文 locale（自动从 src/configs/learning/unionFind.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const unionFindLearningSteps = {
  steps: {
    "intro": {
      title: '并查集简介',
      description: '并查集（Union-Find / Disjoint Set Union）是一种高效处理不相交集合合并与查询的数据结构，均摊时间复杂度接近 O(1)',
      tips: '并查集由 Bernard Galler 和 Michael Fischer 于 1964 年提出|广泛应用于连通性问题、最小生成树（Kruskal）、网络连通性|路径压缩 + 按秩合并使均摊复杂度达到 O(α(n)) ≈ O(1)',
      highlightTerms: 'parent|rank|constructor',
      complexityTime: 'O(α(n))',
      complexitySpace: 'O(n)',
    },
    "makeSet": {
      title: '初始化集合',
      description: '每个元素初始时自成一个集合，parent 指向自己，rank 为 0',
      tips: '初始时每个节点都是自己所在集合的根|rank 表示树的高度上界，初始为 0|parent[x] === x 是判断根节点的依据',
      highlightTerms: 'makeSet|parent|rank',
    },
    "find": {
      title: '查找根节点（路径压缩）',
      description: '查找节点所在集合的根，同时将路径上所有节点直接指向根，加速后续查询',
      tips: '路径压缩使树变得扁平，后续查询更快|递归实现简洁，迭代实现避免栈溢出|路径压缩不改变 rank，rank 只是高度上界',
      highlightTerms: 'find|parent[x]|路径压缩',
      complexityTime: 'O(α(n))',
      complexitySpace: 'O(α(n))',
    },
    "union": {
      title: '合并集合（按秩合并）',
      description: '将两个元素所在集合合并，按秩合并保证树的高度始终较小',
      tips: '按秩合并将矮树挂到高树下，避免树退化成链表|秩相等时任选一个作为根，并将其 rank 加 1|路径压缩 + 按秩合并 = 均摊 O(α(n))',
      highlightTerms: 'union|rank|parent',
      complexityTime: 'O(α(n))',
      complexitySpace: 'O(1)',
    },
    "connected": {
      title: '查询连通性',
      description: '判断两个元素是否属于同一集合，只需比较它们的根是否相同',
      tips: '连通性查询是并查集最核心的应用|无向图的连通分量可用并查集高效求解|社交网络中判断两人是否间接认识',
      highlightTerms: 'connected|find',
      complexityTime: 'O(α(n))',
      complexitySpace: 'O(1)',
    },
    "components": {
      title: '连通分量计数',
      description: '统计图中连通分量的数量，即不同根节点的个数',
      tips: '连通分量数 = 不同根节点的数量|Kruskal 算法中通过并查集判断是否形成环|动态连通性问题的高效解法',
      highlightTerms: 'countComponents|Set|find',
      complexityTime: 'O(n·α(n))',
      complexitySpace: 'O(n)',
    },
    "complexity": {
      title: '复杂度分析',
      description: '路径压缩 + 按秩合并使并查集所有操作均摊 O(α(n))，α 是反阿克曼函数，增长极慢',
      tips: 'α(n) 是反阿克曼函数，增长极其缓慢|实际应用中 α(n) 可视为常数（< 5）|并查集是动态连通性问题的最优解之一',
      highlightTerms: 'O(α(n))|O(1)|O(n)',
    },
  },
} as const
