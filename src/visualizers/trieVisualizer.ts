import { select } from '../utils/d3Imports'
import { tStatic } from '../i18n/useI18n'
import { duration, EASING, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'

const NODE_RADIUS = 20
const LEVEL_HEIGHT = 70

interface TrieVisualizerOptions {
  width: number
  height: number
  isDark?: boolean
}

interface TrieNodeData {
  id: string
  depth: number
  prefix: string
  isEndOfWord: boolean
}

interface TrieEdgeData {
  from: string
  to: string
  char: string
}

interface TrieFlatData {
  nodes: TrieNodeData[]
  edges: TrieEdgeData[]
}

interface TriePosition {
  id: string
  x: number
  y: number
  depth: number
  prefix: string
  isEndOfWord: boolean
}

function layout(flatData: TrieFlatData, width: number): { positions: TriePosition[]; nodes: TrieNodeData[]; edges: TrieEdgeData[] } {
  if (!flatData.nodes || flatData.nodes.length === 0) return { positions: [], nodes: [], edges: [] }

  const { nodes, edges } = flatData

  const levels: TrieNodeData[][] = []
  for (const node of nodes) {
    if (!levels[node.depth]) levels[node.depth] = []
    levels[node.depth].push(node)
  }

  const startY = 40
  const positions: TriePosition[] = []

  for (let l = 0; l < levels.length; l++) {
    const levelNodes = levels[l]
    const y = startY + l * LEVEL_HEIGHT
    const count = levelNodes.length
    const spacing = Math.max(50, (width - 80) / (count + 1))
    const startX = (width - spacing * (count - 1)) / 2

    for (let i = 0; i < count; i++) {
      positions.push({
        id: levelNodes[i].id,
        x: startX + i * spacing,
        y,
        depth: l,
        prefix: levelNodes[i].prefix,
        isEndOfWord: levelNodes[i].isEndOfWord,
      })
    }
  }

  return { positions, nodes, edges }
}

/**
 * 渲染字典树可视化
 * @param {SVGElement} svg - SVG 容器
 * @param {Object} flatData - 字典树数据 { nodes, edges }
 * @param {Object} options - 配置项 { width, height }
 */
export function renderTrie(svg: SVGSVGElement, flatData: TrieFlatData, options: TrieVisualizerOptions = {} as TrieVisualizerOptions) {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)
  container.selectAll('*').interrupt()
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!flatData.nodes || flatData.nodes.length === 0) {
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyTrieShort'))
    return
  }

  const { positions, edges } = layout(flatData, width)

  const posMap: Record<string, TriePosition> = {}
  for (const pos of positions) {
    posMap[pos.id] = pos
  }

  for (const edge of edges) {
    const fromPos = posMap[edge.from]
    const toPos = posMap[edge.to]
    if (!fromPos || !toPos) continue

    container.append('line')
      .attr('class', `trie-edge from-${edge.from}-to-${edge.to}`)
      .attr('x1', fromPos.x).attr('y1', fromPos.y)
      .attr('x2', toPos.x).attr('y2', toPos.y)
      .attr('stroke', C.edgeDefault).attr('stroke-width', 2)

    const midX = (fromPos.x + toPos.x) / 2
    const midY = (fromPos.y + toPos.y) / 2

    container.append('g')
      .attr('class', `trie-edge-label from-${edge.from}-to-${edge.to}`)
      .attr('transform', `translate(${midX}, ${midY})`)
      .append('circle')
      .attr('r', 9)
      .attr('fill', C.containerStroke).attr('stroke', C.edgeDefault).attr('stroke-width', 1.5)

    container.append('text')
      .attr('class', `trie-edge-label-text from-${edge.from}-to-${edge.to}`)
      .attr('x', midX).attr('y', midY + 1)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', C.nodeActive).attr('font-size', '12px').attr('font-weight', 'bold')
      .text(edge.char)
  }

  for (const pos of positions) {
    const fill = pos.id === 'root' ? gradUrl('node-root') : (pos.isEndOfWord ? gradUrl('node-leaf') : gradUrl('node-default'))

    const nodeGroup = container.append('g')
      .attr('class', `trie-node node-${pos.id}`)
      .attr('transform', `translate(${pos.x}, ${pos.y})`)

    nodeGroup.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', fill)
      .attr('stroke', C.nodeDefaultStroke)
      .attr('stroke-width', 2)

    if (pos.id === 'root') {
      nodeGroup.append('text')
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('fill', C.textWhite).attr('font-size', '10px').attr('font-weight', 'bold')
        .text('root')
    } else if (pos.prefix.length > 0) {
      const lastChar = pos.prefix[pos.prefix.length - 1]
      nodeGroup.append('text')
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold')
        .text(lastChar)
    }

    if (pos.isEndOfWord) {
      nodeGroup.append('text')
        .attr('dy', NODE_RADIUS + 12).attr('text-anchor', 'middle')
        .attr('fill', C.nodeLeaf).attr('font-size', '9px')
        .text('✓')
    }

    nodeGroup.append('text')
      .attr('dy', -NODE_RADIUS - 8).attr('text-anchor', 'middle')
      .attr('fill', C.textLight).attr('font-size', '8px')
      .text(pos.prefix || 'root')
  }
}

