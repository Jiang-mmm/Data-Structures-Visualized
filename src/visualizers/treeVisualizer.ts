import { select, d3Drag } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { showToast } from '../components/toastStore'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'

const NODE_RADIUS = 22
const LEVEL_HEIGHT = 80
const BASE_DURATION = 350

const LARGE_DATA_THRESHOLD = 30

const DEFAULT_EDGE_STROKE_WIDTH = 2

export type EdgeStyle = 'straight' | 'curved' | 'orthogonal'

interface TreeOptions {
  width: number
  height: number
  isDark?: boolean
  edgeStyle?: EdgeStyle
}

let currentEdgeStyle: EdgeStyle = 'straight'

interface TreeNodeData {
  value: number
  level: number
  index: number
  dataIndex: number
  parentIndex: number
  x?: number
  y?: number
}

interface StoredPosition {
  x: number
  y: number
}

const positionStore = new Map<number, StoredPosition>()

export function clearTreePositions() {
  positionStore.clear()
}

function getStoredPosition(dataIndex: number): StoredPosition | null {
  return positionStore.get(dataIndex) || null
}

function setStoredPosition(dataIndex: number, x: number, y: number) {
  positionStore.set(dataIndex, { x, y })
}

function curvedPath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2
  return `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`
}

function orthogonalPath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2
  const r = Math.min(6, Math.abs(midY - y1) * 0.3, Math.abs(x2 - x1) * 0.3)
  if (Math.abs(x2 - x1) < 1) {
    return `M${x1},${y1} L${x2},${y2}`
  }
  return `M${x1},${y1} L${x1},${midY - r} Q${x1},${midY} ${x1 + (x2 > x1 ? r : -r)},${midY} L${x2 - (x2 > x1 ? r : -r)},${midY} Q${x2},${midY} ${x2},${midY + r} L${x2},${y2}`
}

function drawEdge(
  container: ReturnType<typeof select>,
  x1: number, y1: number, x2: number, y2: number,
  C: ReturnType<typeof getColors>,
  style: EdgeStyle = 'straight',
  insertBefore?: string
): ReturnType<typeof select> {
  if (style === 'curved' || style === 'orthogonal') {
    const pathD = style === 'curved' ? curvedPath(x1, y1, x2, y2) : orthogonalPath(x1, y1, x2, y2)
    const pathEl = insertBefore
      ? container.insert('path', insertBefore)
      : container.append('path')
    return pathEl
      .attr('class', 'tree-edge')
      .attr('d', pathD)
      .attr('fill', 'none')
      .attr('stroke', C.edgeDefault)
      .attr('stroke-width', 2)
      .attr('data-x1', x1).attr('data-y1', y1)
      .attr('data-x2', x2).attr('data-y2', y2)
  }
  const lineEl = insertBefore
    ? container.insert('line', insertBefore)
    : container.append('line')
  return lineEl
    .attr('class', 'tree-edge')
    .attr('x1', x1).attr('y1', y1)
    .attr('x2', x2).attr('y2', y2)
    .attr('stroke', C.edgeDefault)
    .attr('stroke-width', 2)
}

function getTreeLayout(data: number[]): TreeNodeData[] {
  if (!data || data.length === 0) return []
  const nodes: TreeNodeData[] = []

  for (let idx = 0; idx < data.length; idx++) {
    if (data[idx] === 0) continue
    const level = Math.floor(Math.log2(idx + 1))
    const levelStart = Math.pow(2, level) - 1
    const indexInLevel = idx - levelStart
    nodes.push({
      value: data[idx],
      level,
      index: indexInLevel,
      dataIndex: idx,
      parentIndex: idx === 0 ? -1 : Math.floor((idx - 1) / 2)
    })
  }
  return nodes
}

