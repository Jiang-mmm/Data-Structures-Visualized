import type { GraphAlgorithmResult } from './bfs'

/**
 * Kruskal 算法结果
 * 包含最小生成树的边集合和总权重
 */
export interface KruskalResult extends GraphAlgorithmResult {
  /** 最小生成树的边 */
  mstEdges: Array<{ from: string; to: string; weight: number }>
  /** 最小生成树总权重 */
  totalWeight: number
}

/**
 * 并查集（Union-Find）辅助数据结构
 * 用于 Kruskal 算法中的环检测
 */
class UnionFind {
  private parent: Map<string, string>
  private rank: Map<string, number>

  constructor(nodes: Iterable<string>) {
    this.parent = new Map()
    this.rank = new Map()
    for (const node of nodes) {
      this.parent.set(node, node)
      this.rank.set(node, 0)
    }
  }

  /** 查找根节点（带路径压缩） */
  find(node: string): string {
    const root = this.parent.get(node)
    if (root === undefined) return node
    if (root !== node) {
      // 路径压缩：直接指向根节点
      this.parent.set(node, this.find(root))
    }
    return this.parent.get(node)!
  }

  /** 合并两个集合（按秩合并） */
  union(a: string, b: string): boolean {
    const rootA = this.find(a)
    const rootB = this.find(b)

    if (rootA === rootB) {
      // 已在同一集合，合并会产生环
      return false
    }

    // 按秩合并：将矮树挂到高树下
    const rankA = this.rank.get(rootA) || 0
    const rankB = this.rank.get(rootB) || 0

    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
    }

    return true
  }
}

/**
 * Kruskal 最小生成树算法
 *
 * 将所有边按权重排序，依次选择不会形成环的最小边加入 MST。
 * 使用并查集（Union-Find）进行高效的环检测。适用于稀疏图。
 *
 * 时间复杂度: O(E log E)（排序主导）
 * 空间复杂度: O(V)
 *
 * @param adjacencyList 邻接表
 * @param onStep 可选的步骤回调
 */
export async function kruskal(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<KruskalResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []
  const mstEdges: Array<{ from: string; to: string; weight: number }> = []
  let totalWeight = 0

  // 1. 收集所有边并去重（无向图每条边只保留一份）
  const allEdges: Array<{ from: string; to: string; weight: number }> = []
  const seenEdges = new Set<string>()

  for (const [from, neighbors] of adjacencyList) {
    for (const { node: to, weight = 1 } of neighbors) {
      // 无向图边去重：使用 "min-max" 作为 key
      const edgeKey = from < to ? `${from}-${to}` : `${to}-${from}`
      if (!seenEdges.has(edgeKey)) {
        seenEdges.add(edgeKey)
        allEdges.push({ from, to, weight })
      }
    }
  }

  // 2. 按权重升序排序
  allEdges.sort((a, b) => a.weight - b.weight)

  steps.push({ type: 'init' })
  onStep?.(steps[steps.length - 1])

  // 3. 初始化并查集
  const uf = new UnionFind(adjacencyList.keys())

  // 4. 依次选择最小边，如果不形成环则加入 MST
  for (const { from, to, weight } of allEdges) {
    if (uf.union(from, to)) {
      // 合并成功，不形成环，加入 MST
      mstEdges.push({ from, to, weight })
      totalWeight += weight
      edges.push({ from, to })

      if (!visited.includes(from)) visited.push(from)
      if (!visited.includes(to)) visited.push(to)

      steps.push({ type: 'edge', edge: { from, to } })
      onStep?.(steps[steps.length - 1])

      // MST 已包含 V-1 条边，提前结束
      if (mstEdges.length === adjacencyList.size - 1) break
    }
  }

  return { visited, edges, steps, mstEdges, totalWeight }
}
