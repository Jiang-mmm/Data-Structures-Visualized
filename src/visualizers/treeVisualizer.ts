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

interface TreeOptions {
  width: number
  height: number
  isDark?: boolean
}

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

function calculateDefaultPosition(node: TreeNodeData, width: number) {
  const safeWidth = width && width > 0 ? width : 800
  const levelWidth = Math.pow(2, node.level)
  const spacing = safeWidth / (levelWidth + 1)
  return {
    x: spacing * (node.index + 1),
    y: 50 + node.level * LEVEL_HEIGHT
  }
}

function getNodePosition(node: TreeNodeData, width: number) {
  const stored = getStoredPosition(node.dataIndex)
  if (stored && !isNaN(stored.x) && !isNaN(stored.y)) return { x: stored.x, y: stored.y }
  return calculateDefaultPosition(node, width)
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

  return d3Drag<SVGGElement, TreeNodeData>()
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

  container.selectAll('line.tree-edge').remove()
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

    const line = container.insert('line', 'g.tree-node')
      .attr('class', 'tree-edge')
      .attr('x1', px).attr('y1', py + NODE_RADIUS)
      .attr('x2', cx).attr('y2', cy - NODE_RADIUS)
      .attr('stroke', C.edgeDefault).attr('stroke-width', 2)

    const isTraversed = (line.node() as any)?.__traversed || false
    if (isTraversed) {
      line.attr('stroke', C.nodeVisitedStroke).attr('stroke-width', 2.5)
    }
  })
}

function resetNodeAndEdgeColors(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>) {
  container.selectAll('g.tree-node').select('circle')
    .interrupt()
    .attr('fill', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRoot : C.nodeDefault)
    .attr('stroke', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRootStroke : C.nodeDefaultStroke)
    .attr('stroke-width', 2)
    .attr('r', NODE_RADIUS)

  container.selectAll('text.visit-order').remove()

  container.selectAll('line.tree-edge')
    .interrupt()
    .attr('stroke', C.edgeDefault)
    .attr('stroke-width', DEFAULT_EDGE_STROKE_WIDTH)
}

export function renderTree(svg: SVGSVGElement, data: number[], options: TreeOptions = {} as TreeOptions) {
  const { width, height, isDark = detectDarkMode() } = options
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
    const pos = getNodePosition(node, width)
    node.x = pos.x
    node.y = pos.y
  })

  nodes.forEach((node) => {
    if (node.parentIndex >= 0) {
      const p = nodes.find(n => n.dataIndex === node.parentIndex)
      if (!p) return
      if (isNaN(p.x!) || isNaN(p.y!) || isNaN(node.x!) || isNaN(node.y!)) return
      container.append('line')
        .attr('class', 'tree-edge')
        .attr('x1', p.x).attr('y1', p.y + NODE_RADIUS)
        .attr('x2', node.x).attr('y2', node.y - NODE_RADIUS)
        .attr('stroke', C.edgeDefault).attr('stroke-width', 2)
        .classed('tree-edge', true)
    }
  })

  const nodeGroups = container.selectAll('g.tree-node')
    .data(nodes)
    .join('g')
    .attr('class', 'tree-node')
    .attr('transform', (d: TreeNodeData) => `translate(${d.x}, ${d.y})`)
    .call(dragBehavior())

  nodeGroups.append('circle').attr('r', NODE_RADIUS)
    .attr('fill', (d: TreeNodeData) => d.dataIndex === 0 ? gradUrl('node-root') : gradUrl('node-default'))
    .attr('stroke', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRootStroke : C.nodeDefaultStroke)
    .attr('stroke-width', 2)
    .style('cursor', 'grab')

  nodeGroups.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text((d: TreeNodeData) => d.value)
}

export async function animateInsertNode(svg: SVGSVGElement, value: number, data: number[], options: TreeOptions = {} as TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { width } = options
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

  const pos = getNodePosition(newNode, width)
  const x = pos.x
  const y = pos.y

  if (newNode.parentIndex >= 0) {
    const p = nodes.find(n => n.dataIndex === newNode.parentIndex)
    if (!p) return
    if (isNaN(p.x) || isNaN(p.y) || isNaN(x) || isNaN(y)) return
    const dx = x - p.x
    const dy = (y - NODE_RADIUS) - (p.y + NODE_RADIUS)
    const lineLength = Math.sqrt(dx * dx + dy * dy)
    const line = container.append('line')
      .attr('class', 'tree-edge')
      .attr('x1', p.x).attr('y1', p.y + NODE_RADIUS)
      .attr('x2', p.x).attr('y2', p.y + NODE_RADIUS)
      .attr('stroke', C.edgeDefault).attr('stroke-width', 2)
      .attr('stroke-dasharray', lineLength)
      .attr('stroke-dashoffset', lineLength)

    await transitionEnd(
      line.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutCubic)
        .attr('x2', x).attr('y2', y - NODE_RADIUS)
        .attr('stroke-dashoffset', 0)
    )
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

export async function animateTraversal(svg: SVGSVGElement, order: number[], data: number[], options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)

  resetNodeAndEdgeColors(container, C)

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

  container.selectAll('line.tree-edge').filter(function() {
    const line = select(this)
    const x2 = parseFloat(line.attr('x2'))
    const y2 = parseFloat(line.attr('y2'))
    if (isNaN(x2) || isNaN(y2)) return false

    const childTransform = childGroup.attr('transform')
    const parentTransform = parentGroup.attr('transform')
    if (!childTransform || !parentTransform) return
    const cxMatch = childTransform.match(/translate\(([^,]+)/)
    const cyMatch = childTransform.match(/, ([^)]+)/)
    const cx = childData.x || parseFloat(cxMatch?.[1] || '0')
    const cy = childData.y || parseFloat(cyMatch?.[1] || '0')
    return Math.abs(x2 - cx) < 2 && Math.abs(y2 - (cy - NODE_RADIUS)) < 2
  }).transition().duration(duration(400)).ease(EASING.easeOutBack)
    .attr('stroke', C.nodeVisitedStroke).attr('stroke-width', 2.5)
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

export async function animateLevelOrder(svg: SVGSVGElement, order: number[], data: number[], options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

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

    highlightEntryEdge(container, dataIndex, C)
    addVisitOrderLabel(nodeGroup, stepIdx + 1, C)
  }
}

export async function animateSearch(svg: SVGSVGElement, path: number[], found: number, data: number[], options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

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

export async function animateDeleteNode(svg: SVGSVGElement, value: number, data: number[], options: TreeOptions, anim?: Animation) {
  if (data && data.length > LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

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
      .attr('transform', function() {
        const current = select(this).attr('transform')
        const match = current?.match(/translate\(([^,]+),\s*([^)]+)\)/)
        if (!match) return current
        return `translate(${match[1]}, ${match[2]}) scale(0.3)`
      })
      .attr('opacity', 0)
  )

  if (anim?.isAborted?.()) return

  // Phase 3: Reset for next render
  await transitionEnd(
    nodeGroup.select('circle')
      .transition().duration(duration(250)).ease(EASING.easeOutCubic)
      .attr('r', NODE_RADIUS)
      .attr('opacity', 1)
      .attr('fill', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRoot : C.nodeDefault)
      .attr('stroke', (d: TreeNodeData) => d.dataIndex === 0 ? C.nodeRootStroke : C.nodeDefaultStroke)
  )
  nodeGroup.attr('opacity', 1).attr('transform', function() {
    const current = select(this).attr('transform')
    const match = current?.match(/translate\(([^,]+),\s*([^)]+)\)/)
    if (!match) return current
    return `translate(${match[1]}, ${match[2]})`
  })
}