function calculateDefaultPosition(node: TreeNodeData, width: number, height?: number) {
  const safeWidth = width && width > 0 ? width : 800
  const safeHeight = height && height > 0 ? height : 400
  const levelWidth = Math.pow(2, node.level)
  const spacing = safeWidth / (levelWidth + 1)

  // Adaptive vertical spacing: shrink LEVEL_HEIGHT if tree overflows
  const maxLevel = node.level
  const topMargin = 50
  const bottomMargin = 30
  const neededHeight = topMargin + maxLevel * LEVEL_HEIGHT + NODE_RADIUS + bottomMargin
  let effectiveLevelHeight = LEVEL_HEIGHT
  if (neededHeight > safeHeight && maxLevel > 0) {
    effectiveLevelHeight = Math.max(30, (safeHeight - topMargin - NODE_RADIUS - bottomMargin) / maxLevel)
  }

  return {
    x: spacing * (node.index + 1),
    y: topMargin + node.level * effectiveLevelHeight
  }
}

function getNodePosition(node: TreeNodeData, width: number, height?: number) {
  const stored = getStoredPosition(node.dataIndex)
  if (stored && !isNaN(stored.x) && !isNaN(stored.y)) return { x: stored.x, y: stored.y }
  return calculateDefaultPosition(node, width, height)
}

function dragBehavior() {
  function dragstarted(this: SVGGElement) {
    select(this).raise()
  }

  function dragged(this: SVGGElement, event: { x: number; y: number }, d: TreeNodeData) {
    setStoredPosition(d.dataIndex, event.x, event.y)

    const g = select(this)
    g.attr('transform', `translate(${event.x}, ${event.y})`)

    const svg = select(this.parentNode as SVGSVGElement)
    updateLines(svg)
  }

  function dragended(_event: { x: number; y: number }, d: TreeNodeData) {
    setStoredPosition(d.dataIndex, _event.x, _event.y)
  }

  return d3Drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

function updateLines(container: ReturnType<typeof select>) {
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const nodeGroups = container.selectAll('g.tree-node')
  const lineData: { child: TreeNodeData; parentIndex: number }[] = []
  nodeGroups.each(function(d: TreeNodeData) {
    if (d.parentIndex >= 0) {
      lineData.push({ child: d, parentIndex: d.parentIndex })
    }
  })

  container.selectAll('.tree-edge').remove()
  lineData.forEach(({ child, parentIndex }) => {
    const parentGroup = nodeGroups.filter(function(p: TreeNodeData) {
      return p && p.dataIndex === parentIndex
    })
    if (parentGroup.empty()) return

    const parentTransform = parentGroup.attr('transform')
    const childTransform = select(nodeGroups.filter(function(n: TreeNodeData) {
      return n.dataIndex === child.dataIndex
    }).node() as SVGGElement).attr('transform')

    const pMatch = parentTransform && parentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/)
    const cMatch = childTransform && childTransform.match(/translate\(([^,]+),\s*([^)]+)\)/)
    if (!pMatch || !cMatch) return

    const px = parseFloat(pMatch[1])
    const py = parseFloat(pMatch[2])
    const cx = parseFloat(cMatch[1])
    const cy = parseFloat(cMatch[2])
    if (isNaN(px) || isNaN(py) || isNaN(cx) || isNaN(cy)) return

    const x1 = px, y1 = py + NODE_RADIUS
    const x2 = cx, y2 = cy - NODE_RADIUS
    drawEdge(container, x1, y1, x2, y2, C, currentEdgeStyle, 'g.tree-node')
  })
}

function resetNodeAndEdgeColors(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>, data?: number[]) {
  container.selectAll('g.tree-node').select('circle')
    .interrupt()
    .attr('fill', (d: TreeNodeData) => {
      if (d.dataIndex === 0) return C.nodeRoot
      if (data) {
        const isLeaf = 2 * d.dataIndex + 1 >= data.length || (data[2 * d.dataIndex + 1] === 0 && (2 * d.dataIndex + 2 >= data.length || data[2 * d.dataIndex + 2] === 0))
        return isLeaf ? C.nodeLeaf : C.nodeDefault
      }
      return C.nodeDefault
    })
    .attr('stroke', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRootStroke : C.nodeDefaultStroke)
    .attr('stroke-width', 2)
    .attr('r', NODE_RADIUS)

  container.selectAll('text.visit-order').remove()

  container.selectAll('.tree-edge')
    .interrupt()
    .attr('stroke', C.edgeDefault)
    .attr('stroke-width', DEFAULT_EDGE_STROKE_WIDTH)
}

