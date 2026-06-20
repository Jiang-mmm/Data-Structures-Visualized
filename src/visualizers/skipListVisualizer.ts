/**
 * 跳表（SkipList）可视化器
 *
 * 渲染策略：D3 全清 + 全绘（selectAll('*').remove() 后重建）
 * 数据来源：useSkipListState.data 返回的 SkipListData
 * 布局算法：多层水平布局，最高层在顶部，最低层在底部
 *
 * 节点显示：圆角矩形（rect with rx），head 节点显示 'H'
 * 边显示：水平线连接同层节点
 * 颜色编码：
 * - head 节点：nodeRoot（橙色）
 * - 默认节点：nodeDefault（蓝色）
 * - 高亮节点：nodeActive（红色，动画用）
 */

import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { duration, EASING, transitionEnd, measureRender, type Animation } from '../utils/animationEngine'
import { getViewBoxSize, calculateCenterStart } from '../utils/visualizerLayout'
import { tStatic } from '../i18n/useI18n'
import type { SkipListData, SkipListSearchStep } from '../hooks/useSkipListState'

export interface SkipListVisualizerOptions {
  isDark?: boolean
  width?: number
  height?: number
}

/** 节点尺寸 */
const NODE_WIDTH = 44
const NODE_HEIGHT = 28
const NODE_RX = 6
/** 层间距 */
const LEVEL_HEIGHT = 40
/** 节点间距（水平） */
const NODE_SPACING = 16
/** 边距 */
const TOP_MARGIN = 30
const LEFT_MARGIN = 30
const FALLBACK_W = 800
const FALLBACK_H = 400

/** 渲染位置 */
interface SkipListPosition {
  id: string
  value: number
  x: number
  y: number
  isHead: boolean
}

/** 渲染边 */
interface SkipListRenderEdge {
  source: SkipListPosition
  target: SkipListPosition
  level: number
}

/**
 * 计算跳表布局
 * - 第 0 层（最底层）包含所有节点
 * - 高层只包含 level >= 该层+1 的节点
 * - 节点 x 坐标按第 0 层顺序确定，高层节点复用相同 x
 */
function layout(data: SkipListData, width: number, _height: number): {
  positions: SkipListPosition[]
  edges: SkipListRenderEdge[]
  maxLevel: number
} {
  const positions: SkipListPosition[] = []
  const edges: SkipListRenderEdge[] = []

  if (!data || !data.nodes || data.nodes.length === 0) {
    return { positions, edges, maxLevel: 0 }
  }

  const maxLevel = data.maxLevel

  // 第 0 层节点顺序：head, 然后按 value 升序
  const valueNodes = data.nodes
    .filter(n => n.id !== 'head')
    .sort((a, b) => a.value - b.value)
  const level0Seq = ['head', ...valueNodes.map(n => n.id)]

  // 计算每个节点的 x 坐标（基于第 0 层顺序）
  const xMap = new Map<string, number>()
  const totalWidth = level0Seq.length * NODE_WIDTH + (level0Seq.length - 1) * NODE_SPACING
  const startX = calculateCenterStart(totalWidth, width) + LEFT_MARGIN
  for (let i = 0; i < level0Seq.length; i++) {
    xMap.set(level0Seq[i], startX + i * (NODE_WIDTH + NODE_SPACING))
  }

  // 节点 value 映射
  const valueMap = new Map<string, number>()
  for (const n of data.nodes) {
    valueMap.set(n.id, n.value)
  }
  // 节点 level 映射
  const levelMap = new Map<string, number>()
  for (const n of data.nodes) {
    levelMap.set(n.id, n.level)
  }

  // 为每层生成位置（同一节点在不同层有不同 y）
  // 但 x 坐标相同
  const posByLevel: SkipListPosition[][] = []
  for (let lvl = 0; lvl < maxLevel; lvl++) {
    const seq = level0Seq.filter(id => {
      const nl = levelMap.get(id) as number
      return nl >= lvl + 1
    })
    const y = TOP_MARGIN + (maxLevel - 1 - lvl) * LEVEL_HEIGHT
    const layerPositions: SkipListPosition[] = seq.map(id => ({
      id,
      value: valueMap.get(id) as number,
      x: xMap.get(id) as number,
      y,
      isHead: id === 'head',
    }))
    posByLevel.push(layerPositions)
    positions.push(...layerPositions)

    // 同层边
    for (let i = 0; i < layerPositions.length - 1; i++) {
      edges.push({
        source: layerPositions[i],
        target: layerPositions[i + 1],
        level: lvl,
      })
    }
  }

  return { positions, edges, maxLevel }
}

