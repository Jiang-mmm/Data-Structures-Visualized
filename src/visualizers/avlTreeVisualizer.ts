/**
 * AVL 树可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useAvlTreeState.getFlattened() 返回的 AvlFlattened
 * 布局算法：基于子树宽度的递归布局（参考 trieVisualizer）
 *
 * 节点显示：仅显示节点值；hover 时通过 SVG <title> 展示高度与平衡因子
 * 颜色编码：
 * - 根节点：nodeRoot（橙色）
 * - 叶子节点：nodeLeaf（绿色）
 * - 平衡因子异常（|BF| > 1）：nodeError（红色）—— 理论上不应出现
 * - 默认节点：nodeDefault（蓝色）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, wait, measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import { tStatic } from '../i18n/useI18n'
import type { AvlFlattened, AvlFlattenedNode } from '../types/hooks'
import { DEFAULT_NODE_RADIUS as NODE_RADIUS, DEFAULT_LEVEL_HEIGHT as LEVEL_HEIGHT } from './visualizerConstants'

export interface AvlTreeVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

/** 高亮节点 id 集合（供动画使用） */
export interface AvlHighlightState {
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

/** 布局节点（构建临时树结构用于计算位置） */
interface LayoutNode {
  id: string
  value: number
  balanceFactor: number
  height: number
  parentId: string | null
  children: LayoutNode[]
  subtreeWidth: number
  x: number
  y: number
  depth: number
  isLeaf: boolean
}

/** 渲染位置 */
interface AvlPosition {
  id: string
  x: number
  y: number
  value: number
  balanceFactor: number
  height: number
  isRoot: boolean
  isLeaf: boolean
}

/** 渲染边 */
interface AvlEdge {
  from: string
  to: string
}

/**
 * 从扁平化数据构建布局树
 */
function buildLayoutTree(data: AvlFlattened): LayoutNode | null {
  if (!data.nodes || data.nodes.length === 0) return null

  const nodeMap = new Map<string, LayoutNode>()
  let root: LayoutNode | null = null

  // 第一遍：创建所有节点
  for (const n of data.nodes) {
    const layoutNode: LayoutNode = {
      id: n.id,
      value: n.value,
      balanceFactor: n.balanceFactor,
      height: n.height,
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
function layout(data: AvlFlattened, width: number, height: number): { positions: AvlPosition[]; edges: AvlEdge[] } {
  const positions: AvlPosition[] = []
  const edges: AvlEdge[] = []

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
      balanceFactor: n.balanceFactor,
      height: n.height,
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
 * 根据节点状态选择颜色
 */
function getNodeColors(
  pos: AvlPosition,
  C: ReturnType<typeof getColors>,
  highlight?: AvlHighlightState
): { fill: string; stroke: string } {
  // 高亮状态优先级：found > active > path > visited > 默认
  if (highlight?.foundNodeId && highlight.foundNodeId === pos.id) {
    return { fill: gradUrl('node-leaf'), stroke: C.nodeLeafStroke }
  }
  if (highlight?.activeNodeIds?.has(pos.id)) {
    return { fill: gradUrl('node-active'), stroke: C.nodeActiveStroke }
  }
  if (highlight?.pathNodeIds?.has(pos.id)) {
    return { fill: gradUrl('node-active'), stroke: C.nodeActiveStroke }
  }
  if (highlight?.visitedNodeIds?.has(pos.id)) {
    return { fill: gradUrl('node-leaf'), stroke: C.nodeLeafStroke }
  }
  // 平衡因子异常（理论上不应出现，但作为安全检查）
  if (Math.abs(pos.balanceFactor) > 1) {
    return { fill: gradUrl('node-error'), stroke: C.nodeErrorStroke }
  }
  // 根节点
  if (pos.isRoot) {
    return { fill: gradUrl('node-root'), stroke: C.nodeRootStroke }
  }
  // 叶子节点
  if (pos.isLeaf) {
    return { fill: gradUrl('node-leaf'), stroke: C.nodeLeafStroke }
  }
  // 默认节点
  return { fill: gradUrl('node-default'), stroke: C.nodeDefaultStroke }
}

/**
 * 渲染 AVL 树（全清 + 全绘）
 *
 * @param svg SVG 元素
 * @param data 扁平化 AVL 树数据
 * @param options 渲染选项
 * @param highlight 高亮状态（可选，供动画使用）
 */
export function renderAvlTree(
  svg: SVGSVGElement,
  data: AvlFlattened,
  options: AvlTreeVisualizerOptions = {},
  highlight?: AvlHighlightState
): void {
  measureRender('renderAvlTree', () => {
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
        .text(tStatic('emptyState.emptyAvlShort'))
      return
    }

    const { positions, edges } = layout(data, width, height)

    const posMap: Record<string, AvlPosition> = {}
    for (const pos of positions) {
      posMap[pos.id] = pos
    }

    const childrenMap = new Map<string, string[]>()
    for (const n of data.nodes) {
      if (!childrenMap.has(n.parent)) childrenMap.set(n.parent, [])
      childrenMap.get(n.parent)!.push(n.id)
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
      const midY = (y1 + y2) / 2

      container.append('path')
        .attr('class', `avl-edge from-${edge.from}-to-${edge.to}`)
        .attr('d', `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`)
        .attr('fill', 'none')
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)
    }

    // 再绘制节点（在边上层）
    for (const pos of positions) {
      const { fill, stroke } = getNodeColors(pos, C, highlight)

      const nodeG = container.append('g')
        .attr('class', 'avl-node')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('data-id', pos.id)
        .attr('data-value', pos.value)
        .attr('tabindex', '0')
        .attr('role', 'group')
        .attr('aria-label', `Node ${pos.value}`)
        .on('focus', function(this: SVGGElement) {
          if (!this?.querySelector) return
          select(this).select('circle').attr('stroke', C.nodeActive).attr('stroke-width', 3)
          select(this)
            .style('outline', '3px solid var(--color-accent-amber)')
            .style('outline-offset', '2px')
        })
        .on('blur', function(this: SVGGElement) {
          if (!this?.querySelector) return
          const baseStroke = pos.isRoot ? C.nodeRootStroke : (pos.isLeaf ? C.nodeLeafStroke : C.nodeDefaultStroke)
          select(this).select('circle').attr('stroke', baseStroke).attr('stroke-width', 2)
          select(this).style('outline', 'none')
        })
        .on('keydown', function(this: SVGGElement, event: KeyboardEvent, d: AvlPosition) {
          if (!event?.key) return
          const nodeMap = new Map<string, SVGGElement>()
          container.selectAll('g.avl-node').each(function(this: SVGGElement, n: AvlPosition) {
            nodeMap.set(n.id, this)
          })
          const flatNode = data.nodes.find(n => n.id === d.id)
          if (!flatNode) return
          const children = childrenMap.get(d.id) || []
          const firstChild = children[0]
          const lastChild = children[children.length - 1]
          let targetId: string | null = null
          if (event.key === 'ArrowUp') {
            targetId = flatNode.parent || null
          } else if (event.key === 'ArrowDown') {
            targetId = firstChild || null
          } else if (event.key === 'ArrowLeft') {
            targetId = firstChild || null
          } else if (event.key === 'ArrowRight') {
            targetId = lastChild || null
          }
          if (targetId) {
            event.preventDefault()
            const target = nodeMap.get(targetId)
            target?.focus()
          }
        })

      // 节点圆形
      nodeG.append('circle')
        .attr('r', NODE_RADIUS)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', 2)

      // 节点值文本
      nodeG.append('text')
        .attr('class', 'avl-node-value')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('dy', '0.35em')
        .attr('fill', C.textWhite)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(String(pos.value))

      // hover 提示：值 / 高度 / 平衡因子
      nodeG.append('title')
        .text(tStatic('avlTree.nodeTitle')
          .replace('{value}', String(pos.value))
          .replace('{height}', String(pos.height))
          .replace('{balanceFactor}', String(pos.balanceFactor)))
    }
  })
}

/** 通过 data-id 选中节点组 */
function getNodeGroupById(container: ReturnType<typeof select>, id: string): ReturnType<typeof select> {
  return container.selectAll('g.avl-node').filter(function (this: SVGGElement) {
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
  container.selectAll('g.avl-node').select('circle')
    .interrupt()
    .attr('fill', gradUrl('node-default'))
    .attr('stroke', C.nodeDefaultStroke)
    .attr('stroke-width', 2)
    .attr('r', NODE_RADIUS)

  container.selectAll('text.visit-order').remove()

  container.selectAll('.avl-edge')
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
  const growRadius = isFound ? NODE_RADIUS + 10 : NODE_RADIUS + 8
  const activeFill = isFound ? C.nodeVisited : C.nodeActive
  const activeStroke = isFound ? C.nodeVisitedStroke : C.nodeActiveStroke

  const finalRadius = isFound || !isSecondary ? NODE_RADIUS + 2 : NODE_RADIUS
  const finalFill = isSecondary ? C.textSecondary : C.nodeVisited
  const finalStroke = isSecondary ? C.textSecondary : C.nodeVisitedStroke

  // 链式过渡：grow → settle，单次 await（与 graphVisualizer 一致，消除微任务间隙）
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

  const ripple = container.insert('circle', 'g.avl-node')
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
  const edge = container.select(`.avl-edge.from-${parentId}-to-${nodeId}`)
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

/** 遍历专用节点脉冲：更大的振幅、更长的停留，让每一步都清晰可见 */
async function pulseTraverseNode(
  nodeGroup: ReturnType<typeof select>,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  const circle = nodeGroup.select('circle')
  const t = circle
    .transition()
    .duration(duration(450, dataLength))
    .ease(EASING.easeOutBack)
    .attr('r', NODE_RADIUS + 10)
    .attr('fill', C.nodeActive)
    .attr('stroke', C.nodeActiveStroke)
    .transition()
    .duration(duration(350, dataLength))
    .ease(EASING.easeOutCubic)
    .attr('r', NODE_RADIUS + 4)
    .attr('fill', C.nodeVisited)
    .attr('stroke', C.nodeVisitedStroke)
  await transitionEnd(t)
}

/** 边流动点：从父节点沿边路径移动到当前节点，突出遍历方向 */
async function traceEdgeToNode(
  container: ReturnType<typeof select>,
  nodeId: string,
  parentId: string | null,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  if (!parentId) return
  const edge = container.select(`.avl-edge.from-${parentId}-to-${nodeId}`)
  if (edge.empty()) return

  const pathEl = edge.node() as SVGPathElement
  if (!pathEl || typeof pathEl.getTotalLength !== 'function') return
  const length = pathEl.getTotalLength()
  const start = pathEl.getPointAtLength(0)

  const traveler = container
    .insert('circle', 'g.avl-node')
    .attr('cx', start.x)
    .attr('cy', start.y)
    .attr('r', 4)
    .attr('fill', C.nodeActive)
    .attr('opacity', 0.9)

  await transitionEnd(
    traveler
      .transition()
      .duration(duration(350, dataLength))
      .ease(EASING.easeOutCubic)
      .attrTween('cx', () => (t: number) => pathEl.getPointAtLength(t * length).x)
      .attrTween('cy', () => (t: number) => pathEl.getPointAtLength(t * length).y)
      .remove()
  )
}

/**
 * 动画：高亮插入路径
 * @param svg SVG 元素
 * @param pathValues 路径上的节点值数组
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateInsertPath(
  svg: SVGSVGElement,
  pathValues: number[],
  data: AvlFlattened,
  anim: Animation
): Promise<void> {
  if (pathValues.length === 0) return
  const threshold = getLargeDataThreshold('tree')
  if (data.nodes.length >= threshold) return

  // DOM 已由 Visualizer 组件渲染，无需重渲染；仅重置颜色即可
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  const valueToId = new Map<string, string>()
  const nodeMap = new Map<string, AvlFlattenedNode>()
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

  // 等待最后一个节点的波纹/边高亮/序号标签动画完成，避免页面立即重绘将其截断
  await wait(700, anim)
}

/**
 * 动画：高亮查找路径
 * @param svg SVG 元素
 * @param pathValues 路径上的节点值数组
 * @param foundValue 找到的节点值（未找到为 null）
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateSearchPath(
  svg: SVGSVGElement,
  pathValues: number[],
  foundValue: number | null,
  data: AvlFlattened,
  anim: Animation
): Promise<void> {
  if (pathValues.length === 0) return
  const threshold = getLargeDataThreshold('tree')
  if (data.nodes.length >= threshold) return

  // DOM 已由 Visualizer 组件渲染，无需重渲染；仅重置颜色即可
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  const valueToId = new Map<string, string>()
  const nodeMap = new Map<string, AvlFlattenedNode>()
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

  // 等待最后一个节点的边高亮/序号标签动画完成，避免页面立即重绘将其截断
  await wait(700, anim)
}

/**
 * 动画：高亮遍历顺序
 * @param svg SVG 元素
 * @param traversalValues 遍历顺序的节点值数组
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateTraversal(
  svg: SVGSVGElement,
  traversalValues: number[],
  data: AvlFlattened,
  anim: Animation
): Promise<void> {
  if (traversalValues.length === 0) return
  const threshold = getLargeDataThreshold('tree')
  if (data.nodes.length >= threshold) return

  // DOM 已由 Visualizer 组件渲染，无需重渲染；仅重置颜色即可
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  const valueToId = new Map<string, string>()
  const nodeMap = new Map<string, AvlFlattenedNode>()
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

    const parentId = nodeMap.get(id)?.parent || null

    await traceEdgeToNode(container, id, parentId, C, data.nodes.length)
    if (anim?.isAborted?.()) return

    await pulseTraverseNode(nodeGroup, C, data.nodes.length)
    if (anim?.isAborted?.()) return

    highlightEntryEdge(container, id, parentId, C, data.nodes.length)
    addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
  }

  // 等待最后一个节点的边高亮/序号标签动画完成，避免页面立即重绘将其截断
  await wait(500, anim)
}
