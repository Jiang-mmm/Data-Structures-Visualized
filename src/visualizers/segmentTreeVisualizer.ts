/**
 * 线段树可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useSegmentTreeState.getFlattened() 返回的 SegmentTreeFlattened
 * 布局算法：基于子树宽度的递归布局（参考 bTreeVisualizer）
 *
 * 节点显示：矩形节点，上行显示区间 [start, end]，下行显示 sum 值
 * 颜色编码：
 * - 根节点：nodeRoot（橙色）
 * - 叶子节点：nodeLeaf（绿色）
 * - 高亮节点（查询/更新路径）：nodeActive（红色）
 * - 默认节点：nodeDefault（蓝色）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, wait, measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import { tStatic } from '../i18n/useI18n'
import type { SegmentTreeFlattened, SegmentTreeFlattenedNode } from '../algorithms/segmentTree'
import { DEFAULT_LEVEL_HEIGHT as LEVEL_HEIGHT } from './visualizerConstants'

export interface SegmentTreeVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

/** 高亮节点 id 集合（供动画使用） */
export interface SegmentTreeHighlightState {
  activeNodeIds?: Set<string>
  visitedNodeIds?: Set<string>
  pathNodeIds?: Set<string>
  foundNodeId?: string | null
}

/** 节点宽度 */
const NODE_WIDTH = 70
/** 节点高度 */
const NODE_HEIGHT = 44
/** 节点间最小水平间距 */
const MIN_NODE_SPACING = 90
const TOP_MARGIN = 40
const BOTTOM_MARGIN = 60
const FALLBACK_W = 800
const FALLBACK_H = 400

/** 布局节点（构建临时树结构用于计算位置） */
interface LayoutNode {
  id: string
  start: number
  end: number
  sum: number
  parentId: string | null
  children: LayoutNode[]
  subtreeWidth: number
  x: number
  y: number
  level: number
  isLeaf: boolean
}

/** 渲染位置 */
interface SegmentTreePosition {
  id: string
  x: number
  y: number
  start: number
  end: number
  sum: number
  isRoot: boolean
  isLeaf: boolean
}

/** 渲染边 */
interface SegmentTreeEdge {
  from: string
  to: string
}

/**
 * 从扁平化数据构建布局树
 */
