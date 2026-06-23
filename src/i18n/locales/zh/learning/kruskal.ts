/**
 * v20 M7 — learning config "kruskal" 中文 locale（自动从 src/configs/learning/kruskal.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const kruskalLearningSteps = {
  steps: {
    "sort": {
      title: '边排序',
      description: '将所有边按权重升序排序，贪心策略从最小边开始选择',
      tips: '排序是 Kruskal 的主要时间开销 O(E log E)|贪心策略保证总权重最小',
      highlightTerms: 'sort|a.w - b.w',
      complexityTime: 'O(E log E)',
      complexitySpace: 'O(V)',
    },
    "union-find": {
      title: '并查集初始化',
      description: '使用并查集（Union-Find）高效检测加入边是否形成环',
      tips: '路径压缩 + 按秩合并使 find/union 接近 O(1)|并查集是 Kruskal 的核心数据结构',
      highlightTerms: 'UnionFind|find|union',
    },
    "select": {
      title: '贪心选择',
      description: '依次考察排序后的边，如果不形成环则加入 MST',
      tips: 'union 返回 false 表示 u, v 已在同一集合，加入会成环|MST 有 V-1 条边，达到后提前终止',
      highlightTerms: 'uf.union|mst.push',
    },
    "complete": {
      title: '算法完成',
      description: 'MST 包含 V-1 条边，总权重最小',
      tips: 'Kruskal 适合稀疏图（边数少）|与 Prim 不同，Kruskal 按边排序而非按节点扩展',
      highlightTerms: 'V - 1|totalWeight',
      complexityTime: 'O(E log E)',
      complexitySpace: 'O(V)',
    },
  },
} as const
