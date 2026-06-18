import type { GraphAlgorithmResult } from './bfs'

/**
 * Floyd-Warshall 算法结果
 * 包含所有节点对之间的最短距离矩阵
 */
export interface FloydWarshallResult extends GraphAlgorithmResult {
  /** 距离矩阵，dist.get(a)!.get(b) 表示 a→b 的最短距离 */
  dist: Map<string, Map<string, number>>
  /** 下一跳矩阵，用于路径重建 */
  next: Map<string, Map<string, string | null>>
}

/**
 * Floyd-Warshall 全源最短路径算法
 *
 * 通过动态规划计算图中所有节点对之间的最短路径。
 * 核心思想：dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
 *
 * 时间复杂度: O(V³)
 * 空间复杂度: O(V²)
 *
 * @param adjacencyList 邻接表
 * @param onStep 可选的步骤回调
 */
export async function floydWarshall(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<FloydWarshallResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []

  const nodes = Array.from(adjacencyList.keys())
  const dist = new Map<string, Map<string, number>>()
  const next = new Map<string, Map<string, string | null>>()

  // 1. 初始化距离矩阵和下一跳矩阵
  for (const a of nodes) {
    dist.set(a, new Map())
    next.set(a, new Map())
    for (const b of nodes) {
      if (a === b) {
        dist.get(a)!.set(b, 0)
        next.get(a)!.set(b, a)
      } else {
        dist.get(a)!.set(b, Infinity)
        next.get(a)!.set(b, null)
      }
    }
  }

  // 2. 填入直接边的权重
  for (const [from, neighbors] of adjacencyList) {
    for (const { node: to, weight = 1 } of neighbors) {
      dist.get(from)!.set(to, weight)
      next.get(from)!.set(to, to)
    }
  }

  steps.push({ type: 'init' })
  onStep?.(steps[steps.length - 1])

  // 3. 三重循环：以每个节点 k 为中转点，尝试松弛所有节点对 (i, j)
  for (const k of nodes) {
    if (!visited.includes(k)) visited.push(k)

    for (const i of nodes) {
      for (const j of nodes) {
        const distIK = dist.get(i)!.get(k)!
        const distKJ = dist.get(k)!.get(j)!
        const distIJ = dist.get(i)!.get(j)!

        if (distIK + distKJ < distIJ) {
          dist.get(i)!.set(j, distIK + distKJ)
          next.get(i)!.set(j, next.get(i)!.get(k) ?? null)

          steps.push({ type: 'edge', edge: { from: i, to: j } })
          onStep?.(steps[steps.length - 1])
        }
      }
    }

    steps.push({ type: 'visit', node: k })
    onStep?.(steps[steps.length - 1])
  }

  // 4. 构建最小生成树边（取每个节点到其他节点的最短边）
  for (const [from, targets] of next) {
    for (const [to, nextNode] of targets) {
      if (nextNode !== null && nextNode !== to && from !== to) {
        edges.push({ from, to: nextNode })
      }
    }
  }

  return { visited, edges, steps, dist, next }
}
