import type { GraphAlgorithmResult } from './bfs'

/**
 * Prim 算法结果
 * 包含最小生成树的边集合和总权重
 */
export interface PrimResult extends GraphAlgorithmResult {
  /** 最小生成树的边 */
  mstEdges: Array<{ from: string; to: string; weight: number }>
  /** 最小生成树总权重 */
  totalWeight: number
}

/**
 * Prim 最小生成树算法
 *
 * 从任意起始节点出发，每次选择连接已访问集合和未访问集合的权重最小的边，
 * 将对应节点加入最小生成树。适用于稠密图。
 *
 * 时间复杂度: O(V²)（朴素实现）/ O(E log V)（堆优化）
 * 空间复杂度: O(V)
 *
 * @param adjacencyList 邻接表
 * @param startNode 起始节点 id
 * @param onStep 可选的步骤回调
 */
export async function prim(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<PrimResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []
  const mstEdges: Array<{ from: string; to: string; weight: number }> = []
  let totalWeight = 0

  const inMST = new Set<string>()

  steps.push({ type: 'init', node: startNode })
  onStep?.(steps[steps.length - 1])

  // 将起始节点加入 MST
  inMST.add(startNode)
  visited.push(startNode)

  steps.push({ type: 'visit', node: startNode })
  onStep?.(steps[steps.length - 1])

  // 当 MST 未包含所有节点时继续
  while (inMST.size < adjacencyList.size) {
    let minWeight = Infinity
    let minEdge: { from: string; to: string; weight: number } | null = null

    // 遍历 MST 中所有节点的边，找到连接 MST 外节点的最小权重边
    for (const node of inMST) {
      const neighbors = adjacencyList.get(node) || []
      for (const { node: neighbor, weight = 1 } of neighbors) {
        if (!inMST.has(neighbor) && weight < minWeight) {
          minWeight = weight
          minEdge = { from: node, to: neighbor, weight }
        }
      }
    }

    if (minEdge === null) {
      // 图不连通，无法继续
      break
    }

    // 将最小边对应的节点加入 MST
    inMST.add(minEdge.to)
    visited.push(minEdge.to)
    mstEdges.push(minEdge)
    totalWeight += minEdge.weight
    edges.push({ from: minEdge.from, to: minEdge.to })

    steps.push({ type: 'edge', edge: { from: minEdge.from, to: minEdge.to } })
    onStep?.(steps[steps.length - 1])

    steps.push({ type: 'visit', node: minEdge.to })
    onStep?.(steps[steps.length - 1])
  }

  return { visited, edges, steps, mstEdges, totalWeight }
}
