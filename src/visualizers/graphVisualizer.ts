import { select, d3Drag, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'

const NODE_RADIUS = 20
const LARGE_DATA_THRESHOLD = 50

interface GraphNode {
  id: string
  group?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  weight?: number
}

interface GraphOptions {
  width: number
  height: number
  isDark?: boolean
}

interface SimNode extends GraphNode {
  x: number
  y: number
}

interface SimLink {
  source: SimNode
  target: SimNode
  weight: number
}

const INITIAL_NODES: GraphNode[] = [
  { id: 'A', group: 0 },
  { id: 'B', group: 1 },
  { id: 'C', group: 1 },
  { id: 'D', group: 2 },
  { id: 'E', group: 0 },
  { id: 'F', group: 2 },
]

const INITIAL_LINKS: GraphLink[] = [
  { source: 'A', target: 'B', weight: 4 },
  { source: 'A', target: 'C', weight: 2 },
  { source: 'B', target: 'D', weight: 5 },
  { source: 'C', target: 'D', weight: 8 },
  { source: 'C', target: 'E', weight: 3 },
  { source: 'D', target: 'F', weight: 6 },
  { source: 'E', target: 'F', weight: 1 },
]

export { INITIAL_NODES, INITIAL_LINKS }

interface SVGWithSimulation extends SVGSVGElement {
  __simulation?: ReturnType<typeof forceSimulation> | null
}

export function clearGraphSimulation(svg: SVGWithSimulation | null): void {
  if (svg && svg.__simulation) {
    svg.__simulation.stop()
    svg.__simulation = null
  }
}

function getNodeIdentifier(d: string | GraphNode): string {
  return typeof d === 'object' ? d.id : d
}

function getOrCreateSimulation(
  svg: SVGWithSimulation,
  nodes: SimNode[],
  links: SimLink[],
  width: number,
  height: number
): ReturnType<typeof forceSimulation> {
  let sim = svg.__simulation

  if (!sim) {
    sim = forceSimulation(nodes)
      .force('link', forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', forceManyBody().strength(-400))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide(NODE_RADIUS + 10))
      .alphaDecay(0.02)
      .velocityDecay(0.4)
    svg.__simulation = sim
  } else {
    sim.nodes(nodes)
    ;(sim.force('link') as any).links(links)
  }

  return sim
}

export function renderGraph(svg: SVGWithSimulation, nodes: GraphNode[], links: GraphLink[], options: GraphOptions = {} as GraphOptions): void {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)

  if (svg.__simulation) {
    svg.__simulation.stop()
    svg.__simulation = null
  }

  container.selectAll('*').interrupt()
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!nodes || nodes.length === 0) {
    container.append('text').attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyGraphShort'))
    return
  }

  const simNodes: SimNode[] = nodes.map(n => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 }))
  const simLinks: SimLink[] = links.map(l => ({
    source: l.source as unknown as SimNode,
    target: l.target as unknown as SimNode,
    weight: l.weight,
  }))
  const sim = getOrCreateSimulation(svg, simNodes, simLinks, width, height)
  sim.alpha(1).restart()

  const linkGroup = container.append('g').attr('class', 'links')
  const nodeGroup = container.append('g').attr('class', 'nodes')
  container.append('g').attr('class', 'labels')

  const linkElements = linkGroup.selectAll('line')
    .data(simLinks, (d: any) => `${getNodeIdentifier(d.source)}-${getNodeIdentifier(d.target)}`)
    .join('line')
    .attr('stroke', C.edgeDefault).attr('stroke-width', 2)
    .attr('marker-end', 'url(#g-arrow)')

  const weightLabels = linkGroup.selectAll('text')
    .data(simLinks, (d: any) => `${getNodeIdentifier(d.source)}-${getNodeIdentifier(d.target)}`)
    .join('text')
    .attr('fill', C.textSecondary).attr('font-size', '11px')
    .attr('text-anchor', 'middle').attr('dy', -6)
    .text((d: any) => d.weight)

  container.append('defs').append('marker')
    .attr('id', 'g-arrow').attr('viewBox', '0 0 10 10')
    .attr('refX', 26).attr('refY', 5)
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .attr('orient', 'auto-start-reverse')
    .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', C.arrowStroke)

  const nodeElements = nodeGroup.selectAll('g.graph-node')
    .data(simNodes, (d: any) => d.id)
    .join('g')
    .attr('class', 'graph-node')
    .call(drag(sim) as any)

  nodeElements.append('circle')
    .attr('r', NODE_RADIUS)
    .attr('fill', (d: any) => {
      if (d.group === 1) return gradUrl('node-root')
      if (d.group === 2) return gradUrl('node-leaf')
      return gradUrl('node-default')
    })
    .attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)

  nodeElements.append('text')
    .attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px')
    .attr('font-weight', 'bold').text((d: any) => d.id)

  sim.on('tick', () => {
    linkElements
      .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)

    weightLabels
      .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
      .attr('y', (d: any) => (d.source.y + d.target.y) / 2)

    nodeElements.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
  })
}

