/**
 * 并查集（Union-Find）可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useUnionFindState.data 返回的 UnionFindData
 * 布局算法：森林布局，每个连通分量是一棵树，根节点在顶部
 *
 * 节点显示：圆形（半径参照 visualizerConstants.ts 的 DEFAULT_NODE_RADIUS）
 * 边显示：从子节点到父节点的连线
 * 颜色编码：
 * - 根节点：nodeRoot（橙色）
 * - 普通节点：nodeDefault（蓝色）
 * - 高亮节点：nodeActive（红色，动画用）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { DEFAULT_NODE_RADIUS } from './visualizerConstants'
import { tStatic } from '../i18n/useI18n'
import type { UnionFindData } from '../hooks/useUnionFindState'

export interface UnionFindVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

/** 节点间距（水平） */
const NODE_SPACING = 60
/** 层级间距（垂直） */
const LEVEL_HEIGHT = 70
/** 连通分量间距 */
const COMPONENT_SPACING = 80
/** 顶部边距 */
const TOP_MARGIN = 40
const FALLBACK_W = 800
const FALLBACK_H = 400

/** 渲染位置 */
interface UFPosition {
  id: string
  value: number
  x: number
  y: number
  isRoot: boolean
  depth: number
}

/** 渲染边 */
interface UFRenderEdge {
  source: UFPosition
  target: UFPosition
}

/** 组件布局结果 */
interface ComponentLayout {
  positions: UFPosition[]
  edges: UFRenderEdge[]
  width: number
}

/**
 * 找出节点的根（不带压缩）
 */
function findRootId(data: UnionFindData, id: string): string {
  let current = id
  const visited = new Set<string>()
  while (data.parent[current] !== current) {
    if (visited.has(current)) break
    visited.add(current)
    current = data.parent[current]
  }
  return current
}

/**
 * 计算并查集森林布局
 * - 按连通分量分组
 * - 每组内按树层级布局（BFS 分层）
 * - 组间水平排列
 */
function layout(data: UnionFindData, width: number, _height: number): {
  positions: UFPosition[]
  edges: UFRenderEdge[]
} {
  const positions: UFPosition[] = []
  const edges: UFRenderEdge[] = []

  if (!data || !data.nodes || data.nodes.length === 0) {
    return { positions, edges }
  }

  // 按根节点分组
  const componentMap = new Map<string, string[]>()
  for (const node of data.nodes) {
    const root = findRootId(data, node.id)
    if (!componentMap.has(root)) {
      componentMap.set(root, [])
    }
    componentMap.get(root)!.push(node.id)
  }

  // 为每个连通分量计算布局
  const componentLayouts: ComponentLayout[] = []
  for (const [rootId, memberIds] of componentMap) {
    const memberSet = new Set(memberIds)

    // BFS 分层
    const depthMap = new Map<string, number>()
    depthMap.set(rootId, 0)
    const queue: string[] = [rootId]
    let maxDepth = 0

    // 构建子节点映射
    const childrenMap = new Map<string, string[]>()
    for (const id of memberIds) {
      if (id === rootId) continue
      const p = data.parent[id]
      if (!childrenMap.has(p)) {
        childrenMap.set(p, [])
      }
      childrenMap.get(p)!.push(id)
    }

    while (queue.length > 0) {
      const cur = queue.shift()!
      const curDepth = depthMap.get(cur) || 0
      const children = childrenMap.get(cur) || []
      for (const child of children) {
        depthMap.set(child, curDepth + 1)
        if (curDepth + 1 > maxDepth) maxDepth = curDepth + 1
        queue.push(child)
      }
    }

    // 按层组织节点
    const levels: string[][] = Array.from({ length: maxDepth + 1 }, () => [])
    for (const id of memberIds) {
      const d = depthMap.get(id) || 0
      levels[d].push(id)
    }

    // 计算每层宽度，取最大值作为分量宽度
    const maxLevelWidth = Math.max(...levels.map(l => l.length))
    const componentWidth = Math.max(maxLevelWidth * NODE_SPACING, NODE_SPACING)

    // 节点值映射
    const valueMap = new Map<string, number>()
    for (const node of data.nodes) {
      if (memberSet.has(node.id)) {
        valueMap.set(node.id, node.value)
      }
    }

    const compPositions: UFPosition[] = []
    for (let d = 0; d <= maxDepth; d++) {
      const levelNodes = levels[d]
      const levelWidth = levelNodes.length * NODE_SPACING
      const startX = (componentWidth - levelWidth) / 2 + NODE_SPACING / 2
      for (let i = 0; i < levelNodes.length; i++) {
        const id = levelNodes[i]
        compPositions.push({
          id,
          value: valueMap.get(id) as number,
          x: startX + i * NODE_SPACING,
          y: TOP_MARGIN + d * LEVEL_HEIGHT,
          isRoot: id === rootId,
          depth: d,
        })
      }
    }

    // 构建边
    const posMap = new Map(compPositions.map(p => [p.id, p]))
    for (const id of memberIds) {
      if (id === rootId) continue
      const p = data.parent[id]
      const sourcePos = posMap.get(id)
      const targetPos = posMap.get(p)
      if (sourcePos && targetPos) {
        edges.push({ source: sourcePos, target: targetPos })
      }
    }

    componentLayouts.push({
      positions: compPositions,
      edges: edges.filter(e => compPositions.includes(e.source)),
      width: componentWidth,
    })
  }

  // 计算总宽度并水平排列各分量
  const totalWidth = componentLayouts.reduce((sum, c, i) => sum + c.width + (i > 0 ? COMPONENT_SPACING : 0), 0)
  const globalStartX = calculateCenterStart(totalWidth, width)

  let cumulativeX = globalStartX
  for (const comp of componentLayouts) {
    for (const pos of comp.positions) {
      positions.push({
        ...pos,
        x: pos.x + cumulativeX,
      })
    }
    cumulativeX += comp.width + COMPONENT_SPACING
  }

  // 重建全局边（使用更新后的 positions）
  const globalPosMap = new Map(positions.map(p => [p.id, p]))
  const globalEdges: UFRenderEdge[] = []
  for (const node of data.nodes) {
    const id = node.id
    const p = data.parent[id]
    if (p === id) continue  // 根节点
    const sourcePos = globalPosMap.get(id)
    const targetPos = globalPosMap.get(p)
    if (sourcePos && targetPos) {
      globalEdges.push({ source: sourcePos, target: targetPos })
    }
  }

  return { positions, edges: globalEdges }
}

