import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, getDefaultEasing, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'
import { calculateCenterStart } from '../utils/visualizerLayout'
import { shouldSkipAnimation } from '../utils/performanceConfig'
import { DEFAULT_NODE_RADIUS as NODE_RADIUS } from './visualizerConstants'

interface HeapOptions {
  width: number
  height: number
  isDark?: boolean
}

function layout(data: number[], width: number, height?: number) {
  const n = data.length
  if (n === 0) return { positions: [] }

  const positions = []
  const levels = []
  let level = 0
  let count = 0

  while (count < n) {
    const nodesInLevel = Math.min(Math.pow(2, level), n - count)
    const levelIndices = []
    for (let i = 0; i < nodesInLevel; i++) {
      levelIndices.push(count + i)
    }
    levels.push(levelIndices)
    count += nodesInLevel
    level++
  }

  const safeHeight = height && height > 0 ? height : 400
  const maxLevel = levels.length - 1
  const startY = 30
  const bottomMargin = 30
  const NODE_R = 22
  const baseLevelHeight = 80
  const neededHeight = startY + maxLevel * baseLevelHeight + NODE_R + bottomMargin
  const levelHeight = (neededHeight > safeHeight && maxLevel > 0)
    ? Math.max(30, (safeHeight - startY - NODE_R - bottomMargin) / maxLevel)
    : baseLevelHeight

  for (let l = 0; l < levels.length; l++) {
    const levelIndices = levels[l]
    const y = startY + l * levelHeight
    const nodesInLevel = levelIndices.length
    const availableWidth = width - 40
    const spacing = Math.max(60, availableWidth / (nodesInLevel + 1))
    const startX = calculateCenterStart(spacing * (nodesInLevel - 1), width)

    for (let i = 0; i < nodesInLevel; i++) {
      positions.push({
        index: levelIndices[i],
        x: startX + i * spacing,
        y,
        level: l,
      })
    }
  }

  return { positions }
}

/**
 * 渲染堆可视化
 * @param {SVGElement} svg - SVG 容器
 * @param {Array} data - 堆数据
 * @param {Object} options - 配置项 { width, height }
 */
export function renderHeap(svg: SVGSVGElement, data: number[], options: HeapOptions = {} as HeapOptions) {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)
  container.selectAll('*').interrupt()
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!data || data.length === 0) {
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyHeapShort'))
    return
  }

  const { positions } = layout(data, width, height)

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    const parentIndex = Math.floor((pos.index - 1) / 2)
    const parentPos = positions.find(p => p.index === parentIndex)

    if (parentPos && parentIndex >= 0) {
      const isHeapViolation = pos.index < data.length && parentIndex < data.length && data[pos.index] > data[parentIndex]

      const edgeLine = container.append('line')
        .attr('x1', parentPos.x).attr('y1', parentPos.y + NODE_RADIUS)
        .attr('x2', pos.x).attr('y2', pos.y - NODE_RADIUS)
        .attr('stroke', isHeapViolation ? C.nodeError : C.edgeDefault)
        .attr('stroke-width', isHeapViolation ? 3 : 2)
        .attr('stroke-dasharray', isHeapViolation ? '5,3' : 'none')

      if (isHeapViolation) {
        edgeLine.style('animation', 'heap-violation-pulse 1.2s ease-in-out infinite')
      }
    }
  }

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    if (pos.index >= data.length) continue

    const parentIndex = Math.floor((pos.index - 1) / 2)
    const isRoot = pos.index === 0
    const isLeaf = 2 * pos.index + 1 >= data.length

    let fill = gradUrl('node-default')
    if (isRoot) fill = gradUrl('node-root')
    else if (isLeaf) fill = gradUrl('node-leaf')

    const isViolation = pos.index < data.length && parentIndex >= 0 && parentIndex < data.length && data[pos.index] > data[parentIndex]
    if (isViolation) fill = gradUrl('node-error')

    const nodeGroup = container.append('g')
      .attr('class', `heap-node index-${pos.index}`)
      .attr('transform', `translate(${pos.x}, ${pos.y})`)
      .attr('tabindex', '0')
      .attr('role', 'group')
      .attr('aria-label', `Node ${data[pos.index]}`)
      .on('focus', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('circle').attr('stroke', C.nodeActive).attr('stroke-width', 3)
      })
      .on('blur', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('circle').attr('stroke', isViolation ? C.nodeErrorStroke : C.nodeDefaultStroke).attr('stroke-width', isViolation ? 3 : 2)
      })
      .on('keydown', function(this: SVGGElement, event: KeyboardEvent) {
        if (!event?.key) return
        const allNodes = Array.from(container.selectAll('.heap-node').nodes())
        const idx = allNodes.indexOf(this)
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          const next = allNodes[(idx + 1) % allNodes.length] as HTMLElement
          next?.focus()
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          const prev = allNodes[(idx - 1 + allNodes.length) % allNodes.length] as HTMLElement
          prev?.focus()
        }
      })

    nodeGroup.append('circle')
      .attr('r', NODE_RADIUS)
      .attr('fill', fill)
      .attr('stroke', isViolation ? C.nodeErrorStroke : C.nodeDefaultStroke)
      .attr('stroke-width', isViolation ? 3 : 2)

    nodeGroup.append('text')
      .attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold')
      .text(data[pos.index])

    nodeGroup.append('text')
      .attr('dy', NODE_RADIUS + 14).attr('text-anchor', 'middle')
      .attr('fill', C.textLight).attr('font-size', '9px')
      .text(`[${pos.index}]`)
  }
}

