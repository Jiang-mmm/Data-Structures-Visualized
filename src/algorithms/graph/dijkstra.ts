import type { GraphAlgorithmResult } from './bfs'

export interface DijkstraResult extends GraphAlgorithmResult {
  distances: Map<string, number>
  previousNodes: Map<string, string | null>
}

export async function dijkstra(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<DijkstraResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []
  const distances = new Map<string, number>()
  const previousNodes = new Map<string, string | null>()

  for (const node of adjacencyList.keys()) {
    distances.set(node, Infinity)
    previousNodes.set(node, null)
  }
  distances.set(startNode, 0)

  steps.push({ type: 'init', node: startNode })
  onStep?.(steps[steps.length - 1])

  const unvisited = new Set(adjacencyList.keys())

  while (unvisited.size > 0) {
    let minNode: string | null = null
    let minDist = Infinity
    for (const node of unvisited) {
      const dist = distances.get(node)!
      if (dist < minDist) {
        minDist = dist
        minNode = node
      }
    }

    if (minNode === null || minDist === Infinity) break

    unvisited.delete(minNode)
    visited.push(minNode)

    steps.push({ type: 'visit', node: minNode })
    onStep?.(steps[steps.length - 1])

    const neighbors = adjacencyList.get(minNode) || []
    for (const { node: neighbor, weight = 1 } of neighbors) {
      if (!unvisited.has(neighbor)) continue

      const newDist = distances.get(minNode)! + weight
      if (newDist < distances.get(neighbor)!) {
        distances.set(neighbor, newDist)
        previousNodes.set(neighbor, minNode)

        steps.push({ type: 'edge', edge: { from: minNode, to: neighbor } })
        onStep?.(steps[steps.length - 1])
      }
    }
  }

  // Build final shortest-path tree edges from previousNodes
  for (const [node, prev] of previousNodes) {
    if (prev !== null) {
      edges.push({ from: prev, to: node })
    }
  }

  return { visited, edges, steps, distances, previousNodes }
}
