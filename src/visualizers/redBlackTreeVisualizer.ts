/**
 * 红黑树（Red-Black Tree）可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useRedBlackTreeState.getFlattened() 返回的 RedBlackFlattened
 * 布局算法：基于子树宽度的递归布局（参考 avlTreeVisualizer）
 *
 * 节点显示：圆形节点，显示节点值；hover 时通过 SVG <title> 展示颜色
 * 颜色编码：
 * - 黑色节点：深色填充（colors.ink 或 #1a1a1a）+ 白色文字
 * - 红色节点：红色填充（#dc2626 或 colors.nodeActive）+ 白色文字
 * - 根节点始终为黑色（由红黑树性质保证）
 *
 * 本迭代采用「静态渲染 + 基础插入动画」策略：
 * - 渲染时直接按最终颜色绘制节点
 * - 插入动画仅高亮新节点位置（重染色动画作为后续增强，不做）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs } from '../utils/themeColors'
import { duration, EASING, transitionEnd, measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { tStatic } from '../i18n/useI18n'
import type { RedBlackFlattened, RedBlackFlattenedNode, Color } from '../algorithms/redBlackTree'
import { DEFAULT_NODE_RADIUS as NODE_RADIUS, DEFAULT_LEVEL_HEIGHT as LEVEL_HEIGHT } from './visualizerConstants'

export interface RedBlackTreeVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

/** 高亮节点 id 集合（供动画使用） */
export interface RedBlackHighlightState {
  activeNodeIds?: Set<string>
  visitedNodeIds?: Set<string>
  pathNodeIds?: Set<string>
  foundNodeId?: string | null
}

const MIN_NODE_SPACING = 70
const TOP_MARGIN = 40
const BOTTOM_MARGIN = 40
const FALLBACK_W = 800
const FALLBACK_H = 400

/** 红色节点固定填充色（深红，保证白字可读） */
const RED_NODE_FILL = '#dc2626'
const RED_NODE_STROKE = '#991b1b'
/** 黑色节点固定填充色（深黑，保证白字可读） */
const BLACK_NODE_FILL = '#1a1a1a'
const BLACK_NODE_STROKE = '#000000'

/** 布局节点（构建临时树结构用于计算位置） */
interface LayoutNode {
  id: string
  value: number
  color: Color
  parentId: string | null
  children: LayoutNode[]
  subtreeWidth: number
  x: number
  y: number
  depth: number
  isLeaf: boolean
}

/** 渲染位置 */
interface RbPosition {
  id: string
  x: number
  y: number
  value: number
  color: Color
  isRoot: boolean
  isLeaf: boolean
}

/** 渲染边 */
interface RbEdge {
  from: string
  to: string
}

/**
 * 从扁平化数据构建布局树
 */
function buildLayoutTree(data: RedBlackFlattened): LayoutNode | null {
  if (!data.nodes || data.nodes.length === 0) return null

  const nodeMap = new Map<string, LayoutNode>()
  let root: LayoutNode | null = null

  // 第一遍：创建所有节点
  for (const n of data.nodes) {
    const layoutNode: LayoutNode = {
      id: n.id,
      value: n.value,
      color: n.color,
      parentId: n.parent === '' ? null : n.parent,
      children: [],
      subtreeWidth: 0,
      x: 0,
      y: 0,
      depth: n.depth,
      isLeaf: false,
    }
    nodeMap.set(n.id, layoutNode)
    if (n.parent === '') {
      root = layoutNode
    }
  }

  // 第二遍：建立父子关系
  for (const n of data.nodes) {
    if (n.parent !== '') {
      const parent = nodeMap.get(n.parent)
      const child = nodeMap.get(n.id)
      if (parent && child) {
        parent.children.push(child)
      }
    }
  }

  // 标记叶子节点
  for (const node of nodeMap.values()) {
    node.isLeaf = node.children.length === 0
  }

  return root
}

/** 递归计算子树宽度 */
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

/** 递归计算最大深度 */
function findMaxDepth(node: LayoutNode, depth: number): number {
  let max = depth
  for (const child of node.children) {
    max = Math.max(max, findMaxDepth(child, depth + 1))
  }
  return max
}

/** 递归分配位置 */
function assignPositions(node: LayoutNode, xStart: number, levelHeight: number): void {
  node.x = xStart + node.subtreeWidth / 2
  node.y = TOP_MARGIN + node.depth * levelHeight

  let cursor = xStart
  for (const child of node.children) {
    assignPositions(child, cursor, levelHeight)
    cursor += child.subtreeWidth
  }
}

