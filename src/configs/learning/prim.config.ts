import type { LearningModeConfig } from './types'

/**
 * Prim 算法学习配置
 */
export const primConfig: LearningModeConfig = {
  algorithmKey: 'prim',
  steps: [
    {
      id: 'init',
      title: '初始化',
      description: '从任意节点开始，将其加入最小生成树（MST）集合',
      codeSnippet: `function prim(graph, start) {
  const inMST = new Set([start])
  const mst = []
}`,
      highlightedLine: 3,
      highlightTerms: ['inMST', 'start'],
      tips: ['Prim 算法从一个节点出发逐步扩展 MST', '适用于稠密图'],
      complexity: { time: 'O(V²)', space: 'O(V)' },
    },
    {
      id: 'select',
      title: '选择最小边',
      description: '在所有连接 MST 内部和外部的边中，选择权重最小的边',
      codeSnippet: `  while (inMST.size < V) {
    let minEdge = null
    for (const u of inMST) {
      for (const [v, w] of graph[u]) {
        if (!inMST.has(v) && (!minEdge || w < minEdge.w)) {
          minEdge = { u, v, w }
        }
      }
    }`,
      highlightedLine: 6,
      highlightTerms: ['!inMST.has(v)', 'w < minEdge.w'],
      tips: ['这条边必须一端在 MST 内、一端在 MST 外', '使用优先队列可以优化到 O(E log V)'],
    },
    {
      id: 'add',
      title: '加入 MST',
      description: '将最小边对应的节点加入 MST，边加入结果集',
      codeSnippet: `    if (minEdge) {
      inMST.add(minEdge.v)
      mst.push(minEdge)
    } else {
      break // 图不连通
    }
  }`,
      highlightedLine: 3,
      highlightTerms: ['inMST.add', 'mst.push'],
      tips: ['如果找不到最小边说明图不连通，无法生成完整 MST'],
    },
    {
      id: 'complete',
      title: '算法完成',
      description: 'MST 包含 V-1 条边，连接所有节点且总权重最小',
      codeSnippet: `  // mst 包含 V-1 条边
  // totalWeight = mst.reduce((s, e) => s + e.w, 0)`,
      highlightedLine: 2,
      highlightTerms: ['V-1', 'totalWeight'],
      tips: ['最小生成树一定有 V-1 条边', 'Prim 适合稠密图，Kruskal 适合稀疏图'],
      complexity: { time: 'O(V²)', space: 'O(V)' },
    },
  ],
}