function buildLayoutTree(data: SegmentTreeFlattened): LayoutNode | null {
  if (!data.nodes || data.nodes.length === 0) return null

  const nodeMap = new Map<string, LayoutNode>()
  let root: LayoutNode | null = null

  // 第一遍：创建所有节点
  for (const n of data.nodes) {
    const layoutNode: LayoutNode = {
      id: n.id,
      start: n.start,
      end: n.end,
      sum: n.sum,
      parentId: n.parent === '' ? null : n.parent,
      children: [],
      subtreeWidth: 0,
      x: 0,
      y: 0,
      level: n.level,
      isLeaf: n.isLeaf,
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

  return root
}

/** 递归计算子树宽度 */
function computeSubtreeWidth(node: LayoutNode): number {
  if (node.children.length === 0) {
    node.subtreeWidth = Math.max(NODE_WIDTH, MIN_NODE_SPACING)
    return node.subtreeWidth
  }
  let total = 0
  for (const child of node.children) {
    total += computeSubtreeWidth(child)
  }
  node.subtreeWidth = Math.max(total, NODE_WIDTH, MIN_NODE_SPACING)
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
  // 节点居中于其子树宽度
  node.x = xStart + node.subtreeWidth / 2
  node.y = TOP_MARGIN + node.level * levelHeight

  // 子节点居中排列
  const childrenTotalWidth = node.children.reduce((sum, c) => sum + c.subtreeWidth, 0)
  const startX = xStart + (node.subtreeWidth - childrenTotalWidth) / 2
  let cursor = startX

  for (const child of node.children) {
    assignPositions(child, cursor, levelHeight)
    cursor += child.subtreeWidth
  }
}

/**
 * 计算所有节点和边的位置
 */
function layout(data: SegmentTreeFlattened, width: number, height: number): { positions: SegmentTreePosition[]; edges: SegmentTreeEdge[] } {
  const positions: SegmentTreePosition[] = []
  const edges: SegmentTreeEdge[] = []

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
      start: n.start,
      end: n.end,
      sum: n.sum,
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
  pos: SegmentTreePosition,
  C: ReturnType<typeof getColors>,
  highlight?: SegmentTreeHighlightState
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
 * 渲染线段树（全清 + 全绘）
 *
 * @param svg SVG 元素
 * @param data 扁平化线段树数据
 * @param options 渲染选项
 * @param highlight 高亮状态（可选，供动画使用）
 */
export function renderSegmentTree(
  svg: SVGSVGElement,
  data: SegmentTreeFlattened,
  options: SegmentTreeVisualizerOptions = {},
  highlight?: SegmentTreeHighlightState
): void {
  measureRender('renderSegmentTree', () => {
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
        .text(tStatic('emptyState.emptySegmentTreeShort'))
      return
    }

    const { positions, edges } = layout(data, width, height)

    const posMap: Record<string, SegmentTreePosition> = {}
    for (const pos of positions) {
      posMap[pos.id] = pos
    }

    // 先绘制边（在节点下层）
    for (const edge of edges) {
      const fromPos = posMap[edge.from]
      const toPos = posMap[edge.to]
      if (!fromPos || !toPos) continue

      // 边从父节点底部中心连到子节点顶部中心
      const x1 = fromPos.x
      const y1 = fromPos.y + NODE_HEIGHT / 2
      const x2 = toPos.x
      const y2 = toPos.y - NODE_HEIGHT / 2
      const midY = (y1 + y2) / 2

      container.append('path')
        .attr('class', `segtree-edge from-${edge.from}-to-${edge.to}`)
        .attr('d', `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`)
        .attr('fill', 'none')
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)
    }

    // 再绘制节点（在边上层）
    for (const pos of positions) {
      const { fill, stroke } = getNodeColors(pos, C, highlight)
      const halfWidth = NODE_WIDTH / 2
      const halfHeight = NODE_HEIGHT / 2

      const nodeG = container.append('g')
        .attr('class', 'segtree-node')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('data-id', pos.id)
        .attr('data-range', `[${pos.start},${pos.end}]`)
        .attr('data-sum', pos.sum)
        .attr('tabindex', '0')
        .attr('role', 'group')
        .attr('aria-label', `Segment Tree node [${pos.start}, ${pos.end}] sum: ${pos.sum}`)

      // 节点背景矩形
      nodeG.append('rect')
        .attr('class', 'segtree-node-bg')
        .attr('x', -halfWidth)
        .attr('y', -halfHeight)
        .attr('width', NODE_WIDTH)
        .attr('height', NODE_HEIGHT)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', 2)
        .attr('rx', 4)

      // 区间文本（上行）
      nodeG.append('text')
        .attr('class', 'segtree-range-text')
        .attr('x', 0)
        .attr('y', -8)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textWhite)
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('font-family', 'var(--font-mono)')
        .text(`[${pos.start},${pos.end}]`)

      // sum 值文本（下行）
      nodeG.append('text')
        .attr('class', 'segtree-sum-text')
        .attr('x', 0)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textWhite)
        .attr('font-size', '14px')
        .attr('font-weight', '700')
        .attr('font-family', 'var(--font-mono)')
        .text(String(pos.sum))

      // hover 提示
      nodeG.append('title')
        .text(tStatic('segmentTree.nodeTitle')
          .replace('{range}', `[${pos.start}, ${pos.end}]`)
          .replace('{sum}', String(pos.sum))
          .replace('{type}', pos.isLeaf ? tStatic('segmentTree.leaf') : tStatic('segmentTree.internal')))
    }

    // 绘制原始数组（底部）
    if (data.originalArray && data.originalArray.length > 0) {
      const arrY = height - BOTTOM_MARGIN / 2
      const arrCount = data.originalArray.length
      const arrCellWidth = Math.min(40, width / (arrCount + 1))
      const arrTotalWidth = arrCount * arrCellWidth
      const arrStartX = calculateCenterStart(arrTotalWidth, width)

      // 数组标签
      container.append('text')
        .attr('class', 'segtree-array-label')
        .attr('x', arrStartX - 10)
        .attr('y', arrY)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textLight)
        .attr('font-size', '10px')
        .attr('font-family', 'var(--font-mono)')
        .text(tStatic('segmentTree.arrayLabel'))

      // 数组元素
      for (let i = 0; i < arrCount; i++) {
        const cellX = arrStartX + i * arrCellWidth
        container.append('rect')
          .attr('class', 'segtree-array-cell')
          .attr('x', cellX)
          .attr('y', arrY - 12)
          .attr('width', arrCellWidth - 2)
          .attr('height', 24)
          .attr('fill', 'none')
          .attr('stroke', C.edgeDefault)
          .attr('stroke-width', 1)
          .attr('rx', 2)

        container.append('text')
          .attr('class', 'segtree-array-value')
          .attr('x', cellX + (arrCellWidth - 2) / 2)
          .attr('y', arrY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', C.textLight)
          .attr('font-size', '11px')
          .attr('font-family', 'var(--font-mono)')
          .text(String(data.originalArray[i]))

        // 下标
        container.append('text')
          .attr('class', 'segtree-array-index')
          .attr('x', cellX + (arrCellWidth - 2) / 2)
          .attr('y', arrY + 20)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', C.textLight)
          .attr('font-size', '9px')
          .attr('opacity', 0.6)
          .attr('font-family', 'var(--font-mono)')
          .text(String(i))
      }
    }
  })
}