function drag(sim: ReturnType<typeof forceSimulation>) {
  function dragstarted(event: any) {
    if (!event.active) sim.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }
  function dragged(event: any) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }
  function dragended(event: any) {
    if (!event.active) sim.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
  return d3Drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
}

export async function animateBFS(svg: SVGWithSimulation, startId: string, nodes: GraphNode[], links: GraphLink[], options: GraphOptions, anim?: Animation): Promise<string[]> {
  if (nodes.length >= LARGE_DATA_THRESHOLD) return []
  const adj = buildAdjacencyList(nodes, links)
  const visited = new Set<string>()
  const queue = [startId]
  const order: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)
    order.push(current)
    for (const neighbor of (adj.get(current) || [])) {
      if (!visited.has(neighbor)) queue.push(neighbor)
    }
  }

  await animateTraversalOrder(svg, order, anim)
  return order
}

export async function animateDFS(svg: SVGWithSimulation, startId: string, nodes: GraphNode[], links: GraphLink[], options: GraphOptions, anim?: Animation): Promise<string[]> {
  if (nodes.length >= LARGE_DATA_THRESHOLD) return []
  const adj = buildAdjacencyList(nodes, links)
  const visited = new Set<string>()
  const order: string[] = []

  function dfs(node: string): void {
    if (visited.has(node)) return
    visited.add(node)
    order.push(node)
    for (const neighbor of (adj.get(node) || [])) dfs(neighbor)
  }
  dfs(startId)

  await animateTraversalOrder(svg, order, anim)
  return order
}

export async function animateDijkstra(svg: SVGWithSimulation, startId: string, targetId: string, nodes: GraphNode[], links: GraphLink[], options: GraphOptions, anim?: Animation): Promise<string[]> {
  if (nodes.length >= LARGE_DATA_THRESHOLD) return []
  const adj = buildWeightedAdjacency(nodes, links)
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const pq: { id: string; d: number }[] = []

  nodes.forEach(n => { dist.set(n.id, Infinity); prev.set(n.id, null) })
  dist.set(startId, 0); pq.push({ id: startId, d: 0 })

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d)
    const { id } = pq.shift()!
    for (const [neighbor, weight] of (adj.get(id) || [])) {
      const newDist = dist.get(id)! + weight
      if (newDist < dist.get(neighbor)!) {
        dist.set(neighbor, newDist); prev.set(neighbor, id)
        pq.push({ id: neighbor, d: newDist })
      }
    }
  }

  const path: string[] = []
  let current: string | null = targetId
  while (current) { path.unshift(current); current = prev.get(current) ?? null }
  if (!path.includes(startId)) return []

  await animatePathHighlight(svg, path, anim)
  return path
}

function buildAdjacencyList(nodes: GraphNode[], links: GraphLink[]): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  nodes.forEach(n => adj.set(n.id, []))
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    adj.get(s)?.push(t)
    adj.get(t)?.push(s)
  })
  return adj
}

function buildWeightedAdjacency(nodes: GraphNode[], links: GraphLink[]): Map<string, [string, number][]> {
  const adj = new Map<string, [string, number][]>()
  nodes.forEach(n => adj.set(n.id, []))
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    adj.get(s)?.push([t, l.weight])
    adj.get(t)?.push([s, l.weight])
  })
  return adj
}

async function animateTraversalOrder(svg: SVGWithSimulation, order: string[], anim?: Animation): Promise<void> {
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)

  for (let i = 0; i < order.length; i++) {
    if (anim?.isAborted?.()) return
    const nodeId = order[i]

    const t = container.selectAll('g.graph-node').filter(function(d: any) {
      return d.id === nodeId
    }).select('circle')
      .transition().duration(duration(300)).ease(EASING.easeOutBack)
      .attr('r', NODE_RADIUS + 6)
      .attr('fill', C.nodeActive)
      .transition().duration(duration(300)).ease(EASING.easeOutCubic)
      .attr('r', NODE_RADIUS)
      .attr('fill', C.nodeVisited)
    await transitionEnd(t)
  }
}

async function animatePathHighlight(svg: SVGWithSimulation, path: string[], anim?: Animation): Promise<void> {
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  for (const nodeId of path) {
    if (anim?.isAborted?.()) return
    const t = container.selectAll('g.graph-node').filter(function(d: any) {
      return d.id === nodeId
    }).select('circle')
      .transition().duration(duration(400)).ease(EASING.easeOutBack)
      .attr('r', NODE_RADIUS + 8)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      .transition().duration(duration(300)).ease(EASING.easeOutCubic)
      .attr('r', NODE_RADIUS)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
    await transitionEnd(t)
  }
}