export function renderTree(svg: SVGSVGElement, data: number[], options: TreeOptions = {} as TreeOptions) {
  const { width, height, isDark = detectDarkMode(), edgeStyle = 'straight' } = options
  currentEdgeStyle = edgeStyle
  const C = getColors(isDark)
  const container = select(svg)

  container.selectAll('*').interrupt()
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!data || data.length === 0) {
    container.append('text').attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyTreeShort'))
    return
  }

  // Clean up stale position entries for removed nodes
  for (const key of positionStore.keys()) {
    if (key >= data.length) positionStore.delete(key)
  }

  const nodes = getTreeLayout(data)

  nodes.forEach((node) => {
    const pos = getNodePosition(node, width, height)
    node.x = pos.x
    node.y = pos.y
  })

  nodes.forEach((node) => {
    if (node.parentIndex >= 0) {
      const p = nodes.find(n => n.dataIndex === node.parentIndex)
      if (!p) return
      if (isNaN(p.x!) || isNaN(p.y!) || isNaN(node.x!) || isNaN(node.y!)) return
      const x1 = p.x!, y1 = p.y! + NODE_RADIUS
      const x2 = node.x!, y2 = node.y! - NODE_RADIUS

      const isLeftChild = node.dataIndex === 2 * p.dataIndex + 1
      const isBSTViolation = isLeftChild ? node.value >= p.value : node.value <= p.value

      if (isBSTViolation) {
        const violationEdge = (edgeStyle === 'curved' || edgeStyle === 'orthogonal')
          ? container.append('path')
              .attr('class', 'tree-edge')
              .attr('d', edgeStyle === 'curved' ? curvedPath(x1, y1, x2, y2) : orthogonalPath(x1, y1, x2, y2))
              .attr('fill', 'none')
          : container.append('line')
              .attr('class', 'tree-edge')
              .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        violationEdge
          .attr('stroke', C.nodeError)
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '5,3')
          .style('animation', 'heap-violation-pulse 1.2s ease-in-out infinite')
      } else {
        drawEdge(container, x1, y1, x2, y2, C, edgeStyle)
      }
    }
  })

  const nodeGroups = container.selectAll('g.tree-node')
    .data(nodes)
    .join('g')
    .attr('class', 'tree-node')
    .attr('transform', (d: TreeNodeData) => `translate(${d.x}, ${d.y})`)
    .attr('tabindex', '0')
    .attr('role', 'group')
    .attr('aria-label', (d: TreeNodeData) => `Node ${d.value}`)
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
      const allNodes = Array.from(container.selectAll('g.tree-node').nodes())
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
    .call(dragBehavior())

  nodeGroups.append('circle').attr('r', NODE_RADIUS)
    .attr('fill', (d: TreeNodeData) => {
      if (d.dataIndex === 0) return gradUrl('node-root')
      const isLeaf = 2 * d.dataIndex + 1 >= data.length || (data[2 * d.dataIndex + 1] === 0 && (2 * d.dataIndex + 2 >= data.length || data[2 * d.dataIndex + 2] === 0))
      return isLeaf ? gradUrl('node-leaf') : gradUrl('node-default')
    })
    .attr('stroke', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRootStroke : C.nodeDefaultStroke)
    .attr('stroke-width', 2)
    .style('cursor', 'grab')

  nodeGroups.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text((d: TreeNodeData) => d.value)

  nodeGroups.append('text')
    .attr('dy', NODE_RADIUS + 14).attr('text-anchor', 'middle')
    .attr('fill', C.textLight).attr('font-size', '9px')
    .text((d: TreeNodeData) => `[${d.dataIndex}]`)

  // Hover micro-animation: scale up + shadow glow
  nodeGroups
    .on('mouseover', function(this: SVGGElement) {
      const g = select(this)
      g.raise()
      g.select('circle')
        .transition().duration(150).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 3)
        .attr('stroke-width', 3)
        .attr('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))')
    })
    .on('mouseout', function(this: SVGGElement, _event: any, _d: TreeNodeData) {
      const g = select(this)
      g.select('circle')
        .transition().duration(200).ease(EASING.easeOutCubic)
        .attr('r', NODE_RADIUS)
        .attr('stroke-width', 2)
        .attr('filter', null)
    })
}