/**
 * 渲染跳表
 */
export function renderSkipList(
  svg: SVGSVGElement,
  data: SkipListData,
  options: SkipListVisualizerOptions = {},
): void {
  measureRender('renderSkipList', () => {
    const isDark = options.isDark ?? detectDarkMode()
    const C = getColors(isDark)

    const container = select(svg)
    container.selectAll('*').interrupt()
    container.selectAll('*').remove()

    ensureGradientDefs(svg, isDark)

    const { width, height } = getViewBoxSize(svg, options.width ?? FALLBACK_W, options.height ?? FALLBACK_H)

    // 空跳表提示
    if (!data || !data.nodes || data.nodes.length === 0) {
      container.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textLight)
        .attr('font-size', '14px')
        .text(tStatic('emptyState.emptySkipListShort'))
      return
    }

    const { positions, edges } = layout(data, width, height)

    // 先绘制边（在节点下层）
    for (const edge of edges) {
      const x1 = edge.source.x + NODE_WIDTH / 2
      const y1 = edge.source.y
      const x2 = edge.target.x - NODE_WIDTH / 2
      const y2 = edge.target.y

      container.append('line')
        .attr('class', `skiplist-edge level-${edge.level} from-${edge.source.id}-to-${edge.target.id}`)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', C.edgeDefault)
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0.7)
    }

    // 再绘制节点（在边上层）
    // 使用 id+level 作为唯一 key，避免同 id 多层节点冲突
    const seenKeys = new Set<string>()
    for (const pos of positions) {
      const key = `${pos.id}@${pos.y}`
      if (seenKeys.has(key)) continue
      seenKeys.add(key)

      const fill = pos.isHead ? gradUrl('node-root') : gradUrl('node-default')
      const stroke = pos.isHead ? C.nodeRootStroke : C.nodeDefaultStroke
      const strokeWidth = pos.isHead ? 2.5 : 2

      const nodeG = container.append('g')
        .attr('class', `skiplist-node node-${pos.id}`)
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('data-id', pos.id)
        .attr('data-value', pos.isHead ? 'head' : String(pos.value))

      nodeG.append('rect')
        .attr('class', 'skiplist-node-shape')
        .attr('x', -NODE_WIDTH / 2)
        .attr('y', -NODE_HEIGHT / 2)
        .attr('width', NODE_WIDTH)
        .attr('height', NODE_HEIGHT)
        .attr('rx', NODE_RX)
        .attr('ry', NODE_RX)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', strokeWidth)

      nodeG.append('text')
        .attr('class', 'skiplist-node-value')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textWhite)
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .attr('font-family', 'var(--font-mono)')
        .text(pos.isHead ? tStatic('skipList.headLabel') : String(pos.value))
    }

    // 层级标签（左侧）
    for (let lvl = 0; lvl < data.maxLevel; lvl++) {
      const y = TOP_MARGIN + (data.maxLevel - 1 - lvl) * LEVEL_HEIGHT
      container.append('text')
        .attr('class', `skiplist-level-label level-${lvl}`)
        .attr('x', 8)
        .attr('y', y)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'central')
        .attr('fill', C.textLight)
        .attr('font-size', '10px')
        .attr('font-family', 'var(--font-mono)')
        .text(`L${lvl}`)
    }
  })
}

/**
 * 获取节点在某层的位置（用于动画）
 */
