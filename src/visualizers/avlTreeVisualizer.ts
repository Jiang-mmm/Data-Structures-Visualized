/**
 * AVL 树可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useAvlTreeState.getFlattened() 返回的 AvlFlattened
 * 布局算法：基于子树宽度的递归布局（参考 trieVisualizer）
 *
 * 节点显示：值 + 平衡因子（BF）
 * 颜色编码：
 * - 根节点：nodeRoot（橙色）
 * - 叶子节点：nodeLeaf（绿色）
 * - 平衡因子异常（|BF| > 1）：nodeError（红色）—— 理论上不应出现
 * - 默认节点：nodeDefault（蓝色）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import { tStatic } from '../i18n/useI18n'
import type { AvlFlattened } from '../types/hooks'

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

const NODE_RADIUS = 24
const LEVEL_HEIGHT = 80
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
        .attr('y', -4)
        .attr('fill', C.textWhite)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(String(pos.value))

      // 平衡因子文本（BF）
      nodeG.append('text')
        .attr('class', 'avl-node-bf')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('y', 10)
        .attr('fill', C.textLight)
        .attr('font-size', '9px')
        .text(`BF:${pos.balanceFactor}`)
    }
  })
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

  // 按值查找节点 id
  const valueToId = new Map<string, string>()
  for (const n of data.nodes) {
    valueToId.set(String(n.value), n.id)
  }

  const visited = new Set<string>()
  for (const value of pathValues) {
    if (anim?.isAborted?.()) return
    const id = valueToId.get(String(value))
    if (id) {
      visited.add(id)
      renderAvlTree(svg, data, {}, { visitedNodeIds: visited })
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
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

  const valueToId = new Map<string, string>()
  for (const n of data.nodes) {
    valueToId.set(String(n.value), n.id)
  }

  const path = new Set<string>()
  for (let i = 0; i < pathValues.length; i++) {
    if (anim?.isAborted?.()) return
    const value = pathValues[i]
    const id = valueToId.get(String(value))
    if (id) {
      path.add(id)
      const isLast = i === pathValues.length - 1
      const isFound = isLast && foundValue !== null
      renderAvlTree(svg, data, {}, {
        pathNodeIds: path,
        foundNodeId: isFound ? id : null,
      })
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
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

  const valueToId = new Map<string, string>()
  for (const n of data.nodes) {
    valueToId.set(String(n.value), n.id)
  }

  const visited = new Set<string>()
  for (const value of traversalValues) {
    if (anim?.isAborted?.()) return
    const id = valueToId.get(String(value))
    if (id) {
      visited.add(id)
      renderAvlTree(svg, data, {}, { visitedNodeIds: visited })
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
}