/**
 * 插入堆元素动画
 * @param {SVGElement} svg - SVG 容器
 * @param {*} value - 插入的值
 * @param {Array} data - 当前堆数据
 * @param {Object} [anim] - 动画上下文
 */
export async function animateInsertHeap(svg: SVGSVGElement, _value: number, data: number[], anim?: Animation) {
  if (shouldSkipAnimation('heap', data.length)) return
  const container = select(svg)
  const defaultEase = getDefaultEasing()

  // 查找新插入的节点（DOM 中最后一个堆节点）
  const allNodes = container.selectAll('.heap-node').nodes()
  if (allNodes.length === 0) return
  const newNode = select(allNodes[allNodes.length - 1] as SVGGElement)
  const newIndex = allNodes.length - 1

  if (anim?.isAborted?.()) return

  // Phase 1: New node appears with scale bounce
  const newCircle = newNode.select('circle')
  const newTexts = newNode.selectAll('text')
  newCircle.attr('r', 0).attr('opacity', 0)
  newTexts.attr('opacity', 0)

  // 拆分链式过渡为两段顺序 await，确保每段 end 事件被 transitionEnd 正确捕获
  await transitionEnd(
    newCircle
      .transition().duration(duration(300)).ease(EASING.easeOutBack)
      .attr('r', NODE_RADIUS + 5)
      .attr('opacity', 1)
      .attr('fill', gradUrl('node-active'))
  )
  if (anim?.isAborted?.()) return
  await transitionEnd(
    newCircle
      .transition().duration(duration(250)).ease(defaultEase)
      .attr('r', NODE_RADIUS)
      .attr('fill', gradUrl('node-default'))
  )
  newTexts.transition().duration(duration(200)).attr('opacity', 1)

  if (anim?.isAborted?.()) return

  // Phase 2: Sift-up path pulses sequentially (from new node to root)
  let idx = newIndex
  while (idx > 0) {
    const parentIdx = Math.floor((idx - 1) / 2)
    const parentGroup = container.select(`.heap-node.index-${parentIdx}`)
    if (parentGroup.empty()) break

    if (anim?.isAborted?.()) return

    // 拆分链式过渡为两段顺序 await
    const parentCircle = parentGroup.select('circle')
    await transitionEnd(
      parentCircle
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 4)
        .attr('fill', gradUrl('node-active'))
    )
    if (anim?.isAborted?.()) return
    await transitionEnd(
      parentCircle
        .transition().duration(duration(200)).ease(defaultEase)
        .attr('r', NODE_RADIUS)
        .attr('fill', gradUrl('node-default'))
    )
    idx = parentIdx
  }
}

/**
 * 提取堆顶元素动画
 * @param {SVGElement} svg - SVG 容器
 * @param {Object} [anim] - 动画上下文
 */