/**
 * 计算所有节点和边的位置
 */
function layout(data: RedBlackFlattened, width: number, height: number): { positions: RbPosition[]; edges: RbEdge[] } {
  const positions: RbPosition[] = []
  const edges: RbEdge[] = []

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
      value: n.value,
      color: n.color,
      isRoot: n.parentId === null,
      isLeaf: n.isLeaf,
    })
    for (const child of n.children) {
      edges.push({ from: n.id, to: child.id })
      collect(child)
    }
  }
  collect(root)

  return { positions, edges }
}

/**
 * 根据节点颜色选择填充与描边色
 * 红黑树节点颜色是核心语义，使用固定色而非主题渐变
 */
function getNodeColors(color: Color): { fill: string; stroke: string } {
  if (color === 'red') {
    return { fill: RED_NODE_FILL, stroke: RED_NODE_STROKE }
  }
  return { fill: BLACK_NODE_FILL, stroke: BLACK_NODE_STROKE }
}

/**
 * 渲染红黑树（全清 + 全绘）
 *
 * @param svg SVG 元素
 * @param data 扁平化红黑树数据
 * @param options 渲染选项
 * @param highlight 高亮状态（可选，供动画使用）
 */
export function renderRedBlackTree(
  svg: SVGSVGElement,
  data: RedBlackFlattened,
  options: RedBlackTreeVisualizerOptions = {},
  _highlight?: RedBlackHighlightState
): void {
  measureRender('renderRedBlackTree', () => {
    const isDark = options.isDark ?? detectDarkMode()
    const C = getColors(isDark)

    const container = select(svg)
    container.selectAll('*').interrupt()
    container.selectAll('*').remove()

    ensureGradientDefs(svg, isDark)

    const { width, height } = getViewBoxSize(svg, options.width ?? FALLBACK_W, options.height ?? FALLBACK_H)

    // 空树提示
    if (!data || !data.nodes || data.nodes.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textLight)
        .attr('font-size', '14px')
        .text(tStatic('emptyState.emptyRedBlackTreeShort'))
      return
    }

    const { positions, edges } = layout(data, width, height)

    const posMap: Record<string, RbPosition> = {}
    for (const pos of positions) {
      posMap[pos.id] = pos
    }

    // 先绘制边（在节点下层）
    for (const edge of edges) {
      const fromPos = posMap[edge.from]
      const toPos = posMap[edge.to]
      if (!fromPos || !toPos) continue

      const x1 = fromPos.x
      const y1 = fromPos.y + NODE_RADIUS
      const x2 = toPos.x
      const y2 = toPos.y - NODE_RADIUS

      // v17 R6：边统一为直线（参考 heap/trie visualizer），更符合二叉树学术风格
      container.append('line')
        .attr('class', `rb-edge from-${edge.from}-to-${edge.to}`)
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)
    }

    // 再绘制节点（在边上层）
    for (const pos of positions) {
      const { fill, stroke } = getNodeColors(pos.color)

      const nodeG = container.append('g')
        .attr('class', 'rb-node')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('data-id', pos.id)
        .attr('data-value', pos.value)
        .attr('data-color', pos.color)

      // 节点圆形
      nodeG.append('circle')
        .attr('r', NODE_RADIUS)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', 2)

      // 节点值文本
      nodeG.append('text')
        .attr('class', 'rb-node-value')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('dy', '0.35em')
        .attr('fill', C.textWhite)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(String(pos.value))

      // hover 提示：值 / 颜色
      nodeG.append('title')
        .text(tStatic('redBlackTree.nodeTitle')
          .replace('{value}', String(pos.value))
          .replace('{color}', pos.color === 'red' ? tStatic('redBlackTree.colorRed') : tStatic('redBlackTree.colorBlack')))
    }
  })
}

/** 通过 data-id 选中节点组 */
function getNodeGroupById(container: ReturnType<typeof select>, id: string): ReturnType<typeof select> {
  return container.selectAll('g.rb-node').filter(function (this: SVGGElement) {
    return select(this).attr('data-id') === id
  })
}

/** 解析节点组当前的 translate 坐标 */
function getNodeCenter(nodeGroup: ReturnType<typeof select>): { x: number; y: number } | null {
  const transform = nodeGroup.attr('transform')
  const match = transform && transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
  if (!match) return null
  const x = parseFloat(match[1])
  const y = parseFloat(match[2])
  if (isNaN(x) || isNaN(y)) return null
  return { x, y }
}

