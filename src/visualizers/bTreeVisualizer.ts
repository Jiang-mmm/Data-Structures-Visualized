/**
 * B 树可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useBTreeState.getFlattened() 返回的 BTreeFlattened
 * 布局算法：基于子树宽度的递归布局（参考 avlTreeVisualizer）
 *
 * 节点显示：矩形节点，内部按 key 数量分隔为多个单元格
 * 颜色编码：
 * - 根节点：nodeRoot（橙色）
 * - 叶子节点：nodeLeaf（绿色）
 * - 高亮节点（插入/搜索路径）：nodeActive（红色）
 * - 默认节点：nodeDefault（蓝色）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, wait, measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import { tStatic } from '../i18n/useI18n'
import type { BTreeFlattened, BTreeFlattenedNode } from '../algorithms/bTree'
import { DEFAULT_LEVEL_HEIGHT as LEVEL_HEIGHT } from './visualizerConstants'

export interface BTreeVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

/** 高亮节点 id 集合（供动画使用） */
export interface BTreeHighlightState {
  activeNodeIds?: Set<string>
  visitedNodeIds?: Set<string>
  pathNodeIds?: Set<string>
  foundNodeId?: string | null
}

/** 每个 key 单元格的宽度 */
const KEY_CELL_WIDTH = 36
/** 单元格间隔（分隔线） */
const CELL_PADDING = 1
/** 节点高度 */
const NODE_HEIGHT = 36
/** 节点间最小水平间距 */
const MIN_NODE_SPACING = 80
const TOP_MARGIN = 40
const BOTTOM_MARGIN = 40
const FALLBACK_W = 800
const FALLBACK_H = 400

/** 布局节点（构建临时树结构用于计算位置） */
interface LayoutNode {
  id: string
  keys: number[]
  parentId: string | null
  children: LayoutNode[]
  subtreeWidth: number
  nodeWidth: number
  x: number
  y: number
  depth: number
  isLeaf: boolean
}

/** 渲染位置 */
interface BTreePosition {
  id: string
  x: number
  y: number
  keys: number[]
  nodeWidth: number
  isRoot: boolean
  isLeaf: boolean
}

/** 渲染边 */
interface BTreeEdge {
  from: string
  to: string
}

/**
 * 计算节点宽度（基于 key 数量）
 */
function getNodeWidth(keyCount: number): number {
  if (keyCount === 0) return KEY_CELL_WIDTH
  return keyCount * KEY_CELL_WIDTH + (keyCount + 1) * CELL_PADDING
}

/**
 * 从扁平化数据构建布局树
 */
function buildLayoutTree(data: BTreeFlattened): LayoutNode | null {
  if (!data.nodes || data.nodes.length === 0) return null

  const nodeMap = new Map<string, LayoutNode>()
  let root: LayoutNode | null = null

  // 第一遍：创建所有节点
  for (const n of data.nodes) {
    const layoutNode: LayoutNode = {
      id: n.id,
      keys: [...n.keys],
      parentId: n.parent === '' ? null : n.parent,
      children: [],
      subtreeWidth: 0,
      nodeWidth: getNodeWidth(n.keys.length),
      x: 0,
      y: 0,
      depth: n.depth,
      isLeaf: n.leaf,
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
    node.subtreeWidth = Math.max(node.nodeWidth, MIN_NODE_SPACING)
    return node.subtreeWidth
  }
  let total = 0
  for (const child of node.children) {
    total += computeSubtreeWidth(child)
  }
  node.subtreeWidth = Math.max(total, node.nodeWidth, MIN_NODE_SPACING)
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
  node.y = TOP_MARGIN + node.depth * levelHeight

  let cursor = xStart
  // 子节点居中排列
  const childrenTotalWidth = node.children.reduce((sum, c) => sum + c.subtreeWidth, 0)
  const startX = xStart + (node.subtreeWidth - childrenTotalWidth) / 2
  cursor = startX

  for (const child of node.children) {
    assignPositions(child, cursor, levelHeight)
    cursor += child.subtreeWidth
  }
}

/**
 * 计算所有节点和边的位置
 */
function layout(data: BTreeFlattened, width: number, height: number): { positions: BTreePosition[]; edges: BTreeEdge[] } {
  const positions: BTreePosition[] = []
  const edges: BTreeEdge[] = []

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
      keys: n.keys,
      nodeWidth: n.nodeWidth,
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
  pos: BTreePosition,
  C: ReturnType<typeof getColors>,
  highlight?: BTreeHighlightState
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
 * 渲染 B 树（全清 + 全绘）
 *
 * @param svg SVG 元素
 * @param data 扁平化 B 树数据
 * @param options 渲染选项
 * @param highlight 高亮状态（可选，供动画使用）
 */
export function renderBTree(
  svg: SVGSVGElement,
  data: BTreeFlattened,
  options: BTreeVisualizerOptions = {},
  highlight?: BTreeHighlightState
): void {
  measureRender('renderBTree', () => {
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
        .text(tStatic('emptyState.emptyBTreeShort'))
      return
    }

    const { positions, edges } = layout(data, width, height)

    const posMap: Record<string, BTreePosition> = {}
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

      // v17 R6：边统一为直线（参考 heap/trie visualizer），更符合二叉树学术风格
      container.append('line')
        .attr('class', `btree-edge from-${edge.from}-to-${edge.to}`)
        .attr('x1', x1).attr('y1', y1)
        .attr('x2', x2).attr('y2', y2)
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)
    }

    // 再绘制节点（在边上层）
    for (const pos of positions) {
      const { fill, stroke } = getNodeColors(pos, C, highlight)
      const halfWidth = pos.nodeWidth / 2
      const halfHeight = NODE_HEIGHT / 2

      const nodeG = container.append('g')
        .attr('class', 'btree-node')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('data-id', pos.id)
        .attr('data-keys', pos.keys.join(','))
        .attr('tabindex', '0')
        .attr('role', 'group')
        .attr('aria-label', `B-Tree node keys: ${pos.keys.join(', ')}`)

      // 节点背景矩形
      nodeG.append('rect')
        .attr('class', 'btree-node-bg')
        .attr('x', -halfWidth)
        .attr('y', -halfHeight)
        .attr('width', pos.nodeWidth)
        .attr('height', NODE_HEIGHT)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', 2)
        .attr('rx', 4)

      // 为每个 key 绘制单元格和文本
      for (let i = 0; i < pos.keys.length; i++) {
        const cellX = -halfWidth + CELL_PADDING + i * KEY_CELL_WIDTH

        // 单元格分隔线（除最后一个 key 后的分隔线外）
        if (i > 0) {
          nodeG.append('line')
            .attr('class', 'btree-cell-divider')
            .attr('x1', cellX - CELL_PADDING)
            .attr('y1', -halfHeight + 4)
            .attr('x2', cellX - CELL_PADDING)
            .attr('y2', halfHeight - 4)
            .attr('stroke', C.textWhite)
            .attr('stroke-width', 1)
            .attr('opacity', 0.4)
        }

        // key 文本
        nodeG.append('text')
          .attr('class', 'btree-key-text')
          .attr('x', cellX + KEY_CELL_WIDTH / 2)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('dy', '0.35em')
          .attr('fill', C.textWhite)
          .attr('font-size', '13px')
          .attr('font-weight', '600')
          .attr('font-family', 'var(--font-mono)')
          .text(String(pos.keys[i]))
      }

      // hover 提示
      nodeG.append('title')
        .text(tStatic('bTree.nodeTitle')
          .replace('{keys}', pos.keys.join(', '))
          .replace('{count}', String(pos.keys.length))
          .replace('{type}', pos.isLeaf ? tStatic('bTree.leaf') : tStatic('bTree.internal')))
    }
  })
}

