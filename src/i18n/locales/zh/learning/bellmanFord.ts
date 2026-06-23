/**
 * v20 M7 — learning config "bellmanFord" 中文 locale（自动从 src/configs/learning/bellmanFord.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const bellmanFordLearningSteps = {
  steps: {
    "init": {
      title: '初始化距离表',
      description: '所有节点距离设为无穷大，起始节点距离为 0。Bellman-Ford 与 Dijkstra 不同，可以处理负权边',
      tips: 'Infinity 表示尚未找到路径，起始节点距离为 0',
      highlightTerms: 'dist[start] = 0|Infinity',
      complexityTime: 'O(V·E)',
      complexitySpace: 'O(V)',
    },
    "relax": {
      title: '边松弛（V-1 轮）',
      description: '对所有边进行 V-1 轮松弛操作。每轮遍历所有边，尝试通过当前距离更新邻居的最短距离',
      tips: 'V-1 轮是因为最短路径最多经过 V-1 条边|如果某轮没有更新可以提前终止',
      highlightTerms: 'dist[u] + w|dist[v]',
    },
    "negative-cycle": {
      title: '负权环检测',
      description: '第 V 轮如果仍能松弛，说明存在负权环——可以无限减小路径长度',
      tips: '负权环意味着可以无限绕圈减小距离，最短路径无定义|Dijkstra 无法检测负权环',
      highlightTerms: 'dist[u] + w < dist[v]|负权环',
      complexityTime: 'O(V·E)',
      complexitySpace: 'O(V)',
    },
    "complete": {
      title: '算法完成',
      description: 'dist 表包含从起点到每个节点的最短距离（若无负权环）',
      tips: 'Bellman-Ford 牺牲速度换取了处理负权边的能力',
      highlightTerms: 'dist|负权边',
    },
  },
} as const