/** 重置节点与边的颜色，并清除序号标签 */
function resetNodeAndEdgeColors(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>) {
  container.selectAll('g.rb-node').each(function (this: SVGGElement) {
    const node = select(this)
    const color = node.attr('data-color') as Color
    const { fill, stroke } = getNodeColors(color)
    const circle = node.select('circle')
    circle.interrupt()
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', 2)
      .attr('r', NODE_RADIUS)
  })

  container.selectAll('text.visit-order').remove()

  container.selectAll('.rb-edge')
    .interrupt()
    .attr('stroke', C.edgeDefault)
    .attr('stroke-width', 2)
}

/** 节点缩放脉冲：先 easeOutBack 放大，再 settle 到最终颜色/半径（链式过渡，单次 await） */
async function pulseNode(
  nodeGroup: ReturnType<typeof select>,
  C: ReturnType<typeof getColors>,
  isFound = false,
  isSecondary = false,
  dataLength = 0
) {
  const circle = nodeGroup.select('circle')
  const color = nodeGroup.attr('data-color') as Color
  const { fill: baseFill, stroke: baseStroke } = getNodeColors(color)
  const growRadius = isFound ? NODE_RADIUS + 10 : NODE_RADIUS + 8
  const activeFill = isFound ? C.nodeVisited : C.nodeActive
  const activeStroke = isFound ? C.nodeVisitedStroke : C.nodeActiveStroke

  const finalRadius = isFound || !isSecondary ? NODE_RADIUS + 2 : NODE_RADIUS
  const finalFill = baseFill
  const finalStroke = baseStroke

  // 链式过渡：grow → settle，单次 await
  const t = circle.transition().duration(duration(350, dataLength)).ease(isFound ? EASING.easeOutElastic : EASING.easeOutBack)
    .attr('r', growRadius)
    .attr('fill', activeFill)
    .attr('stroke', activeStroke)
    .transition().duration(duration(300, dataLength)).ease(EASING.easeOutCubic)
    .attr('r', finalRadius)
    .attr('fill', finalFill)
    .attr('stroke', finalStroke)
  await transitionEnd(t)
}

/** 从节点向外扩散的波纹 */
function addRippleEffect(container: ReturnType<typeof select>, nodeId: string, C: ReturnType<typeof getColors>, dataLength = 0) {
  const nodeGroup = getNodeGroupById(container, nodeId)
  if (nodeGroup.empty()) return
  const center = getNodeCenter(nodeGroup)
  if (!center) return

  const ripple = container.insert('circle', 'g.rb-node')
    .attr('cx', center.x)
    .attr('cy', center.y)
    .attr('r', NODE_RADIUS)
    .attr('fill', 'none')
    .attr('stroke', C.nodeActive)
    .attr('stroke-width', 2.5)
    .attr('opacity', 0.7)

  ripple.transition().duration(duration(600, dataLength)).ease(EASING.easeOutCubic)
    .attr('r', NODE_RADIUS * 3)
    .attr('stroke-width', 0.5)
    .attr('opacity', 0)
    .remove()
}

/** 高亮从父节点指向当前节点的入边 */
function highlightEntryEdge(
  container: ReturnType<typeof select>,
  nodeId: string,
  parentId: string | null,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  if (!parentId) return
  const edge = container.select(`.rb-edge.from-${parentId}-to-${nodeId}`)
  if (edge.empty()) return
  edge.transition().duration(duration(400, dataLength)).ease(EASING.easeOutBack)
    .attr('stroke', C.nodeVisitedStroke)
    .attr('stroke-width', 2.5)
}

/** 在节点右上角显示遍历/搜索序号或 ✓ */
function addVisitOrderLabel(
  nodeGroup: ReturnType<typeof select>,
  order: number | string,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  nodeGroup.selectAll('text.visit-order').remove()

  const textEl = nodeGroup.append('text')
    .attr('class', 'visit-order')
    .attr('x', NODE_RADIUS + 12)
    .attr('y', -NODE_RADIUS - 4)
    .attr('text-anchor', 'middle')
    .attr('fill', C.nodeVisited)
    .attr('font-size', '11px')
    .attr('font-weight', '800')
    .attr('font-family', 'var(--font-mono)')
    .attr('opacity', 0)
    .text(order)

  transitionEnd(textEl.transition().duration(duration(250, dataLength)).ease(EASING.easeOutBack)
    .attr('opacity', 1))
}

