/**
 * v20 M7 — learning config "prim" 中文 locale（自动从 src/configs/learning/prim.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const primLearningSteps = {
  steps: {
    "init": {
      title: '初始化',
      description: '从任意节点开始，将其加入最小生成树（MST）集合',
      tips: 'Prim 算法从一个节点出发逐步扩展 MST|适用于稠密图',
      highlightTerms: 'inMST|start',
      complexityTime: 'O(V²)',
      complexitySpace: 'O(V)',
    },
    "select": {
      title: '选择最小边',
      description: '在所有连接 MST 内部和外部的边中，选择权重最小的边',
      tips: '这条边必须一端在 MST 内、一端在 MST 外|使用优先队列可以优化到 O(E log V)',
      highlightTerms: '!inMST.has(v)|w < minEdge.w',
    },
    "add": {
      title: '加入 MST',
      description: '将最小边对应的节点加入 MST，边加入结果集',
      tips: '如果找不到最小边说明图不连通，无法生成完整 MST',
      highlightTerms: 'inMST.add|mst.push',
    },
    "complete": {
      title: '算法完成',
      description: 'MST 包含 V-1 条边，连接所有节点且总权重最小',
      tips: '最小生成树一定有 V-1 条边|Prim 适合稠密图，Kruskal 适合稀疏图',
      highlightTerms: 'V-1|totalWeight',
      complexityTime: 'O(V²)',
      complexitySpace: 'O(V)',
    },
  },
} as const