export async function animateExtractHeap(svg: SVGSVGElement, anim?: Animation) {
  const container = select(svg)
  const defaultEase = getDefaultEasing()
  const rootGroup = container.select('.heap-node.index-0')

  if (!rootGroup.empty()) {
    if (anim?.isAborted?.()) return

    // Phase 1: Root pulses with overshoot (highlight the max value)
    // 拆分链式过渡为两段顺序 await
    const rootCircle = rootGroup.select('circle')
    await transitionEnd(
      rootCircle
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 10)
        .attr('fill', gradUrl('node-active'))
    )
    if (anim?.isAborted?.()) return
    await transitionEnd(
      rootCircle
        .transition().duration(duration(200)).ease(defaultEase)
        .attr('r', NODE_RADIUS)
        .attr('fill', gradUrl('node-error'))
    )

    if (anim?.isAborted?.()) return

    // Phase 2: Sift-down visualization — highlight children sequentially
    const allNodes = container.selectAll('.heap-node').nodes()
    const totalNodes = allNodes.length
    let idx = 0
    while (true) {
      const leftIdx = 2 * idx + 1
      const rightIdx = 2 * idx + 2
      if (leftIdx >= totalNodes) break

      const leftGroup = container.select(`.heap-node.index-${leftIdx}`)
      const rightGroup = rightIdx < totalNodes ? container.select(`.heap-node.index-${rightIdx}`) : null

      if (anim?.isAborted?.()) return

      // 高亮左子节点
      if (!leftGroup.empty()) {
        // 拆分链式过渡为两段顺序 await
        const leftCircle = leftGroup.select('circle')
        await transitionEnd(
          leftCircle
            .transition().duration(duration(200)).ease(EASING.easeOutBack)
            .attr('r', NODE_RADIUS + 4)
            .attr('fill', gradUrl('node-active'))
        )
        if (anim?.isAborted?.()) return
        await transitionEnd(
          leftCircle
            .transition().duration(duration(150)).ease(defaultEase)
            .attr('r', NODE_RADIUS)
            .attr('fill', gradUrl('node-default'))
        )
      }

      // 高亮右子节点（如果存在）
      if (rightGroup && !rightGroup.empty()) {
        // 拆分链式过渡为两段顺序 await
        const rightCircle = rightGroup.select('circle')
        await transitionEnd(
          rightCircle
            .transition().duration(duration(200)).ease(EASING.easeOutBack)
            .attr('r', NODE_RADIUS + 4)
            .attr('fill', gradUrl('node-active'))
        )
        if (anim?.isAborted?.()) return
        await transitionEnd(
          rightCircle
            .transition().duration(duration(150)).ease(defaultEase)
            .attr('r', NODE_RADIUS)
            .attr('fill', gradUrl('node-default'))
        )
      }

      // 移动到需要交换的子节点（模拟）
      idx = leftIdx
    }

    if (anim?.isAborted?.()) return

    // Phase 3: Root shrinks and fades out
    await transitionEnd(
      rootGroup.select('circle')
        .transition().duration(duration(250)).ease(EASING.easeInCubic)
        .attr('r', 0)
        .attr('opacity', 0)
    )
    rootGroup.selectAll('text')
      .transition().duration(duration(150)).attr('opacity', 0)
  }
}

/**
 * 查看堆顶元素动画
 * @param {SVGElement} svg - SVG 容器
 * @param {Object} [anim] - 动画上下文
 */
export async function animatePeekHeap(svg: SVGSVGElement, anim?: Animation) {
  const container = select(svg)
  const rootGroup = container.select('.heap-node.index-0')

  if (!rootGroup.empty()) {
    if (anim?.isAborted?.()) return
    // peek 的弹性反弹效果
    // 拆分链式过渡为两段顺序 await
    const rootCircle = rootGroup.select('circle')
    await transitionEnd(
      rootCircle
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 8)
        .attr('fill', gradUrl('node-active'))
    )
    if (anim?.isAborted?.()) return
    await transitionEnd(
      rootCircle
        .transition().duration(duration(500)).ease(EASING.easeOutElastic)
        .attr('r', NODE_RADIUS)
        .attr('fill', gradUrl('node-root'))
    )
  }
}