/** 通过 data-id 选中节点组 */
function getNodeGroupById(container: ReturnType<typeof select>, id: string): ReturnType<typeof select> {
  return container.selectAll('g.btree-node').filter(function (this: SVGGElement) {
    return select(this).attr('data-id') === id
  })
}

/** 重置节点与边的颜色 */
function resetNodeAndEdgeColors(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>) {
  container.selectAll('g.btree-node').select('rect.btree-node-bg')
    .interrupt()
    .attr('fill', gradUrl('node-default'))
    .attr('stroke', C.nodeDefaultStroke)
    .attr('stroke-width', 2)

  container.selectAll('text.visit-order').remove()

  container.selectAll('.btree-edge')
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
  const rect = nodeGroup.select('rect.btree-node-bg')
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
  const edge = container.select(`.btree-edge.from-${parentId}-to-${nodeId}`)
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
    .attr('x', 20)
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
 * 将 keys 数组转换为匹配键（用于查找节点）
 */
function keysToKey(keys: number[]): string {
  return keys.join('-')
}

/**
 * 动画：高亮插入/搜索路径
 *
 * @param svg SVG 元素
 * @param pathKeys 路径上每层节点的 keys 数组
 * @param foundKeys 找到的节点的 keys（未找到为 null）
 * @param data 当前扁平化数据
 * @param anim 动画上下文
 */
export async function animateBTreePath(
  svg: SVGSVGElement,
  pathKeys: number[][],
  foundKeys: number[] | null,
  data: BTreeFlattened,
  anim: Animation
): Promise<void> {
  if (pathKeys.length === 0) return
  const threshold = getLargeDataThreshold('tree')
  if (data.nodes.length >= threshold) return

  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  resetNodeAndEdgeColors(container, C)

  // 构建 keys 到 node id 的映射
  const keysToId = new Map<string, string>()
  const nodeMap = new Map<string, BTreeFlattenedNode>()
  for (const n of data.nodes) {
    keysToId.set(keysToKey(n.keys), n.id)
    nodeMap.set(n.id, n)
  }

  for (let i = 0; i < pathKeys.length; i++) {
    if (anim?.isAborted?.()) return
    const keys = pathKeys[i]
    const id = keysToId.get(keysToKey(keys))
    if (!id) continue

    const nodeGroup = getNodeGroupById(container, id)
    if (nodeGroup.empty()) continue

    const isLast = i === pathKeys.length - 1
    const isFound = isLast && foundKeys !== null

    await pulseNode(nodeGroup, C, isFound, data.nodes.length)
    if (anim?.isAborted?.()) return

    highlightEntryEdge(container, id, nodeMap.get(id)?.parent || null, C, data.nodes.length)

    if (isFound) {
      addVisitOrderLabel(nodeGroup, '✓', C, data.nodes.length)
    } else {
      addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
    }
  }

  // 等待最后一个节点的边高亮/序号标签动画完成
  await wait(700, anim)
}