/** 通过 data-id 选中节点组 */
function getNodeGroupById(container: ReturnType<typeof select>, id: string): ReturnType<typeof select> {
  return container.selectAll('g.segtree-node').filter(function (this: SVGGElement) {
    return select(this).attr('data-id') === id
  })
}

/** 重置节点与边的颜色 */
function resetNodeAndEdgeColors(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>) {
  container.selectAll('g.segtree-node').select('rect.segtree-node-bg')
    .interrupt()
    .attr('fill', gradUrl('node-default'))
    .attr('stroke', C.nodeDefaultStroke)
    .attr('stroke-width', 2)

  container.selectAll('text.visit-order').remove()

  container.selectAll('.segtree-edge')
    .interrupt()
    .attr('stroke', C.edgeDefault)
    .attr('stroke-width', 2)
}

/** 节点缩放脉冲 */
async function pulseNode(
  nodeGroup: ReturnType<typeof select>,
  C: ReturnType<typeof getColors>,
  isFound = false,
  dataLength = 0
) {
  const rect = nodeGroup.select('rect.segtree-node-bg')
  const activeFill = isFound ? C.nodeVisited : C.nodeActive
  const activeStroke = isFound ? C.nodeVisitedStroke : C.nodeActiveStroke

  const t = rect.transition().duration(duration(350, dataLength)).ease(isFound ? EASING.easeOutElastic : EASING.easeOutBack)
    .attr('fill', activeFill)
    .attr('stroke', activeStroke)
    .attr('stroke-width', 3)
    .transition().duration(duration(300, dataLength)).ease(EASING.easeOutCubic)
    .attr('stroke-width', 2)
  await transitionEnd(t)
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
  const edge = container.select(`.segtree-edge.from-${parentId}-to-${nodeId}`)
  if (edge.empty()) return
  edge.transition().duration(duration(400, dataLength)).ease(EASING.easeOutBack)
    .attr('stroke', C.nodeVisitedStroke)
    .attr('stroke-width', 2.5)
}

/** 在节点右上角显示序号或 ✓ */
function addVisitOrderLabel(
  nodeGroup: ReturnType<typeof select>,
  order: number | string,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  nodeGroup.selectAll('text.visit-order').remove()

  const textEl = nodeGroup.append('text')
    .attr('class', 'visit-order')
    .attr('x', 28)
    .attr('y', -20)
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
 * 将区间转换为匹配键（用于查找节点）
 */
function rangeToKey(start: number, end: number): string {
  return `${start}-${end}`
}

/**
 * 动画：高亮查询/更新路径
 *
 * @param svg SVG 元素
 * @param path 访问路径（每步包含节点区间和 sum）
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 * @param isUpdate 是否为更新操作（影响最后节点显示）
 */
export async function animateSegmentTreePath(
  svg: SVGSVGElement,
  path: { start: number; end: number; sum: number }[],
  data: SegmentTreeFlattened,
  anim: Animation,
  isUpdate = false
): Promise<void> {
  if (path.length === 0) return
  const threshold = getLargeDataThreshold('tree')
  if (data.nodes.length >= threshold) return

  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  // 构建 range 到 node id 的映射
  const rangeToId = new Map<string, string>()
  const nodeMap = new Map<string, SegmentTreeFlattenedNode>()
  for (const n of data.nodes) {
    rangeToId.set(rangeToKey(n.start, n.end), n.id)
    nodeMap.set(n.id, n)
  }

  for (let i = 0; i < path.length; i++) {
    if (anim?.isAborted?.()) return
    const step = path[i]
    const id = rangeToId.get(rangeToKey(step.start, step.end))
    if (!id) continue

    const nodeGroup = getNodeGroupById(container, id)
    if (nodeGroup.empty()) continue

    const isLast = i === path.length - 1
    const isFound = isLast && !isUpdate

    await pulseNode(nodeGroup, C, isFound, data.nodes.length)
    if (anim?.isAborted?.()) return

    highlightEntryEdge(container, id, nodeMap.get(id)?.parent || null, C, data.nodes.length)

    if (isFound) {
      addVisitOrderLabel(nodeGroup, '✓', C, data.nodes.length)
    } else if (isLast && isUpdate) {
      addVisitOrderLabel(nodeGroup, '↑', C, data.nodes.length)
    } else {
      addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
    }
  }

  // 等待最后一个节点的边高亮/序号标签动画完成
  await wait(700, anim)
}
