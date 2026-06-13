export interface GraphAlgorithmResult {
  visited: string[]
  edges: Array<{ from: string; to: string }>
  steps: Array<{ type: string; node?: string; edge?: { from: string; to: string }; queue?: string[] }>
}

export async function bfs(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<GraphAlgorithmResult> {
  const visited: string[] = []
  const edges: Array<{ from: string; to: string }> = []
  const steps: GraphAlgorithmResult['steps'] = []

  const visitedSet = new Set<string>()
  const queue: string[] = [startNode]
  visitedSet.add(startNode)

  steps.push({ type: 'init', node: startNode, queue: [...queue] })
  onStep?.(steps[steps.length - 1])

  while (queue.length > 0) {
    const current = queue.shift()!
    visited.push(current)

    steps.push({ type: 'visit', node: current, queue: [...queue] })
    onStep?.(steps[steps.length - 1])

    const neighbors = adjacencyList.get(current) || []
    for (const { node: neighbor } of neighbors) {
      if (!visitedSet.has(neighbor)) {
        visitedSet.add(neighbor)
        edges.push({ from: current, to: neighbor })
        queue.push(neighbor)

        steps.push({ type: 'edge', edge: { from: current, to: neighbor }, queue: [...queue] })
        onStep?.(steps[steps.length - 1])
      }
    }
  }

  return { visited, edges, steps }
}
