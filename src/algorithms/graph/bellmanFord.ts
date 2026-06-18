import type { GraphAlgorithmResult } from './bfs'

/**
 * Bellman-Ford 算法结果
 * 支持负权边检测，可报告负权环
 */
export interface BellmanFordResult extends GraphAlgorithmResult {
  distances: Map<string, number>
  previousNodes: Map<string, string | null>
  hasNegativeCycle: boolean
}

/**
 * Bellman-Ford 单源最短路径算法
 *
 * 与 Dijkstra 不同，Bellman-Ford 可以处理负权边，并能检测负权环。
 * 通过对所有边进行 V-1 轮松弛操作，保证得到最短路径。
 * 第 V 轮如果仍能松弛，则存在负权环。
 *
 * 时间复杂度: O(V·E)
 * 空间复杂度: O(V)
 *
 * @param adjacencyList 邻接表，键为节点 id，值为邻居数组（含权重）
 * @param startNode 起始节点 id
 * @param onStep 可选的步骤回调，用于可视化
 */
export async function bellmanFord(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<BellmanFordResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []
  const distances = new Map<string, number>()
  const previousNodes = new Map<string, string | null>()

  // 1. 初始化：所有距离设为无穷大，前驱设为 null
  for (const node of adjacencyList.keys()) {
    distances.set(node, Infinity)
    previousNodes.set(node, null)
  }
  distances.set(startNode, 0)

  steps.push({ type: 'init', node: startNode })
  onStep?.(steps[steps.length - 1])

  // 收集所有边（用于松弛）
  const allEdges: Array<{ from: string; to: string; weight: number }> = []
  for (const [from, neighbors] of adjacencyList) {
    for (const { node: to, weight = 1 } of neighbors) {
      allEdges.push({ from, to, weight })
    }
  }

  const nodeCount = adjacencyList.size

  // 2. 对所有边进行 V-1 轮松弛
  for (let i = 0; i < nodeCount - 1; i++) {
    let updated = false
    for (const { from, to, weight } of allEdges) {
      const fromDist = distances.get(from)!
      const toDist = distances.get(to)!
      const newDist = fromDist + weight

      if (newDist < toDist) {
        distances.set(to, newDist)
        previousNodes.set(to, from)
        updated = true

        if (!visited.includes(to)) {
          visited.push(to)
        }

        steps.push({ type: 'edge', edge: { from, to } })
        onStep?.(steps[steps.length - 1])
      }
    }
    // 如果某一轮没有更新，可以提前结束
    if (!updated) break
  }

  // 3. 第 V 轮检测负权环
  let hasNegativeCycle = false
  for (const { from, to, weight } of allEdges) {
    const fromDist = distances.get(from)!
    const toDist = distances.get(to)!
    if (fromDist + weight < toDist) {
      hasNegativeCycle = true
      break
    }
  }

  // 4. 构建最短路径树边
  for (const [node, prev] of previousNodes) {
    if (prev !== null) {
      edges.push({ from: prev, to: node })
    }
  }

  return { visited, edges, steps, distances, previousNodes, hasNegativeCycle }
}