/**
 * 动画：高亮插入路径
 * @param svg SVG 元素
 * @param pathValues 路径上的节点值数组
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateInsertRedBlackTree(
  svg: SVGSVGElement,
  pathValues: number[],
  data: RedBlackFlattened,
  anim: Animation
): Promise<void> {
  if (pathValues.length === 0) return

  // DOM 已由 Visualizer 组件渲染，无需重渲染；仅重置颜色即可
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  const valueToId = new Map<string, string>()
  const nodeMap = new Map<string, RedBlackFlattenedNode>()
  for (const n of data.nodes) {
    valueToId.set(String(n.value), n.id)
    nodeMap.set(n.id, n)
  }

  for (let i = 0; i < pathValues.length; i++) {
    if (anim?.isAborted?.()) return
    const value = pathValues[i]
    const id = valueToId.get(String(value))
    if (!id) continue

    const nodeGroup = getNodeGroupById(container, id)
    if (nodeGroup.empty()) continue

    await pulseNode(nodeGroup, C, false, false, data.nodes.length)
    if (anim?.isAborted?.()) return

    addRippleEffect(container, id, C, data.nodes.length)
    highlightEntryEdge(container, id, nodeMap.get(id)?.parent || null, C, data.nodes.length)
    addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
  }

  // 等待最后一个节点的波纹/边高亮/序号标签动画完成
  await new Promise<void>(r => setTimeout(r, 700))
}

/**
 * 动画：高亮查找路径
 * @param svg SVG 元素
 * @param pathValues 路径上的节点值数组
 * @param foundValue 找到的节点值（未找到为 null）
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateSearchRedBlackTree(
  svg: SVGSVGElement,
  pathValues: number[],
  foundValue: number | null,
  data: RedBlackFlattened,
  anim: Animation
): Promise<void> {
  if (pathValues.length === 0) return

  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  const valueToId = new Map<string, string>()
  const nodeMap = new Map<string, RedBlackFlattenedNode>()
  for (const n of data.nodes) {
    valueToId.set(String(n.value), n.id)
    nodeMap.set(n.id, n)
  }

  for (let i = 0; i < pathValues.length; i++) {
    if (anim?.isAborted?.()) return
    const value = pathValues[i]
    const id = valueToId.get(String(value))
    if (!id) continue

    const nodeGroup = getNodeGroupById(container, id)
    if (nodeGroup.empty()) continue

    const isLast = i === pathValues.length - 1
    const isFound = isLast && foundValue !== null

    await pulseNode(nodeGroup, C, isFound, !isFound, data.nodes.length)
    if (anim?.isAborted?.()) return

    highlightEntryEdge(container, id, nodeMap.get(id)?.parent || null, C, data.nodes.length)

    if (isFound) {
      addVisitOrderLabel(nodeGroup, '✓', C, data.nodes.length)
    } else {
      addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
    }
  }

  // 等待最后一个节点的边高亮/序号标签动画完成
  await new Promise<void>(r => setTimeout(r, 700))
}

/**
 * 动画：高亮遍历顺序
 * @param svg SVG 元素
 * @param traversalValues 遍历顺序的节点值数组
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateTraversalRedBlackTree(
  svg: SVGSVGElement,
  traversalValues: number[],
  data: RedBlackFlattened,
  anim: Animation
): Promise<void> {
  if (traversalValues.length === 0) return

  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  const valueToId = new Map<string, string>()
  const nodeMap = new Map<string, RedBlackFlattenedNode>()
  for (const n of data.nodes) {
    valueToId.set(String(n.value), n.id)
    nodeMap.set(n.id, n)
  }

  for (let i = 0; i < traversalValues.length; i++) {
    if (anim?.isAborted?.()) return
    const value = traversalValues[i]
    const id = valueToId.get(String(value))
    if (!id) continue

    const nodeGroup = getNodeGroupById(container, id)
    if (nodeGroup.empty()) continue

    await pulseNode(nodeGroup, C, false, false, data.nodes.length)
    if (anim?.isAborted?.()) return

    highlightEntryEdge(container, id, nodeMap.get(id)?.parent || null, C, data.nodes.length)
    addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
  }

  // 等待最后一个节点的边高亮/序号标签动画完成
  await new Promise<void>(r => setTimeout(r, 500))
}