/**
 * Render the Union-Find forest
 */
export function renderUnionFind(
  svg: SVGSVGElement,
  data: UnionFindData,
  options: UnionFindVisualizerOptions = {},
): void {
  measureRender('renderUnionFind', () => {
    const isDark = options.isDark ?? detectDarkMode()
    const C = getColors(isDark)

    const container = select(svg)
    container.selectAll('*').interrupt()
    container.selectAll('*').remove()

    ensureGradientDefs(svg, isDark)

    const { width, height } = getViewBoxSize(svg, options.width ?? FALLBACK_W, options.height ?? FALLBACK_H)

    // 空并查集提示
    if (!data || !data.nodes || data.nodes.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textLight)
        .attr('font-size', '14px')
        .text(tStatic('emptyState.emptyUnionFindShort'))
      return
    }

    const { positions, edges } = layout(data, width, height)

    // 先绘制边（在节点下层）
    for (const edge of edges) {
      container.append('line')
        .attr('class', `uf-edge from-${edge.source.id}-to-${edge.target.id}`)
        .attr('x1', edge.source.x)
        .attr('y1', edge.source.y)
        .attr('x2', edge.target.x)
        .attr('y2', edge.target.y)
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.7)
    }

    // 再绘制节点（在边上层）
    for (const pos of positions) {
      const fill = pos.isRoot ? gradUrl('node-root') : gradUrl('node-default')
      const stroke = pos.isRoot ? C.nodeRootStroke : C.nodeDefaultStroke
      const strokeWidth = pos.isRoot ? 2.5 : 2

      const nodeG = container.append('g')
        .attr('class', `uf-node node-${pos.id}`)
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('data-id', pos.id)
        .attr('data-value', String(pos.value))
        .attr('data-is-root', pos.isRoot ? 'true' : 'false')

      nodeG.append('circle')
        .attr('class', 'uf-node-shape')
        .attr('r', DEFAULT_NODE_RADIUS)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)

      nodeG.append('text')
        .attr('class', 'uf-node-value')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textWhite)
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .attr('font-family', 'var(--font-mono)')
        .text(String(pos.value))
    }
  })
}

/**
 * 内部：根据 data-id 查找节点选择器
 */
function findNodeById(svg: SVGSVGElement, nodeId: string): ReturnType<typeof select> | null {
  const container = select(svg)
  const nodes = container.selectAll('.uf-node').nodes()
  for (const nodeEl of nodes) {
    const el = nodeEl as SVGGElement
    if (el.getAttribute('data-id') === nodeId) {
      return select(el)
    }
  }
  return null
}

/**
 * 脉冲高亮节点
 */
async function pulseNode(node: ReturnType<typeof select>, anim?: Animation): Promise<void> {
  if (anim?.isAborted?.()) return
  const shape = node.select('.uf-node-shape')
  if (shape.empty()) return

  const baseFill = shape.attr('fill') || gradUrl('node-default')
  const baseStrokeWidth = parseFloat(shape.attr('stroke-width')) || 2

  await transitionEnd(
    shape.transition().duration(duration(220)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('node-active'))
      .attr('stroke-width', baseStrokeWidth + 1.5),
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    shape.transition().duration(duration(180)).ease(EASING.easeOutCubic)
      .attr('fill', baseFill)
      .attr('stroke-width', baseStrokeWidth),
  )
}