function findNodeAtLevel(
  svg: SVGSVGElement,
  nodeId: string,
  level: number,
): ReturnType<typeof select> | null {
  const container = select(svg)
  // 通过 data-id 和 transform y 区分多层
  const maxLevel = Number(container.attr('data-maxlevel') || '0')
  // 计算该层的 y 坐标
  const y = TOP_MARGIN + (maxLevel - 1 - level) * LEVEL_HEIGHT
  const nodes = container.selectAll('.skiplist-node').nodes()
  for (const nodeEl of nodes) {
    const el = nodeEl as SVGGElement
    const dataId = el.getAttribute('data-id')
    if (dataId !== nodeId) continue
    const transform = el.getAttribute('transform') || ''
    const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(transform)
    if (!match) continue
    const nodeY = parseFloat(match[2])
    if (Math.abs(nodeY - y) < 1) {
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
  const shape = node.select('.skiplist-node-shape')
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
  level: number,
  anim?: Animation,
): Promise<void> {
  if (anim?.isAborted?.()) return
  const container = select(svg)
  const C = getColors(detectDarkMode())
  const edge = container.select(`.skiplist-edge.level-${level}.from-${fromId}-to-${toId}`)
  if (edge.empty()) return
  await transitionEnd(
    edge.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('stroke', C.edgeActive)
      .attr('stroke-width', 3.5)
      .attr('opacity', 1),
  )
}

/**
 * 插入动画：高亮新插入的节点
 */
export async function animateInsertSkipList(
  svg: SVGSVGElement,
  value: number,
  anim?: Animation,
): Promise<void> {
  const container = select(svg)

  // 设置 data-maxlevel 供 findNodeAtLevel 使用
  const maxLevelAttr = container.selectAll('.skiplist-level-label').nodes().length
  container.attr('data-maxlevel', String(maxLevelAttr))

  // 找到新插入的节点（按 data-value 匹配）
  const nodes = container.selectAll('.skiplist-node').nodes()
  for (const nodeEl of nodes) {
    const el = nodeEl as SVGGElement
    const dataValue = el.getAttribute('data-value')
    if (dataValue !== String(value)) continue
    const node = select(el)
    const shape = node.select('.skiplist-node-shape')
    if (shape.empty()) continue

    // 从 0 缩放到 1 的入场动画
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
 * 搜索动画：沿路径高亮
 */
export async function animateSearchSkipList(
  svg: SVGSVGElement,
  path: SkipListSearchStep[],
  found: boolean,
  anim?: Animation,
): Promise<void> {
  const container = select(svg)
  const maxLevelAttr = container.selectAll('.skiplist-level-label').nodes().length
  container.attr('data-maxlevel', String(maxLevelAttr))

  // 高亮路径上的每个节点
  for (let i = 0; i < path.length; i++) {
    if (anim?.isAborted?.()) return
    const step = path[i]
    const node = findNodeAtLevel(svg, step.nodeId, step.level)
    if (!node) continue

    // 高亮到达该节点前的边
    if (i > 0) {
      const prev = path[i - 1]
      await highlightEdge(svg, prev.nodeId, step.nodeId, step.level, anim)
    }

    await pulseNode(node, anim)
  }

  // 最终结果反馈
  if (anim?.isAborted?.()) return
  if (path.length > 0) {
    const last = path[path.length - 1]
    const lastNode = findNodeAtLevel(svg, last.nodeId, last.level)
    if (lastNode && !lastNode.empty()) {
      const shape = lastNode.select('.skiplist-node-shape')
      if (!shape.empty()) {
        const baseFill = shape.attr('fill') || gradUrl('node-default')
        const finalFill = found ? gradUrl('node-leaf') : gradUrl('node-error')
        await transitionEnd(
          shape.transition().duration(duration(300)).ease(EASING.easeOutCubic)
            .attr('fill', finalFill),
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
 * 删除动画：淡出目标节点
 */
export async function animateDeleteSkipList(
  svg: SVGSVGElement,
  value: number,
  anim?: Animation,
): Promise<void> {
  const container = select(svg)

  // 找到目标节点（所有层）
  const nodes = container.selectAll('.skiplist-node').nodes()
  const targetNodes: ReturnType<typeof select>[] = []
  for (const nodeEl of nodes) {
    const el = nodeEl as SVGGElement
    const dataValue = el.getAttribute('data-value')
    if (dataValue !== String(value)) continue
    targetNodes.push(select(el))
  }

  // 先高亮再淡出
  for (const node of targetNodes) {
    if (anim?.isAborted?.()) return
    const shape = node.select('.skiplist-node-shape')
    if (shape.empty()) continue
    await transitionEnd(
      shape.transition().duration(duration(200)).ease(EASING.easeOutCubic)
        .attr('fill', gradUrl('node-error')),
    )
  }

  if (anim?.isAborted?.()) return

  // 淡出
  for (const node of targetNodes) {
    if (anim?.isAborted?.()) return
    await transitionEnd(
      node.transition().duration(duration(300)).ease(EASING.easeInCubic)
        .attr('opacity', 0.15),
    )
  }
}
