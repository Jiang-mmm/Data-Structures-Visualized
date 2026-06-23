/**
 * v20 M7 — learning config "graph" 中文 locale（自动从 src/configs/learning/graph.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const graphLearningSteps = {
  steps: {
    "structure": {
      title: '图结构',
      description: '图由顶点（节点）和边组成，边可以有方向和权重，常用邻接矩阵或邻接表存储',
      tips: '稀疏图用邻接表 O(V+E)，稠密图用邻接矩阵 O(V²)，根据边密度选择',
      highlightTerms: '顶点|边|邻接表',
      complexityTime: '取决于操作',
      complexitySpace: '邻接表 O(V+E)，邻接矩阵 O(V²)',
    },
    "add-node": {
      title: '添加顶点',
      description: '在图中新增一个顶点，初始化其邻接关系为空',
      tips: '添加顶点后还需要添加边才能建立节点间的关系',
      highlightTerms: 'adjacency|push',
    },
    "add-edge": {
      title: '添加边',
      description: '在两个顶点之间建立连接，可指定权重，无向图需双向添加',
      tips: '有向图只需添加一条边，无向图需要添加两条方向相反的边',
      highlightTerms: 'adjacency[from]|weight',
    },
    "delete-node": {
      title: '删除顶点 Delete Node',
      description: '删除顶点及其所有关联边。需同时清理邻接表中所有指向该顶点的边。',
      tips: '删除顶点必须同时清理所有关联边|无向图删除顶点需双向清理邻接表',
      highlightTerms: 'filter|deleteNode|adjacency',
      complexityTime: 'O(V + E)',
      complexitySpace: 'O(1)',
    },
    "delete-edge": {
      title: '删除边 Delete Edge',
      description: '删除指定两个顶点之间的边。无向图需双向删除邻接表中的记录。',
      tips: '有向图只需删除一条方向，无向图需双向删除|删除不存在的边应静默处理或返回 false',
      highlightTerms: 'filter|deleteEdge',
      complexityTime: 'O(E)，E 为顶点边数',
      complexitySpace: 'O(1)',
    },
    "bfs": {
      title: '广度优先搜索 BFS',
      description: '使用队列逐层扩展，从起点出发按层访问所有可达顶点。适合无权图最短路径。',
      tips: 'BFS 可求无权图最短路径|使用队列（FIFO）保证按层顺序|时间复杂度 O(V + E)',
      highlightTerms: 'queue|shift|visited',
      complexityTime: 'O(V + E)',
      complexitySpace: 'O(V)',
    },
    "dfs": {
      title: '深度优先搜索 DFS',
      description: '使用栈或递归沿路径深入到底再回溯。适合连通性判断、拓扑排序、环检测。',
      tips: 'DFS 可用于检测环、拓扑排序、求连通分量|递归实现简洁但有栈溢出风险，大数据可用显式栈|时间复杂度 O(V + E)',
      highlightTerms: 'dfs|visited|递归',
      complexityTime: 'O(V + E)',
      complexitySpace: 'O(V) 递归栈',
    },
    "dijkstra": {
      title: '最短路径 Dijkstra',
      description: '使用优先队列贪心扩展，求单源最短路径。处理带权图（非负权）的最短路径问题。',
      tips: 'Dijkstra 不能处理负权边（需用 Bellman-Ford）|优先队列优化后复杂度 O((V+E) log V)|实际实现应使用二叉堆而非数组排序',
      highlightTerms: 'dist|pq|weight',
      complexityTime: 'O((V+E) log V)',
      complexitySpace: 'O(V)',
    },
  },
} as const