/**
 * 高亮边
 */
async function highlightEdge(
  svg: SVGSVGElement,
  fromId: string,
  toId: string,
  anim?: Animation,
): Promise<void> {
  if (anim?.isAborted?.()) return
  const container = select(svg)
  const C = getColors(detectDarkMode())
  const edge = container.select(`.uf-edge.from-${fromId}-to-${toId}`)
  if (edge.empty()) return
  await transitionEnd(
    edge.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('stroke', C.edgeActive)
      .attr('stroke-width', 3.5)
      .attr('opacity', 1),
  )
}

/**
 * Insert animation: highlight new node with scale-in effect
 */
export async function animateInsertUnionFind(
  svg: SVGSVGElement,
  value: number,
  anim?: Animation,
): Promise<void> {
  const container = select(svg)
  const nodes = container.selectAll('.uf-node').nodes()
  for (const nodeEl of nodes) {
    const el = nodeEl as SVGGElement
    const dataValue = el.getAttribute('data-value')
    if (dataValue !== String(value)) continue
    const node = select(el)
    const shape = node.select('.uf-node-shape')
    if (shape.empty()) continue

    const baseFill = shape.attr('fill') || gradUrl('node-default')
    shape.attr('fill', gradUrl('node-active'))

    await transitionEnd(
      shape.transition().duration(duration(350)).ease(EASING.easeOutElastic)
        .attr('fill', baseFill),
    )

    if (anim?.isAborted?.()) return
    await pulseNode(node, anim)
    break
  }
}

/**
 * Delete animation: highlight then fade out
 */
export async function animateDeleteUnionFind(
  svg: SVGSVGElement,
  value: number,
  anim?: Animation,
): Promise<void> {
  const container = select(svg)
  const nodes = container.selectAll('.uf-node').nodes()
  const targetNodes: ReturnType<typeof select>[] = []
  for (const nodeEl of nodes) {
    const el = nodeEl as SVGGElement
    const dataValue = el.getAttribute('data-value')
    if (dataValue !== String(value)) continue
    targetNodes.push(select(el))
  }

  for (const node of targetNodes) {
    if (anim?.isAborted?.()) return
    const shape = node.select('.uf-node-shape')
    if (shape.empty()) continue
    await transitionEnd(
      shape.transition().duration(duration(200)).ease(EASING.easeOutCubic)
        .attr('fill', gradUrl('node-error')),
    )
  }

  if (anim?.isAborted?.()) return

  for (const node of targetNodes) {
    if (anim?.isAborted?.()) return
    await transitionEnd(
      node.transition().duration(duration(300)).ease(EASING.easeInCubic)
        .attr('opacity', 0.15),
    )
  }
}

/**
 * Find animation: highlight path from node to root
 */
export async function animateFindUnionFind(
  svg: SVGSVGElement,
  path: string[],
  rootId: string,
  anim?: Animation,
): Promise<void> {
  // 高亮路径上的每个节点
  for (let i = 0; i < path.length; i++) {
    if (anim?.isAborted?.()) return
    const nodeId = path[i]
    const node = findNodeById(svg, nodeId)
    if (!node) continue

    // 高亮到达该节点前的边
    if (i > 0) {
      const prevId = path[i - 1]
      await highlightEdge(svg, prevId, nodeId, anim)
    }

    await pulseNode(node, anim)
  }

  // 最终根节点反馈
  if (anim?.isAborted?.()) return
  if (rootId) {
    const rootNode = findNodeById(svg, rootId)
    if (rootNode && !rootNode.empty()) {
      const shape = rootNode.select('.uf-node-shape')
      if (!shape.empty()) {
        const baseFill = shape.attr('fill') || gradUrl('node-root')
        await transitionEnd(
          shape.transition().duration(duration(300)).ease(EASING.easeOutCubic)
            .attr('fill', gradUrl('node-leaf')),
        )
        if (anim?.isAborted?.()) return
        await transitionEnd(
          shape.transition().duration(duration(250)).ease(EASING.easeInCubic)
            .attr('fill', baseFill),
        )
      }
    }
  }
}

/**
 * Union animation: highlight two roots then show connection
 */
export async function animateUnionUnionFind(
  svg: SVGSVGElement,
  rootAId: string,
  rootBId: string,
  anim?: Animation,
): Promise<void> {
  // 高亮两个根节点
  const rootA = findNodeById(svg, rootAId)
  const rootB = findNodeById(svg, rootBId)

  if (rootA) {
    await pulseNode(rootA, anim)
  }
  if (anim?.isAborted?.()) return
  if (rootB) {
    await pulseNode(rootB, anim)
  }
}
