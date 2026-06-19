import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { calculateCenterStart } from '../utils/visualizerLayout'
import type { TrieFlattened } from '../hooks/useTrieState'
import { tStatic } from '../i18n/useI18n'

export interface TrieVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

interface TriePosition {
  id: string
  x: number
  y: number
  prefix: string
  isEndOfWord: boolean
  isRoot: boolean
}

interface TrieEdge {
  from: string
  to: string
  char: string
}

const NODE_RADIUS = 26
const ROOT_RADIUS = 30
const LEVEL_HEIGHT = 90
const MIN_NODE_SPACING = 72
const TOP_MARGIN = 40
const BOTTOM_MARGIN = 40
const FALLBACK_W = 800
const FALLBACK_H = 400

function lightenHex(hex: string, amount: number): string {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return hex
  const r = Math.min(255, parseInt(m[1], 16) + amount)
  const g = Math.min(255, parseInt(m[2], 16) + amount)
  const b = Math.min(255, parseInt(m[3], 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

interface LayoutNode {
  id: string
  prefix: string
  isEndOfWord: boolean
  char: string
  parentId: string | null
  children: LayoutNode[]
  subtreeWidth: number
  x: number
  y: number
  depth: number
}

function buildLayoutTree(data: TrieFlattened): LayoutNode | null {
  if (!data.nodes || data.nodes.length === 0) return null

  const root: LayoutNode = {
    id: 'root',
    prefix: '',
    isEndOfWord: false,
    char: '',
    parentId: null,
    children: [],
    subtreeWidth: 0,
    x: 0,
    y: 0,
    depth: 0,
  }

  const nodeMap = new Map<string, LayoutNode>([['root', root]])

  for (const n of data.nodes) {
    if (n.prefix === '' && n.parent === '') continue
    const id = `root-${n.prefix}`
    const parentId = n.parent === '' ? 'root' : `root-${n.parent}`
    nodeMap.set(id, {
      id,
      prefix: n.prefix,
      isEndOfWord: n.isEndOfWord,
      char: n.char,
      parentId,
      children: [],
      subtreeWidth: 0,
      x: 0,
      y: 0,
      depth: n.depth,
    })
  }

  for (const ln of nodeMap.values()) {
    if (ln.parentId) {
      const parent = nodeMap.get(ln.parentId)
      if (parent) parent.children.push(ln)
    }
  }

  return root
}

function computeSubtreeWidth(node: LayoutNode): number {
  if (node.children.length === 0) {
    node.subtreeWidth = MIN_NODE_SPACING
    return node.subtreeWidth
  }
  let total = 0
  for (const child of node.children) {
    total += computeSubtreeWidth(child)
  }
  node.subtreeWidth = Math.max(total, MIN_NODE_SPACING)
  return node.subtreeWidth
}

function findMaxDepth(node: LayoutNode, depth: number): number {
  let max = depth
  for (const child of node.children) {
    max = Math.max(max, findMaxDepth(child, depth + 1))
  }
  return max
}

function assignPositions(node: LayoutNode, xStart: number, levelHeight: number): void {
  node.x = xStart + node.subtreeWidth / 2
  node.y = TOP_MARGIN + node.depth * levelHeight

  let cursor = xStart
  for (const child of node.children) {
    assignPositions(child, cursor, levelHeight)
    cursor += child.subtreeWidth
  }
}

function layout(data: TrieFlattened, width: number, height: number): { positions: TriePosition[]; edges: TrieEdge[] } {
  const positions: TriePosition[] = []
  const edges: TrieEdge[] = []

  const root = buildLayoutTree(data)
  if (!root) return { positions, edges }

  computeSubtreeWidth(root)

  const maxDepth = findMaxDepth(root, 0)
  const availableHeight = Math.max(0, height - TOP_MARGIN - BOTTOM_MARGIN)
  const levelHeight = maxDepth > 0 ? Math.min(LEVEL_HEIGHT, availableHeight / maxDepth) : LEVEL_HEIGHT

  assignPositions(root, 0, levelHeight)

  const xOffset = calculateCenterStart(root.subtreeWidth, width)

  const collect = (n: LayoutNode) => {
    positions.push({
      id: n.id,
      x: n.x + xOffset,
      y: n.y,
      prefix: n.prefix,
      isEndOfWord: n.isEndOfWord,
      isRoot: n.parentId === null,
    })
    for (const child of n.children) {
      edges.push({
        from: n.id,
        to: child.id,
        char: child.char[child.char.length - 1] || child.char || '',
      })
      collect(child)
    }
  }
  collect(root)

  return { positions, edges }
}

function createGradientDefs(svg: SVGSVGElement, C: ReturnType<typeof getColors>): void {
  const ns = 'http://www.w3.org/2000/svg'
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS(ns, 'defs')
    svg.appendChild(defs)
  }

  const gradients: Record<string, string> = {
    'grad-node-root': C.nodeRoot,
    'grad-node-default': C.nodeDefault,
    'grad-node-leaf': C.nodeLeaf,
    'grad-node-active': C.nodeActive,
    'grad-node-error': C.nodeError,
  }

  for (const [id, color] of Object.entries(gradients)) {
    let grad = defs.querySelector(`#${id}`) as SVGRadialGradientElement | null
    if (!grad) {
      grad = document.createElementNS(ns, 'radialGradient')
      grad.setAttribute('id', id)
      grad.setAttribute('cx', '35%')
      grad.setAttribute('cy', '30%')
      grad.setAttribute('r', '75%')
      defs.appendChild(grad)
    }
    while (grad.firstChild) grad.removeChild(grad.firstChild)
    const stop1 = document.createElementNS(ns, 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', lightenHex(color, 40))
    grad.appendChild(stop1)
    const stop2 = document.createElementNS(ns, 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', color)
    grad.appendChild(stop2)
  }

  if (!defs.querySelector('#trie-node-shadow')) {
    const filter = document.createElementNS(ns, 'filter')
    filter.setAttribute('id', 'trie-node-shadow')
    filter.setAttribute('x', '-50%')
    filter.setAttribute('y', '-50%')
    filter.setAttribute('width', '200%')
    filter.setAttribute('height', '200%')
    const feShadow = document.createElementNS(ns, 'feDropShadow')
    feShadow.setAttribute('dx', '0')
    feShadow.setAttribute('dy', '2')
    feShadow.setAttribute('stdDeviation', '3')
    feShadow.setAttribute('flood-opacity', '0.18')
    filter.appendChild(feShadow)
    defs.appendChild(filter)
  }

  if (!defs.querySelector('#trie-node-glow')) {
    const glowFilter = document.createElementNS(ns, 'filter')
    glowFilter.setAttribute('id', 'trie-node-glow')
    glowFilter.setAttribute('x', '-100%')
    glowFilter.setAttribute('y', '-100%')
    glowFilter.setAttribute('width', '300%')
    glowFilter.setAttribute('height', '300%')
    const feGaussianBlur = document.createElementNS(ns, 'feGaussianBlur')
    feGaussianBlur.setAttribute('stdDeviation', '5')
    feGaussianBlur.setAttribute('result', 'blur')
    glowFilter.appendChild(feGaussianBlur)
    const feMerge = document.createElementNS(ns, 'feMerge')
    const feMergeNodeBlur = document.createElementNS(ns, 'feMergeNode')
    feMergeNodeBlur.setAttribute('in', 'blur')
    const feMergeNodeSource = document.createElementNS(ns, 'feMergeNode')
    feMergeNodeSource.setAttribute('in', 'SourceGraphic')
    feMerge.appendChild(feMergeNodeBlur)
    feMerge.appendChild(feMergeNodeSource)
    glowFilter.appendChild(feMerge)
    defs.appendChild(glowFilter)
  }
}

export function renderTrie(svg: SVGSVGElement, data: TrieFlattened, options: TrieVisualizerOptions = {}) {
  const isDark = options.isDark ?? detectDarkMode()
  const C = getColors(isDark)

  const container = select(svg)
  container.selectAll('*').interrupt().remove()

  createGradientDefs(svg, C)

  const width = options.width ?? FALLBACK_W
  const height = options.height ?? FALLBACK_H

  if (!data || !data.nodes || data.nodes.length === 0) {
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', C.textLight).attr('font-size', '14px')
      .text(tStatic('emptyState.emptyTrieShort'))
    return
  }

  const { positions, edges } = layout(data, width, height)

  const posMap: Record<string, TriePosition> = {}
  for (const pos of positions) {
    posMap[pos.id] = pos
  }

  for (const edge of edges) {
    const fromPos = posMap[edge.from]
    const toPos = posMap[edge.to]
    if (!fromPos || !toPos) continue

    const fromR = fromPos.isRoot ? ROOT_RADIUS : NODE_RADIUS
    const toR = toPos.isRoot ? ROOT_RADIUS : NODE_RADIUS
    const x1 = fromPos.x
    const y1 = fromPos.y + fromR
    const x2 = toPos.x
    const y2 = toPos.y - toR
    const midY = (y1 + y2) / 2

    container.append('path')
      .attr('class', `trie-edge from-${edge.from}-to-${edge.to}`)
      .attr('d', `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`)
      .attr('fill', 'none')
      .attr('stroke', C.edgeDefault)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.65)

    const t = 0.4
    const omt = 1 - t
    const labelX = omt * omt * omt * x1 + 3 * omt * omt * t * x1 + 3 * omt * t * t * x2 + t * t * t * x2
    const labelY = omt * omt * omt * y1 + 3 * omt * omt * t * midY + 3 * omt * t * t * midY + t * t * t * y2

    container.append('circle')
      .attr('class', `trie-edge-label from-${edge.from}-to-${edge.to}`)
      .attr('cx', labelX).attr('cy', labelY)
      .attr('r', 11)
      .attr('fill', C.containerStroke).attr('opacity', 0.95)
      .attr('stroke', C.edgeDefault).attr('stroke-width', 1.5)

    container.append('text')
      .attr('class', `trie-edge-label-text from-${edge.from}-to-${edge.to}`)
      .attr('x', labelX).attr('y', labelY)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', C.textSecondary).attr('font-size', '12px').attr('font-weight', 'bold')
      .text(edge.char)
  }

  for (const pos of positions) {
    const isRoot = pos.isRoot
    const radius = isRoot ? ROOT_RADIUS : NODE_RADIUS
    const fill = isRoot ? gradUrl('node-root') : (pos.isEndOfWord ? gradUrl('node-leaf') : gradUrl('node-default'))
    const stroke = isRoot ? C.nodeRootStroke : (pos.isEndOfWord ? C.nodeLeafStroke : C.nodeDefaultStroke)
    const strokeWidth = isRoot ? 3 : 2.5

    const nodeGroup = container.append('g')
      .attr('class', `trie-node node-${pos.id}`)
      .attr('transform', `translate(${pos.x}, ${pos.y})`)
      .attr('tabindex', '0')
      .attr('role', 'group')
      .attr('aria-label', isRoot ? tStatic('trie.rootLabel') : pos.prefix)
      .on('focus', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('.trie-node-circle').attr('stroke', C.nodeActive).attr('stroke-width', 3)
      })
      .on('blur', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('.trie-node-circle').attr('stroke', stroke).attr('stroke-width', strokeWidth)
      })
      .on('keydown', function(this: SVGGElement, event: KeyboardEvent) {
        if (!event?.key) return
        const allNodes = Array.from(container.selectAll('.trie-node').nodes())
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

    if (pos.isEndOfWord && !isRoot) {
      nodeGroup.append('circle')
        .attr('class', 'trie-node-end-ring')
        .attr('r', radius + 5)
        .attr('fill', 'none')
        .attr('stroke', C.nodeLeafStroke)
        .attr('stroke-width', 2)
        .attr('opacity', 0.4)
        .attr('stroke-dasharray', '3,2')
    }

    nodeGroup.append('circle')
      .attr('class', 'trie-node-glow')
      .attr('r', radius)
      .attr('fill', C.nodeActive)
      .attr('opacity', 0)
      .attr('filter', 'url(#trie-node-glow)')
      .attr('pointer-events', 'none')

    nodeGroup.append('circle')
      .attr('class', 'trie-node-circle')
      .attr('r', radius)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', strokeWidth)
      .attr('filter', 'url(#trie-node-shadow)')

    if (isRoot) {
      nodeGroup.append('text')
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('fill', C.textWhite).attr('font-size', '13px').attr('font-weight', '800')
        .attr('letter-spacing', '0.5px')
        .text(tStatic('trie.rootLabel'))
    } else if (pos.prefix.length > 0) {
      const lastChar = pos.prefix[pos.prefix.length - 1]
      nodeGroup.append('text')
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('fill', C.textWhite).attr('font-size', '18px').attr('font-weight', '800')
        .text(lastChar)
    }

    if (pos.isEndOfWord) {
      nodeGroup.append('text')
        .attr('class', 'trie-node-checkmark')
        .attr('dy', radius + 16).attr('text-anchor', 'middle')
        .attr('fill', C.nodeLeaf).attr('font-size', '14px').attr('font-weight', 'bold')
        .text('✓')
    }

    nodeGroup.append('text')
      .attr('dy', -radius - 10).attr('text-anchor', 'middle')
      .attr('fill', C.textLight).attr('font-size', '10px')
      .attr('font-family', 'var(--font-display)')
      .text(isRoot ? tStatic('trie.rootLabel') : pos.prefix)
  }
}

function buildPath(word: string): string[] {
  const path = ['root']
  let current = ''
  for (const char of word) {
    current += char
    path.push(`root-${current}`)
  }
  return path
}

function getNodeBaseTransform(node: ReturnType<typeof select>): { x: number; y: number; transform: string } {
  const transform = node.attr('transform') || ''
  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(transform)
  const x = match ? parseFloat(match[1]) : 0
  const y = match ? parseFloat(match[2]) : 0
  return { x, y, transform }
}

function highlightPathEdge(container: ReturnType<typeof select>, fromId: string, toId: string, C: ReturnType<typeof getColors>) {
  const edge = container.select(`.trie-edge.from-${fromId}-to-${toId}`)
  if (edge.empty()) return
  edge
    .classed('trie-edge-highlight', true)
    .transition().duration(duration(250)).ease(EASING.easeOutCubic)
    .attr('stroke', C.edgeActive).attr('stroke-width', 3.5).attr('opacity', 1)
}

function dimPathEdge(container: ReturnType<typeof select>, fromId: string, toId: string, C: ReturnType<typeof getColors>) {
  const edge = container.select(`.trie-edge.from-${fromId}-to-${toId}`)
  if (edge.empty()) return
  edge
    .classed('trie-edge-highlight', false)
    .classed('trie-edge-dimmed', true)
    .transition().duration(duration(200)).ease(EASING.easeInCubic)
    .attr('stroke', C.edgeDefault).attr('stroke-width', 2).attr('opacity', 0.4)
}

interface PulseOptions {
  error?: boolean
  finalFill?: string
}

async function pulseNodeGlow(node: ReturnType<typeof select>, anim?: Animation, opts: PulseOptions = {}) {
  if (anim?.isAborted?.()) return
  const circle = node.select('.trie-node-circle')
  const glow = node.select('.trie-node-glow')
  if (circle.empty()) return

  const baseR = parseFloat(circle.attr('r')) || NODE_RADIUS
  const baseFill = opts.finalFill || circle.attr('fill') || gradUrl('node-default')
  const activeFill = opts.error ? gradUrl('node-error') : gradUrl('node-active')

  if (!glow.empty()) {
    glow.transition().duration(duration(220)).ease(EASING.easeOutCubic)
      .attr('r', baseR + 14)
      .attr('opacity', opts.error ? 0.4 : 0.5)
  }

  await transitionEnd(
    circle.transition().duration(duration(220)).ease(EASING.easeOutBack)
      .attr('r', baseR + 6)
      .attr('fill', activeFill)
  )

  if (anim?.isAborted?.()) return

  if (!glow.empty()) {
    glow.transition().duration(duration(180)).ease(EASING.easeInCubic)
      .attr('r', baseR)
      .attr('opacity', 0)
  }

  await transitionEnd(
    circle.transition().duration(duration(180)).ease(EASING.easeOutCubic)
      .attr('r', baseR)
      .attr('fill', baseFill)
  )
}

async function completeLeafNode(node: ReturnType<typeof select>, anim?: Animation) {
  if (anim?.isAborted?.()) return
  const circle = node.select('.trie-node-circle')
  const glow = node.select('.trie-node-glow')
  const checkmark = node.select('.trie-node-checkmark')
  if (circle.empty()) return

  const baseR = parseFloat(circle.attr('r')) || NODE_RADIUS

  if (!glow.empty()) {
    glow.transition().duration(duration(300)).ease(EASING.easeOutCubic)
      .attr('r', baseR + 18)
      .attr('opacity', 0.6)
  }

  await transitionEnd(
    circle.transition().duration(duration(350)).ease(EASING.easeOutElastic)
      .attr('r', baseR)
      .attr('fill', gradUrl('node-leaf'))
  )

  if (!checkmark.empty()) {
    checkmark.attr('font-size', '0px').attr('opacity', 0)
    if (anim?.isAborted?.()) return
    await transitionEnd(
      checkmark.transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('font-size', '14px')
        .attr('opacity', 1)
    )
  }

  if (!glow.empty()) {
    glow.transition().duration(duration(250)).ease(EASING.easeInCubic)
      .attr('r', baseR)
      .attr('opacity', 0)
  }
}

async function shakeNode(node: ReturnType<typeof select>, anim?: Animation) {
  if (anim?.isAborted?.()) return
  const { x, y } = getNodeBaseTransform(node)
  const circle = node.select('.trie-node-circle')
  if (circle.empty()) return
  const baseFill = circle.attr('fill') || gradUrl('node-default')

  circle.transition().duration(duration(150)).ease(EASING.easeOutCubic)
    .attr('fill', gradUrl('node-error'))

  for (let i = 0; i < 5; i++) {
    if (anim?.isAborted?.()) return
    const offset = i % 2 === 0 ? 4 : -4
    await transitionEnd(
      node.transition().duration(duration(60)).ease(EASING.easeInOutCubic)
        .attr('transform', `translate(${x + offset}, ${y})`)
    )
  }

  await transitionEnd(
    node.transition().duration(duration(100)).ease(EASING.easeOutCubic)
      .attr('transform', `translate(${x}, ${y})`)
  )

  await transitionEnd(
    circle.transition().duration(duration(250)).ease(EASING.easeInCubic)
      .attr('fill', baseFill)
  )
}

async function shrinkEndOfWordRing(node: ReturnType<typeof select>, anim?: Animation) {
  if (anim?.isAborted?.()) return
  const ring = node.select('.trie-node-end-ring')
  if (ring.empty()) return
  const baseR = parseFloat(ring.attr('r')) || NODE_RADIUS + 5
  await transitionEnd(
    ring.transition().duration(duration(250)).ease(EASING.easeInCubic)
      .attr('r', baseR - 8)
      .attr('opacity', 0)
  )
}

export async function animateInsertTrie(svg: SVGSVGElement, word?: string, anim?: Animation) {
  const container = select(svg)
  const C = getColors(detectDarkMode())

  if (!word) {
    const nodeElements = container.selectAll('.trie-node').nodes()
    if (nodeElements.length === 0) return
    for (let i = 0; i < nodeElements.length; i++) {
      if (anim?.isAborted?.()) return
      const node = select(nodeElements[i] as SVGGElement)
      if (i === nodeElements.length - 1) {
        await completeLeafNode(node, anim)
      } else {
        await pulseNodeGlow(node, anim)
      }
    }
    return
  }

  const pathIds = buildPath(word)
  if (pathIds.length === 0) return

  for (let i = 0; i < pathIds.length; i++) {
    if (anim?.isAborted?.()) return
    const nodeId = pathIds[i]
    const node = container.select(`.node-${nodeId}`)
    if (node.empty()) continue
    const isLast = i === pathIds.length - 1

    if (i > 0) {
      highlightPathEdge(container, pathIds[i - 1], nodeId, C)
    }

    if (isLast) {
      await completeLeafNode(node, anim)
    } else {
      await pulseNodeGlow(node, anim)
    }
  }
}

export async function animateSearchTrie(svg: SVGSVGElement, found: boolean, word?: string, anim?: Animation) {
  const container = select(svg)
  const C = getColors(detectDarkMode())

  if (!word) {
    const nodeElements = container.selectAll('.trie-node').nodes()
    if (nodeElements.length === 0) return
    for (let i = 0; i < nodeElements.length; i++) {
      if (anim?.isAborted?.()) return
      const node = select(nodeElements[i] as SVGGElement)
      const isLast = i === nodeElements.length - 1
      if (isLast) {
        if (found) await completeLeafNode(node, anim)
        else await shakeNode(node, anim)
      } else {
        await pulseNodeGlow(node, anim)
      }
    }
    return
  }

  const pathIds = buildPath(word)
  if (pathIds.length === 0) return

  for (let i = 0; i < pathIds.length; i++) {
    if (anim?.isAborted?.()) return
    const nodeId = pathIds[i]
    const node = container.select(`.node-${nodeId}`)
    if (node.empty()) continue
    const isLast = i === pathIds.length - 1

    if (i > 0) {
      highlightPathEdge(container, pathIds[i - 1], nodeId, C)
    }

    if (isLast) {
      if (found) await completeLeafNode(node, anim)
      else await shakeNode(node, anim)
    } else {
      await pulseNodeGlow(node, anim)
    }
  }
}

export async function animateDeleteTrie(svg: SVGSVGElement, word?: string, anim?: Animation) {
  const container = select(svg)
  const C = getColors(detectDarkMode())

  if (!word) {
    const nodeElements = container.selectAll('.trie-node').nodes()
    if (nodeElements.length === 0) return
    for (let i = nodeElements.length - 1; i >= 0; i--) {
      if (anim?.isAborted?.()) return
      const node = select(nodeElements[i] as SVGGElement)
      await pulseNodeGlow(node, anim, { error: true })
    }
    return
  }

  const pathIds = buildPath(word)
  if (pathIds.length === 0) return

  for (let i = pathIds.length - 1; i >= 0; i--) {
    if (anim?.isAborted?.()) return
    const nodeId = pathIds[i]
    const node = container.select(`.node-${nodeId}`)
    if (node.empty()) continue
    const isLeaf = i === pathIds.length - 1

    if (i > 0) {
      dimPathEdge(container, pathIds[i - 1], nodeId, C)
    }

    if (isLeaf) {
      await shrinkEndOfWordRing(node, anim)
    }

    await pulseNodeGlow(node, anim)
  }
}
