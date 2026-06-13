import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl, type ThemeColors } from '../utils/themeColors'
import { duration, EASING } from '../utils/animationEngine'
import type { TrieFlattened } from '../hooks/useTrieState'

export interface TrieVisualizerOptions {
  isDark?: boolean
}

interface TriePosition {
  id: string
  x: number
  y: number
  prefix: string
  isEndOfWord: boolean
}

interface TrieEdge {
  from: string
  to: string
  char: string
}

const NODE_RADIUS = 18
const LEVEL_HEIGHT = 60
const MIN_NODE_SPACING = 50

function layout(data: TrieFlattened, width: number): { positions: TriePosition[]; edges: TrieEdge[] } {
  const positions: TriePosition[] = []
  const edges: TrieEdge[] = []

  if (!data.nodes || data.nodes.length === 0) return { positions, edges }

  const root: TriePosition = { id: 'root', x: width / 2, y: 40, prefix: '', isEndOfWord: false }
  positions.push(root)

  const nodesByParent = new Map<string, typeof data.nodes>()
  for (const node of data.nodes) {
    const parentId = node.parent === '' ? 'root' : `root-${node.parent}`
    if (!nodesByParent.has(parentId)) nodesByParent.set(parentId, [])
    nodesByParent.get(parentId)!.push(node)
  }

  function layoutLevel(parentId: string, parentX: number, level: number, minX: number, maxX: number) {
    const children = nodesByParent.get(parentId) || []
    if (children.length === 0) return

    const totalWidth = maxX - minX
    const childWidth = totalWidth / children.length

    children.forEach((child, i) => {
      const childId = `root-${child.char}`
      const x = minX + childWidth * i + childWidth / 2
      const y = 40 + level * LEVEL_HEIGHT

      positions.push({
        id: childId,
        x,
        y,
        prefix: child.char,
        isEndOfWord: child.isEndOfWord,
      })

      edges.push({
        from: parentId,
        to: childId,
        char: child.char[child.char.length - 1],
      })

      layoutLevel(childId, x, level + 1, minX + childWidth * i, minX + childWidth * (i + 1))
    })
  }

  layoutLevel('root', width / 2, 1, 0, width)

  return { positions, edges }
}

export function renderTrie(svg: SVGSVGElement, data: TrieFlattened, options: TrieVisualizerOptions = {}) {
  const isDark = options.isDark ?? detectDarkMode()
  const C = getColors(isDark)
  ensureGradientDefs(svg, isDark)

  const container = select(svg)
  container.selectAll('*').interrupt().remove()

  if (!data || !data.nodes || data.nodes.length === 0) {
    const width = svg.getBoundingClientRect().width || 600
    const height = svg.getBoundingClientRect().height || 300
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textLight)
      .text('Empty Trie - Insert a word to start')
    return
  }

  const width = svg.getBoundingClientRect().width || 600
  const { positions, edges } = layout(data, width)

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

function buildPath(word: string): string[] {
  const path = ['root']
  let current = ''
  for (const char of word) {
    current += char
    path.push(`root-${current}`)
  }
  return path
}

function getPathNodes(container: ReturnType<typeof select>, word: string) {
  const path = buildPath(word)
  return path
    .map(id => container.select(`.node-${id}`))
    .filter(sel => !sel.empty())
}

/**
 * 插入字典树动画 - only animates the path from root to the new node
 */
export async function animateInsertTrie(svg: SVGSVGElement, word?: string) {
  const container = select(svg)

  if (!word) {
    const nodeElements = container.selectAll('.trie-node').nodes()
    if (nodeElements.length === 0) return
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
    return
  }

  const pathNodes = getPathNodes(container, word)
  if (pathNodes.length === 0) return

  for (let i = 0; i < pathNodes.length; i++) {
    const node = pathNodes[i]
    const circle = node.select('circle')
    if (circle.empty()) continue
    const originalFill = circle.attr('fill') || gradUrl('node-default')
    const isLast = i === pathNodes.length - 1

    await new Promise<void>((resolve) => {
      circle
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 5)
        .attr('fill', gradUrl('node-active'))
        .transition().duration(duration(200)).ease(EASING.easeOutCubic)
        .attr('r', NODE_RADIUS)
        .attr('fill', isLast ? gradUrl('node-leaf') : originalFill)
        .on('end interrupt', resolve)
    })
  }
}

/**
 * 搜索字典树动画 - only animates the search path
 */
export async function animateSearchTrie(svg: SVGSVGElement, found: boolean, word?: string) {
  const container = select(svg)

  if (!word) {
    const nodeElements = container.selectAll('.trie-node').nodes()
    if (nodeElements.length === 0) return
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
    return
  }

  const pathNodes = getPathNodes(container, word)
  if (pathNodes.length === 0) return

  for (let i = 0; i < pathNodes.length; i++) {
    const node = pathNodes[i]
    const circle = node.select('circle')
    if (circle.empty()) continue
    const isLast = i === pathNodes.length - 1
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
 * 删除字典树动画 - only animates the path in reverse
 */
export async function animateDeleteTrie(svg: SVGSVGElement, word?: string) {
  const container = select(svg)

  if (!word) {
    const nodeElements = container.selectAll('.trie-node').nodes()
    if (nodeElements.length === 0) return
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
    return
  }

  const pathNodes = getPathNodes(container, word)
  if (pathNodes.length === 0) return

  for (let i = pathNodes.length - 1; i >= 0; i--) {
    const node = pathNodes[i]
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
