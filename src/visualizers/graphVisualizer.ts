import { select, d3Drag, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, getDefaultEasing, measureRender, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'
import { shouldSkipAnimation } from '../utils/performanceConfig'

const NODE_RADIUS = 20

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
      .force('link', forceLink(links).id((d: SimNode) => d.id).distance(120))
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
  return measureRender('renderGraph', () => {
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
      weight: l.weight ?? 0,
    }))
    const sim = getOrCreateSimulation(svg, simNodes, simLinks, width, height)
    sim.alpha(1).restart()

    const ARROW_SIZE = 8
    const ARROW_OFFSET = NODE_RADIUS + 6

    const linkGroup = container.append('g').attr('class', 'links')
    const nodeGroup = container.append('g').attr('class', 'nodes')
    container.append('g').attr('class', 'labels')

    const linkGroups = linkGroup.selectAll('g.link-group')
      .data(simLinks, (d: SimLink) => `${getNodeIdentifier(d.source)}-${getNodeIdentifier(d.target)}`)
      .join('g')
      .attr('class', 'link-group')

    const lineWrappers = linkGroups.append('g').attr('class', 'link-line-wrapper')
    lineWrappers.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 1).attr('y2', 0)
      .attr('stroke', C.edgeDefault).attr('stroke-width', 2)
      .attr('vector-effect', 'non-scaling-stroke')

    lineWrappers.append('path')
      .attr('class', 'link-arrow')
      .attr('d', `M 0 0 L ${-ARROW_SIZE} ${-ARROW_SIZE / 2} L ${-ARROW_SIZE} ${ARROW_SIZE / 2} Z`)
      .attr('fill', C.arrowStroke)

    linkGroups.append('g').attr('class', 'link-label')
      .append('text')
      .attr('fill', C.textSecondary).attr('font-size', '11px')
      .attr('text-anchor', 'middle').attr('dy', -6)
      .text((d: SimLink) => d.weight)

    const nodeElements = nodeGroup.selectAll('g.graph-node')
      .data(simNodes, (d: SimNode) => d.id)
      .join('g')
      .attr('class', 'graph-node')
      .attr('tabindex', '0')
      .attr('role', 'group')
      .attr('aria-label', (d: SimNode) => `Node ${d.id}`)
      .on('focus', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('circle').attr('stroke', C.nodeActive).attr('stroke-width', 3)
      })
      .on('blur', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('circle').attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)
      })
      .on('keydown', function(this: SVGGElement, event: KeyboardEvent) {
        if (!event?.key) return
        const allNodes = Array.from(nodeGroup.selectAll('g.graph-node').nodes())
        const idx = allNodes.indexOf(this)
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          const next = allNodes[(idx + 1) % allNodes.length] as HTMLElement
          next?.focus()
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          const prev = allNodes[(idx - 1 + allNodes.length) % allNodes.length] as HTMLElement
          prev?.focus()
        }
      })
      .call(drag(sim) as any)

    nodeElements.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', (d: SimNode) => {
        if (d.group === 1) return gradUrl('node-root')
        if (d.group === 2) return gradUrl('node-leaf')
        return gradUrl('node-default')
      })
      .attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)
      .style('cursor', 'pointer')

    nodeElements.append('text')
      .attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('fill', C.textWhite).attr('font-size', '14px')
      .attr('font-weight', 'bold').text((d: SimNode) => d.id)

    sim.on('tick', () => {
      linkGroups.each(function(this: SVGGElement, d: SimLink) {
        const source = d.source as SimNode
        const target = d.target as SimNode
        const dx = target.x - source.x
        const dy = target.y - source.y
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI
        const length = Math.sqrt(dx * dx + dy * dy)
        const safeLength = Math.max(length, 0.001)
        const arrowOffset = Math.max(0, safeLength - ARROW_OFFSET)
        const g = select(this)
        g.attr('transform', `translate(${source.x}, ${source.y})`)
        g.select('.link-line-wrapper').attr('transform', `rotate(${angle}) scale(${safeLength})`)
        g.select('.link-arrow').attr('transform', `translate(${arrowOffset}, 0) rotate(${angle})`)
        g.select('.link-label').attr('transform', `translate(${dx / 2}, ${dy / 2})`)
      })

      nodeElements.attr('transform', (d: SimNode) => `translate(${d.x}, ${d.y})`)
    })
  })
}

