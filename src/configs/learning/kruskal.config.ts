import type { LearningModeConfig } from './types'

/**
 * Kruskal 算法学习配置
 */
export const kruskalConfig: LearningModeConfig = {
  algorithmKey: 'kruskal',
  steps: [
    {
      id: 'sort',
      title: '边排序',
      description: '将所有边按权重升序排序，贪心策略从最小边开始选择',
      codeSnippet: `function kruskal(graph) {
  const edges = graph.getAllEdges()
  edges.sort((a, b) => a.w - b.w)
}`,
      highlightedLine: 4,
      highlightTerms: ['sort', 'a.w - b.w'],
      tips: ['排序是 Kruskal 的主要时间开销 O(E log E)', '贪心策略保证总权重最小'],
      complexity: { time: 'O(E log E)', space: 'O(V)' },
    },
    {
      id: 'union-find',
      title: '并查集初始化',
      description: '使用并查集（Union-Find）高效检测加入边是否形成环',
      codeSnippet: `  const uf = new UnionFind(nodes)
  // find(x): 查找 x 的根节点（带路径压缩）
  // union(a, b): 合并 a, b 所在集合，返回是否成功（不成环）`,
      highlightedLine: 2,
      highlightTerms: ['UnionFind', 'find', 'union'],
      tips: ['路径压缩 + 按秩合并使 find/union 接近 O(1)', '并查集是 Kruskal 的核心数据结构'],
    },
    {
      id: 'select',
      title: '贪心选择',
      description: '依次考察排序后的边，如果不形成环则加入 MST',
      codeSnippet: `  const mst = []
  for (const edge of edges) {
    if (uf.union(edge.u, edge.v)) {
      mst.push(edge)
      if (mst.length === V - 1) break
    }
  }`,
      highlightedLine: 3,
      highlightTerms: ['uf.union', 'mst.push'],
      tips: ['union 返回 false 表示 u, v 已在同一集合，加入会成环', 'MST 有 V-1 条边，达到后提前终止'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: 'MST 包含 V-1 条边，总权重最小',
      codeSnippet: `  // mst.length === V - 1
  // totalWeight = mst.reduce((s, e) => s + e.w, 0)`,
      highlightedLine: 2,
      highlightTerms: ['V - 1', 'totalWeight'],
      tips: ['Kruskal 适合稀疏图（边数少）', '与 Prim 不同，Kruskal 按边排序而非按节点扩展'],
      complexity: { time: 'O(E log E)', space: 'O(V)' },
    },
  ],
}
