import type { GraphAlgorithmResult } from './bfs'

export async function dfs(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<GraphAlgorithmResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []

  const visitedSet = new Set<string>()

  async function dfsHelper(node: string) {
    visitedSet.add(node)
    visited.push(node)

    steps.push({ type: 'visit', node })
    onStep?.(steps[steps.length - 1])

    const neighbors = adjacencyList.get(node) || []
    for (const { node: neighbor } of neighbors) {
      if (!visitedSet.has(neighbor)) {
        edges.push({ from: node, to: neighbor })

        steps.push({ type: 'edge', edge: { from: node, to: neighbor } })
        onStep?.(steps[steps.length - 1])

        await dfsHelper(neighbor)
      }
    }
  }

  steps.push({ type: 'init', node: startNode })
  onStep?.(steps[steps.length - 1])

  await dfsHelper(startNode)

  return { visited, edges, steps }
}