function drag(sim: ReturnType<typeof forceSimulation>) {
  function dragstarted(event: { active: boolean; subject: SimNode }) {
    if (!event.active) sim.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }
  function dragged(event: { x: number; y: number; subject: SimNode }) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }
  function dragended(event: { active: boolean; subject: SimNode }) {
    if (!event.active) sim.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
  return d3Drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
}

export async function animateBFS(svg: SVGWithSimulation, startId: string, nodes: GraphNode[], links: GraphLink[], _options: GraphOptions, anim?: Animation): Promise<string[]> {
  if (shouldSkipAnimation('graph', nodes.length)) return []
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

export async function animateDFS(svg: SVGWithSimulation, startId: string, nodes: GraphNode[], links: GraphLink[], _options: GraphOptions, anim?: Animation): Promise<string[]> {
  if (shouldSkipAnimation('graph', nodes.length)) return []
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

export async function animateDijkstra(svg: SVGWithSimulation, startId: string, targetId: string, nodes: GraphNode[], links: GraphLink[], _options: GraphOptions, anim?: Animation): Promise<string[]> {
  if (shouldSkipAnimation('graph', nodes.length)) return []
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

export async function animateTopoSort(svg: SVGWithSimulation, order: string[], anim?: Animation): Promise<void> {
  if (shouldSkipAnimation('graph', order.length)) return
  await animateTraversalOrder(svg, order, anim)
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
    const w = l.weight ?? 1
    adj.get(s)?.push([t, w])
    adj.get(t)?.push([s, w])
  })
  return adj
}

async function animateTraversalOrder(svg: SVGWithSimulation, order: string[], anim?: Animation): Promise<void> {
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const defaultEase = getDefaultEasing()
  const visited = new Set<string>()

  for (let i = 0; i < order.length; i++) {
    if (anim?.isAborted?.()) return
    const nodeId = order[i]
    visited.add(nodeId)

    // Highlight incoming edge from previous node in traversal
    if (i > 0) {
      const prevNodeId = order[i - 1]
      container.selectAll('g.link-group').filter(function(d: SimLink) {
        const sId = getNodeIdentifier(d.source)
        const tId = getNodeIdentifier(d.target)
        return (sId === prevNodeId && tId === nodeId) || (sId === nodeId && tId === prevNodeId)
      }).select('line').transition().duration(duration(300)).ease(defaultEase)
        .attr('stroke', C.edgeActive).attr('stroke-width', 3)
    }

    const t = container.selectAll('g.graph-node').filter(function(d: SimNode) {
      return d.id === nodeId
    }).select('circle')
      .transition().duration(duration(300)).ease(EASING.easeOutBack)
      .attr('r', NODE_RADIUS + 6)
      .attr('fill', C.nodeActive)
      .transition().duration(duration(300)).ease(defaultEase)
      .attr('r', NODE_RADIUS)
      .attr('fill', C.nodeVisited)
    await transitionEnd(t)
  }
}

async function animatePathHighlight(svg: SVGWithSimulation, path: string[], anim?: Animation): Promise<void> {
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const defaultEase = getDefaultEasing()

  for (let i = 0; i < path.length; i++) {
    const nodeId = path[i]
    if (anim?.isAborted?.()) return

    // Highlight edge from previous node to current node on the path
    if (i > 0) {
      const prevNodeId = path[i - 1]
      container.selectAll('g.link-group').filter(function(d: SimLink) {
        const sId = getNodeIdentifier(d.source)
        const tId = getNodeIdentifier(d.target)
        return (sId === prevNodeId && tId === nodeId) || (sId === nodeId && tId === prevNodeId)
      }).select('line').transition().duration(duration(400)).ease(defaultEase)
        .attr('stroke', C.nodeError).attr('stroke-width', 3)
    }

    const t = container.selectAll('g.graph-node').filter(function(d: SimNode) {
      return d.id === nodeId
    }).select('circle')
      .transition().duration(duration(400)).ease(EASING.easeOutBack)
      .attr('r', NODE_RADIUS + 8)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      .transition().duration(duration(300)).ease(defaultEase)
      .attr('r', NODE_RADIUS)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
    await transitionEnd(t)
  }
}