export async function animateInsertNode(svg: SVGSVGElement, value: number, data: number[], options: TreeOptions = {} as TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { width, height, edgeStyle = 'straight' } = options
  const newData = [...data]
  let insertIndex
  if (newData.length === 0) {
    newData.push(value)
    insertIndex = 0
  } else {
    let idx = 0
    while (true) {
      if (value < newData[idx]) {
        const left = 2 * idx + 1
        if (left >= newData.length || newData[left] === 0) {
          while (newData.length <= left) newData.push(0)
          newData[left] = value
          insertIndex = left
          break
        }
        idx = left
      } else {
        const right = 2 * idx + 2
        if (right >= newData.length || newData[right] === 0) {
          while (newData.length <= right) newData.push(0)
          newData[right] = value
          insertIndex = right
          break
        }
        idx = right
      }
    }
  }
  const nodes = getTreeLayout(newData)
  const newNode = nodes.find(n => n.dataIndex === insertIndex)
  if (!newNode) return

  const pos = getNodePosition(newNode, width, height)
  const x = pos.x
  const y = pos.y

  if (newNode.parentIndex >= 0) {
    const p = nodes.find(n => n.dataIndex === newNode.parentIndex)
    if (!p) return
    if (isNaN(p.x!) || isNaN(p.y!) || isNaN(x!) || isNaN(y!)) return
    const x1 = p.x!, y1 = p.y! + NODE_RADIUS
    const x2 = x, y2 = y - NODE_RADIUS

    if (edgeStyle === 'curved' || edgeStyle === 'orthogonal') {
      const midY = (y1 + y2) / 2
      const startPath = edgeStyle === 'curved'
        ? `M${x1},${y1} C${x1},${midY} ${x1},${midY} ${x1},${y1}`
        : `M${x1},${y1} L${x1},${y1}`
      const endPath = edgeStyle === 'curved'
        ? `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`
        : orthogonalPath(x1, y1, x2, y2)
      const pathEl = container.append('path')
        .attr('class', 'tree-edge')
        .attr('d', startPath)
        .attr('fill', 'none')
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)

      await transitionEnd(
        pathEl.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutCubic)
          .attr('d', endPath)
      )
    } else {
      const lineEl = container.append('line')
        .attr('class', 'tree-edge')
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x1).attr('y2', y1)
        .attr('stroke', C.edgeDefault).attr('stroke-width', 2)

      await transitionEnd(
        lineEl.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutCubic)
          .attr('x2', x2).attr('y2', y2)
      )
    }
  }

  if (anim?.isAborted?.()) return

  const newGroup = container.append('g').attr('class', 'tree-node')
    .attr('transform', `translate(${x}, ${y - 50}) scale(0.3)`).attr('opacity', 0)
    .call(dragBehavior())

  newGroup.append('circle').attr('r', NODE_RADIUS)
    .attr('fill', C.nodeVisited).attr('stroke', C.nodeVisitedStroke).attr('stroke-width', 2)
    .style('cursor', 'grab')
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text(value)

  // Phase 1: Enter with overshoot bounce (scale 0.3 → 1.15)
  await transitionEnd(
    newGroup.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${x}, ${y}) scale(1.15)`)
      .attr('opacity', 1)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Settle to normal size with color transition
  await transitionEnd(
    newGroup.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('transform', `translate(${x}, ${y}) scale(1)`)
  )
  await transitionEnd(
    newGroup.select('circle').transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', C.nodeDefault).attr('stroke', C.nodeDefaultStroke)
  )
}

export async function animateTraversal(svg: SVGSVGElement, order: number[], data: number[], _options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)

  resetNodeAndEdgeColors(container, C, data)

  for (let stepIdx = 0; stepIdx < order.length; stepIdx++) {
    if (anim?.isAborted?.()) return
    const dataIndex = order[stepIdx]

    const nodeGroup = container.selectAll('g.tree-node').filter(function(d: TreeNodeData) {
      return d.dataIndex === dataIndex
    })
    if (nodeGroup.empty()) continue

    // Phase 1: Overshoot grow with easeOutBack
    await transitionEnd(
      nodeGroup.select('circle')
        .transition().duration(duration(350)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 8)
        .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
    )
    // Phase 2: Settle back with easeOutCubic
    await transitionEnd(
      nodeGroup.select('circle')
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('r', NODE_RADIUS + 2)
        .attr('fill', C.nodeVisited).attr('stroke', C.nodeVisitedStroke)
    )

    if (anim?.isAborted?.()) return

    addRippleEffect(container, dataIndex, C)
    highlightEntryEdge(container, dataIndex, C)

    addVisitOrderLabel(nodeGroup, stepIdx + 1, C)
  }
}

function highlightEntryEdge(container: any, childDataIndex: number, C: ReturnType<typeof getColors>) {
  const nodeGroups = container.selectAll('g.tree-node')
  const childGroup = nodeGroups.filter(function(d: TreeNodeData) {
    return d.dataIndex === childDataIndex
  })
  if (childGroup.empty() || childGroup.size() === 0) return

  const childData = childGroup.datum() as TreeNodeData
  if (!childData || childData.parentIndex < 0) return

  const parentGroup = nodeGroups.filter(function(d: TreeNodeData) {
    return d.dataIndex === childData.parentIndex
  })
  if (parentGroup.empty()) return

  container.selectAll('.tree-edge').filter(function() {
// @ts-ignore
    const el = select(this)
    const childTransform = childGroup.attr('transform')
    const parentTransform = parentGroup.attr('transform')
    if (!childTransform || !parentTransform) return false
    const cx = childData.x || 0
    const cy = childData.y || 0
    const px = parseFloat(parentTransform.match(/translate\(([^,]+)/)?.[1] || '0')
    const py = parseFloat(parentTransform.match(/, ([^)]+)/)?.[1] || '0')
    const ex1 = parseFloat(el.attr('x1') || el.attr('data-x1') || '-999')
    const ey1 = parseFloat(el.attr('y1') || el.attr('data-y1') || '-999')
    const ex2 = parseFloat(el.attr('x2') || el.attr('data-x2') || '-999')
    const ey2 = parseFloat(el.attr('y2') || el.attr('data-y2') || '-999')
    return Math.abs(ex1 - px) < 2 && Math.abs(ey1 - (py + NODE_RADIUS)) < 2 &&
           Math.abs(ex2 - cx) < 2 && Math.abs(ey2 - (cy - NODE_RADIUS)) < 2
  }).transition().duration(duration(400)).ease(EASING.easeOutBack)
    .attr('stroke', C.nodeVisitedStroke).attr('stroke-width', 2.5)
}

function addRippleEffect(container: ReturnType<typeof select>, dataIndex: number, C: ReturnType<typeof getColors>) {
  const nodeGroup = container.selectAll('g.tree-node').filter(function(d: TreeNodeData) {
    return d.dataIndex === dataIndex
  })
  if (nodeGroup.empty()) return

  const nodeData = nodeGroup.datum() as TreeNodeData
  if (!nodeData || nodeData.x === undefined || nodeData.y === undefined) return

  const ripple = container.insert('circle', 'g.tree-node')
    .attr('cx', nodeData.x)
    .attr('cy', nodeData.y)
    .attr('r', NODE_RADIUS)
    .attr('fill', 'none')
    .attr('stroke', C.nodeActive)
    .attr('stroke-width', 2.5)
    .attr('opacity', 0.7)

  ripple.transition().duration(duration(600)).ease(EASING.easeOutCubic)
    .attr('r', NODE_RADIUS * 3)
    .attr('stroke-width', 0.5)
    .attr('opacity', 0)
    .remove()
}

function addVisitOrderLabel(nodeGroup: any, order: number | string, C: ReturnType<typeof getColors>) {
  nodeGroup.selectAll('text.visit-order').remove()

  const textEl = nodeGroup.append('text')
    .attr('class', 'visit-order')
    .attr('x', NODE_RADIUS + 12)
    .attr('y', -NODE_RADIUS - 4)
    .attr('text-anchor', 'middle')
    .attr('fill', C.nodeVisited)
    .attr('font-size', '11px')
    .attr('font-weight', '800')
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('opacity', 0)
    .text(order)

  transitionEnd(textEl.transition().duration(duration(250)).ease(EASING.easeOutBack)
    .attr('opacity', 1))
}

export async function animateLevelOrder(svg: SVGSVGElement, order: number[], data: number[], _options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C, data)

  for (let stepIdx = 0; stepIdx < order.length; stepIdx++) {
    if (anim?.isAborted?.()) return
    const dataIndex = order[stepIdx]

    const nodeGroup = container.selectAll('g.tree-node').filter(function(d: TreeNodeData) {
      return d.dataIndex === dataIndex
    })
    if (nodeGroup.empty()) continue

    // Phase 1: Overshoot grow with easeOutBack
    await transitionEnd(
      nodeGroup.select('circle')
        .transition().duration(duration(300)).ease(EASING.easeOutBack)
        .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
        .attr('r', NODE_RADIUS + 8)
    )
    // Phase 2: Settle back with easeOutCubic
    await transitionEnd(
      nodeGroup.select('circle')
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('fill', C.nodeVisited).attr('stroke', C.nodeVisitedStroke)
        .attr('r', NODE_RADIUS)
    )

    if (anim?.isAborted?.()) return

    addRippleEffect(container, dataIndex, C)
    highlightEntryEdge(container, dataIndex, C)
    addVisitOrderLabel(nodeGroup, stepIdx + 1, C)
  }
}

export async function animateSearch(svg: SVGSVGElement, path: number[], found: number, data: number[], _options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C, data)

  for (let stepIdx = 0; stepIdx < path.length; stepIdx++) {
    if (anim?.isAborted?.()) return
    const dataIndex = path[stepIdx]

    const nodeGroup = container.selectAll('g.tree-node').filter(function(d: TreeNodeData) {
      return d.dataIndex === dataIndex
    })
    if (nodeGroup.empty()) continue

    const isFound = stepIdx === path.length - 1 && found !== -1
    const growRadius = isFound ? NODE_RADIUS + 10 : NODE_RADIUS + 8

    // Phase 1: Overshoot grow (bigger pulse for found node)
    await transitionEnd(
      nodeGroup.select('circle')
        .transition().duration(duration(350)).ease(isFound ? EASING.easeOutElastic : EASING.easeOutBack)
        .attr('r', growRadius)
        .attr('fill', isFound ? C.nodeVisited : C.nodeActive)
        .attr('stroke', isFound ? C.nodeVisitedStroke : C.nodeActiveStroke)
    )
    // Phase 2: Settle back
    await transitionEnd(
      nodeGroup.select('circle')
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('r', isFound ? NODE_RADIUS + 2 : NODE_RADIUS)
        .attr('fill', isFound ? C.nodeVisited : C.textSecondary)
        .attr('stroke', isFound ? C.nodeVisitedStroke : C.textSecondary)
    )

    if (anim?.isAborted?.()) return

    highlightEntryEdge(container, dataIndex, C)

    if (isFound) {
      addVisitOrderLabel(nodeGroup, '✓', C)
    } else if (stepIdx < path.length - 1 || found === -1) {
      addVisitOrderLabel(nodeGroup, stepIdx + 1, C)
    }
  }

  if (found === -1 && !anim?.isAborted?.()) {
    showToast({ type: 'warning', message: tStatic('emptyState.nodeNotFound') })
  }
}

export async function animateDeleteNode(svg: SVGSVGElement, value: number, data: number[], _options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C, data)

  const targetIndex = data.indexOf(value)
  if (targetIndex === -1) return

  const nodeGroup = container.selectAll('g.tree-node').filter(function(d: TreeNodeData) {
    return d.dataIndex === targetIndex
  })

  if (nodeGroup.empty()) return

  // Phase 1: Highlight error with overshoot grow
  await transitionEnd(
    nodeGroup.select('circle')
      .transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      .attr('r', NODE_RADIUS + 8)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Shrink and fade out
  await transitionEnd(
    nodeGroup.transition().duration(duration(300)).ease(EASING.easeInCubic)
// @ts-ignore
      .attr('transform', function(this: any) {
        const current = select(this).attr('transform')
        const match = current?.match(/translate\(([^,]+),\s*([^)]+)\)/)
        if (!match) return current
        return `translate(${match[1]}, ${match[2]}) scale(0.3)`
      })
      .attr('opacity', 0)
  )

}
