import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { calculateCenterStart } from '../utils/visualizerLayout'
import type { TrieFlattened } from '../hooks/useTrieState'
import { tStatic } from '../i18n/useI18n'
import { DEFAULT_NODE_RADIUS as NODE_RADIUS } from './visualizerConstants'

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

// trie 节点半径与 tree/avlTree/heap 保持一致（DEFAULT_NODE_RADIUS）
const ROOT_RADIUS = 26
// end-of-word 节点使用胶囊形（pill）
const PILL_WIDTH = 48
const PILL_HEIGHT = 36
const PILL_RX = 18
const LEVEL_HEIGHT = 90
const MIN_NODE_SPACING = 72
const TOP_MARGIN = 40
const BOTTOM_MARGIN = 40
const FALLBACK_W = 800
const FALLBACK_H = 400

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

/**
 * 返回节点在垂直方向的视觉半径，用于计算边的起止偏移。
 * 圆形节点使用实际半径；胶囊节点使用高度的一半。
 */
function nodeVerticalOffset(pos: TriePosition): number {
  if (pos.isRoot) return ROOT_RADIUS
  if (pos.isEndOfWord) return PILL_HEIGHT / 2
  return NODE_RADIUS
}

export function renderTrie(svg: SVGSVGElement, data: TrieFlattened, options: TrieVisualizerOptions = {}) {
  const isDark = options.isDark ?? detectDarkMode()
  const C = getColors(isDark)

  const container = select(svg)
  container.selectAll('*').interrupt().remove()

  // 使用全局扁平渐变定义（与 graph 模块统一），不再创建 3D 球面渐变
  ensureGradientDefs(svg, isDark)

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

  const parentMap = new Map<string, string>()
  const childrenMap = new Map<string, string[]>()
  for (const edge of edges) {
    parentMap.set(edge.to, edge.from)
    if (!childrenMap.has(edge.from)) childrenMap.set(edge.from, [])
    childrenMap.get(edge.from)!.push(edge.to)
  }

  // ---- 边：直线（与 graph 模块风格一致）----
  for (const edge of edges) {
    const fromPos = posMap[edge.from]
    const toPos = posMap[edge.to]
    if (!fromPos || !toPos) continue

    const fromOffset = nodeVerticalOffset(fromPos)
    const toOffset = nodeVerticalOffset(toPos)
    const x1 = fromPos.x
    const y1 = fromPos.y + fromOffset
    const x2 = toPos.x
    const y2 = toPos.y - toOffset

    container.append('line')
      .attr('class', `trie-edge from-${edge.from}-to-${edge.to}`)
      .attr('x1', x1).attr('y1', y1)
      .attr('x2', x2).attr('y2', y2)
      .attr('stroke', C.edgeDefault)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.65)

    // 边标签放在直线中点
    const labelX = (x1 + x2) / 2
    const labelY = (y1 + y2) / 2

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

  // ---- 节点 ----
  for (const pos of positions) {
    const isRoot = pos.isRoot
    const isEndOfWord = pos.isEndOfWord && !isRoot
    const fill = isRoot ? gradUrl('node-root') : (isEndOfWord ? gradUrl('node-leaf') : gradUrl('node-default'))
    const stroke = isRoot ? C.nodeRootStroke : (isEndOfWord ? C.nodeLeafStroke : C.nodeDefaultStroke)
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
        select(this)
          .style('outline', '3px solid var(--color-accent-amber)')
          .style('outline-offset', '2px')
      })
      .on('blur', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('.trie-node-circle').attr('stroke', stroke).attr('stroke-width', strokeWidth)
        select(this).style('outline', 'none')
      })
      .on('keydown', function(this: SVGGElement, event: KeyboardEvent, d: TriePosition) {
        if (!event?.key) return
        const nodeMap = new Map<string, SVGGElement>()
        container.selectAll('.trie-node').each(function(this: SVGGElement, n: TriePosition) {
          nodeMap.set(n.id, this)
        })
        const parentId = parentMap.get(d.id)
        const children = childrenMap.get(d.id) || []
        let targetId: string | null = null
        if (event.key === 'ArrowUp') {
          targetId = parentId || null
        } else if (event.key === 'ArrowDown') {
          targetId = children[0] || null
        } else if (event.key === 'ArrowLeft') {
          if (parentId) {
            const siblings = childrenMap.get(parentId) || []
            const idx = siblings.indexOf(d.id)
            targetId = idx > 0 ? siblings[idx - 1] : siblings[siblings.length - 1]
          }
        } else if (event.key === 'ArrowRight') {
          if (parentId) {
            const siblings = childrenMap.get(parentId) || []
            const idx = siblings.indexOf(d.id)
            targetId = idx < siblings.length - 1 ? siblings[idx + 1] : siblings[0]
          }
        }
        if (targetId) {
          event.preventDefault()
          const target = nodeMap.get(targetId)
          target?.focus()
        }
      })

    // 主形状：end-of-word 使用胶囊形（rect + rx），其余使用圆形
    // 统一使用 class="trie-node-circle" 以便动画函数选择
    if (isEndOfWord) {
      nodeGroup.append('rect')
        .attr('class', 'trie-node-circle')
        .attr('x', -PILL_WIDTH / 2)
        .attr('y', -PILL_HEIGHT / 2)
        .attr('width', PILL_WIDTH)
        .attr('height', PILL_HEIGHT)
        .attr('rx', PILL_RX)
        .attr('ry', PILL_RX)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
    } else {
      const radius = isRoot ? ROOT_RADIUS : NODE_RADIUS
      nodeGroup.append('circle')
        .attr('class', 'trie-node-circle')
        .attr('r', radius)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)
    }

    // 节点内文字
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

    // end-of-word 对勾标记
    if (isEndOfWord) {
      nodeGroup.append('text')
        .attr('class', 'trie-node-checkmark')
        .attr('dy', PILL_HEIGHT / 2 + 16).attr('text-anchor', 'middle')
        .attr('fill', C.nodeLeaf).attr('font-size', '14px').attr('font-weight', 'bold')
        .text('✓')
    }

    // 上方前缀标签
    const labelOffset = isEndOfWord ? PILL_HEIGHT / 2 + 10 : (isRoot ? ROOT_RADIUS : NODE_RADIUS) + 10
    nodeGroup.append('text')
      .attr('dy', -labelOffset).attr('text-anchor', 'middle')
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

