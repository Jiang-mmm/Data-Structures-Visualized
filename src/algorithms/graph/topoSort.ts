import type { GraphAlgorithmResult } from './bfs'

export interface TopoSortResult extends GraphAlgorithmResult {
  isDAG: boolean
}

export async function topoSort(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<TopoSortResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []

  const inDegree = new Map<string, number>()
  for (const node of adjacencyList.keys()) {
    inDegree.set(node, 0)
  }
  for (const [, neighbors] of adjacencyList) {
    for (const { node: neighbor } of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [node, degree] of inDegree) {
    if (degree === 0) queue.push(node)
  }

  steps.push({ type: 'init', queue: [...queue] })
  onStep?.(steps[steps.length - 1])

  while (queue.length > 0) {
    const current = queue.shift()!
    visited.push(current)

    steps.push({ type: 'visit', node: current, queue: [...queue] })
    onStep?.(steps[steps.length - 1])

    const neighbors = adjacencyList.get(current) || []
    for (const { node: neighbor } of neighbors) {
      edges.push({ from: current, to: neighbor })
      const newDegree = inDegree.get(neighbor)! - 1
      inDegree.set(neighbor, newDegree)

      if (newDegree === 0) {
        queue.push(neighbor)
      }

      steps.push({ type: 'edge', edge: { from: current, to: neighbor }, queue: [...queue] })
      onStep?.(steps[steps.length - 1])
    }
  }

  const isDAG = visited.length === adjacencyList.size

  return { visited, edges, steps, isDAG }
}