/**
 * 插入字典树动画
 * @param {SVGElement} svg - SVG 容器
 */
export async function animateInsertTrie(svg: SVGSVGElement) {
  const container = select(svg)
  const nodeElements = container.selectAll('.trie-node').nodes()

  if (nodeElements.length === 0) return

  // Animate nodes sequentially from root to deepest
  for (let i = 0; i < nodeElements.length; i++) {
    const node = select(nodeElements[i] as SVGGElement)
    const circle = node.select('circle')
    if (circle.empty()) continue

    const originalFill = circle.attr('fill') || gradUrl('node-default')

    await new Promise<void>((resolve) => {
      circle
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 5)
        .attr('fill', gradUrl('node-active'))
        .transition().duration(duration(200)).ease(EASING.easeOutCubic)
        .attr('r', NODE_RADIUS)
        .attr('fill', i === nodeElements.length - 1 ? gradUrl('node-leaf') : originalFill)
        .on('end interrupt', resolve)
    })
  }
}

/**
 * 搜索字典树动画
 * @param {SVGElement} svg - SVG 容器
 * @param {boolean} found - 是否找到
 */
export async function animateSearchTrie(svg: SVGSVGElement, found: boolean) {
  const container = select(svg)
  const nodeElements = container.selectAll('.trie-node').nodes()

  if (nodeElements.length === 0) return

  // Animate each node along the search path sequentially
  for (let i = 0; i < nodeElements.length; i++) {
    const node = select(nodeElements[i] as SVGGElement)
    const circle = node.select('circle')
    if (circle.empty()) continue

    const isLast = i === nodeElements.length - 1
    const originalFill = circle.attr('fill') || gradUrl('node-default')

    await new Promise<void>((resolve) => {
      circle
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + (isLast ? 8 : 5))
        .attr('fill', gradUrl('node-active'))
        .transition().duration(duration(isLast ? 350 : 200)).ease(isLast ? EASING.easeOutElastic : EASING.easeOutCubic)
        .attr('r', NODE_RADIUS)
        .attr('fill', isLast ? (found ? gradUrl('node-leaf') : gradUrl('node-error')) : originalFill)
        .on('end interrupt', resolve)
    })
  }
}

/**
 * 删除字典树动画
 * @param {SVGElement} svg - SVG 容器
 */
export async function animateDeleteTrie(svg: SVGSVGElement) {
  const container = select(svg)
  const nodeElements = container.selectAll('.trie-node').nodes()

  if (nodeElements.length === 0) return

  // Animate nodes in reverse order (leaf to root) with shrink+fade
  for (let i = nodeElements.length - 1; i >= 0; i--) {
    const node = select(nodeElements[i] as SVGGElement)
    const circle = node.select('circle')
    if (circle.empty()) continue

    await new Promise<void>((resolve) => {
      circle
        .transition().duration(duration(200)).ease(EASING.easeOutCubic)
        .attr('fill', gradUrl('node-error'))
        .attr('r', NODE_RADIUS + 3)
        .transition().duration(duration(250)).ease(EASING.easeInCubic)
        .attr('r', NODE_RADIUS)
        .attr('fill', gradUrl('node-default'))
        .on('end interrupt', resolve)
    })
  }
}