/**
 * 节点脉冲动画：通过 fill 变化 + stroke-width 增强实现视觉反馈。
 * 兼容圆形（circle）与胶囊形（rect）节点——不再依赖 r 属性。
 */
async function pulseNodeGlow(node: ReturnType<typeof select>, anim?: Animation, opts: PulseOptions = {}) {
  if (anim?.isAborted?.()) return
  const shape = node.select('.trie-node-circle')
  if (shape.empty()) return

  const baseFill = opts.finalFill || shape.attr('fill') || gradUrl('node-default')
  const baseStrokeWidth = parseFloat(shape.attr('stroke-width')) || 2.5
  const activeFill = opts.error ? gradUrl('node-error') : gradUrl('node-active')

  await transitionEnd(
    shape.transition().duration(duration(220)).ease(EASING.easeOutBack)
      .attr('fill', activeFill)
      .attr('stroke-width', baseStrokeWidth + 1.5)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    shape.transition().duration(duration(180)).ease(EASING.easeOutCubic)
      .attr('fill', baseFill)
      .attr('stroke-width', baseStrokeWidth)
  )
}

/**
 * 完成 end-of-word 节点动画：填充色变为 leaf 色 + 对勾淡入。
 */
async function completeLeafNode(node: ReturnType<typeof select>, anim?: Animation) {
  if (anim?.isAborted?.()) return
  const shape = node.select('.trie-node-circle')
  const checkmark = node.select('.trie-node-checkmark')
  if (shape.empty()) return

  await transitionEnd(
    shape.transition().duration(duration(350)).ease(EASING.easeOutElastic)
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
}

async function shakeNode(node: ReturnType<typeof select>, anim?: Animation) {
  if (anim?.isAborted?.()) return
  const { x, y } = getNodeBaseTransform(node)
  const shape = node.select('.trie-node-circle')
  if (shape.empty()) return
  const baseFill = shape.attr('fill') || gradUrl('node-default')

  shape.transition().duration(duration(150)).ease(EASING.easeOutCubic)
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
    shape.transition().duration(duration(250)).ease(EASING.easeInCubic)
      .attr('fill', baseFill)
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

    if (i > 0) {
      dimPathEdge(container, pathIds[i - 1], nodeId, C)
    }

    await pulseNodeGlow(node, anim)
  }
}
