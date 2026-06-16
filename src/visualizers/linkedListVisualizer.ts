import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'

const NODE_RADIUS = 24
const NODE_GAP = 80
const BASE_DURATION = 350
const LARGE_DATA_THRESHOLD = 30

interface LLOptions {
  width: number
  height: number
  isDark?: boolean
}

function layout(data: number[], width: number, height: number) {
  const nodeSpacing = NODE_RADIUS * 2 + NODE_GAP
  const totalWidth = data.length * nodeSpacing - NODE_GAP
  const headSpace = NODE_RADIUS + 50 + 50 // HEAD label + margin
  const nullSpace = 80 // NULL label + margin
  const availableWidth = width - headSpace - nullSpace

  let effectiveGap = NODE_GAP
  let effectiveRadius = NODE_RADIUS
  if (totalWidth > availableWidth && data.length > 0) {
    const scale = availableWidth / (totalWidth + NODE_GAP)
    effectiveGap = Math.max(4, NODE_GAP * scale)
    effectiveRadius = Math.max(10, NODE_RADIUS * scale)
  }

  const effectiveNodeSpacing = effectiveRadius * 2 + effectiveGap
  const effectiveTotalWidth = data.length * effectiveNodeSpacing - effectiveGap
  const startX = Math.max(headSpace, (width - effectiveTotalWidth) / 2 + effectiveRadius)
  const startY = height / 2
  return { startX, startY, totalWidth: effectiveTotalWidth, effectiveRadius, effectiveGap }
}

function ensureArrowDef(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>) {
  if (!container.select('#ll-arrow').empty()) {
    container.select('#ll-arrow path').attr('fill', C.arrowStroke)
    return
  }
  container.append('defs').append('marker')
    .attr('id', 'll-arrow').attr('viewBox', '0 0 10 10')
    .attr('refX', 8).attr('refY', 5)
    .attr('markerWidth', 5).attr('markerHeight', 5)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', C.arrowStroke)
}

/**
 * 渲染链表可视化
 * @param {SVGElement} svg - SVG 容器
 * @param {Array} data - 链表数据
 * @param {Object} options - 配置项 { width, height, isDark }
 */
export function renderLinkedList(svg: SVGSVGElement, data: number[], options: LLOptions = {} as LLOptions) {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!data || data.length === 0) {
    container.append('text').attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyLinkedListShort'))
    return
  }

  ensureArrowDef(container, C)
  const { startX, startY, effectiveRadius, effectiveGap } = layout(data, width, height)
  const nodeSpacing = effectiveRadius * 2 + effectiveGap

  // HEAD label with background box
  const headBoxRight = startX - effectiveRadius - 2
  const headBoxWidth = 44
  container.append('rect')
    .attr('x', headBoxRight - headBoxWidth).attr('y', startY - 12)
    .attr('width', headBoxWidth).attr('height', 24).attr('rx', 4)
    .attr('fill', C.containerStroke).attr('opacity', 0.3)
  container.append('text').attr('x', headBoxRight - headBoxWidth / 2).attr('y', startY + 5)
    .attr('text-anchor', 'middle').attr('fill', C.textSecondary).attr('font-size', '11px').attr('font-weight', 'bold')
    .attr('font-family', "'JetBrains Mono', monospace")
    .text(tStatic('linkedlist.headLabel'))

  // Arrow from HEAD box to first node
  container.append('line')
    .attr('x1', headBoxRight + 2).attr('y1', startY)
    .attr('x2', startX - effectiveRadius - 2).attr('y2', startY)
    .attr('stroke', C.arrowStroke).attr('stroke-width', 2).attr('marker-end', 'url(#ll-arrow)')

  data.forEach((value, i) => {
    const x = startX + i * nodeSpacing
    const y = startY
    const g = container.append('g').attr('class', 'linked-node').attr('transform', `translate(${x}, ${y})`)
      .attr('tabindex', '0')
      .attr('role', 'group')
      .attr('aria-label', `Node ${value}`)
      .on('focus', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('circle').attr('stroke', C.nodeActive).attr('stroke-width', 3)
      })
      .on('blur', function(this: SVGGElement) {
        if (!this?.querySelector) return
        select(this).select('circle').attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)
      })
      .on('keydown', function(this: SVGGElement, event: KeyboardEvent) {
        if (!event?.key) return
        const allNodes = Array.from(container.selectAll('.linked-node').nodes())
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
    g.append('circle').attr('r', effectiveRadius).attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)
    g.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('fill', C.textWhite).attr('font-size', Math.max(10, Math.min(14, effectiveRadius * 0.6)) + 'px').attr('font-weight', 'bold').text(value)

    if (i < data.length - 1) {
      const nx = startX + (i + 1) * nodeSpacing
      container.append('line')
        .attr('x1', x + effectiveRadius + 5).attr('y1', y)
        .attr('x2', nx - effectiveRadius - 5).attr('y2', y)
        .attr('stroke', C.arrowStroke).attr('stroke-width', 2).attr('marker-end', 'url(#ll-arrow)')
    }
  })

  const lastX = startX + (data.length - 1) * nodeSpacing

  // NULL label with arrow
  const nullStartX = lastX + effectiveRadius + 8
  const nullLabelX = nullStartX + 22
  container.append('line')
    .attr('x1', nullStartX).attr('y1', startY)
    .attr('x2', nullStartX + 16).attr('y2', startY)
    .attr('stroke', C.arrowStroke).attr('stroke-width', 2).attr('marker-end', 'url(#ll-arrow)')

  // NULL badge
  container.append('rect')
    .attr('x', nullLabelX - 4).attr('y', startY - 11)
    .attr('width', 38).attr('height', 22).attr('rx', 4)
    .attr('fill', C.containerStroke).attr('opacity', 0.3)
  container.append('text').attr('x', nullLabelX + 15).attr('y', startY + 5)
    .attr('text-anchor', 'middle').attr('fill', C.textSecondary).attr('font-size', '12px').attr('font-weight', 'bold')
    .attr('font-family', "'JetBrains Mono', monospace")
    .text(tStatic('linkedlist.nullLabel'))
}

/**
 * 头插动画
 * @param {SVGElement} svg - SVG 容器
 * @param {*} value - 插入的值
 * @param {Array} data - 当前链表数据
 */
export async function animateInsertHead(svg: SVGSVGElement, value: number, data: number[], options: LLOptions = {} as LLOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const container = select(svg)
  const { width, height } = options
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const newData = [value, ...data]
  const { startX, startY, effectiveRadius } = layout(newData, width, height)
  const r = effectiveRadius

  const newGroup = container.append('g')
    .attr('class', 'linked-node')
    .attr('transform', `translate(${startX}, ${startY - 50}) scale(0.3)`)
    .attr('opacity', 0)

  newGroup.append('circle').attr('r', r)
    .attr('fill', gradUrl('node-leaf')).attr('stroke', C.nodeLeafStroke).attr('stroke-width', 2)
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', Math.max(10, Math.min(14, r * 0.6)) + 'px').attr('font-weight', 'bold').text(value)

  // Phase 1: Enter with overshoot bounce
  await transitionEnd(
    newGroup.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${startX}, ${startY}) scale(1.15)`)
      .attr('opacity', 1)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Settle to normal size
  await transitionEnd(
    newGroup.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('transform', `translate(${startX}, ${startY}) scale(1)`)
  )
  await transitionEnd(
    newGroup.select('circle').transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke)
  )
}

/**
 * 尾插动画
 * @param {SVGElement} svg - SVG 容器
 * @param {*} value - 插入的值
 * @param {Array} data - 当前链表数据
 */
export async function animateInsertTail(svg: SVGSVGElement, value: number, data: number[], options: LLOptions = {} as LLOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const container = select(svg)
  const { width, height } = options
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const newData = [...data, value]
  const { startX, startY, effectiveRadius, effectiveGap } = layout(newData, width, height)
  const r = effectiveRadius
  const lastX = startX + (newData.length - 1) * (r * 2 + effectiveGap)

  const newGroup = container.append('g')
    .attr('class', 'linked-node')
    .attr('transform', `translate(${lastX}, ${startY - 50}) scale(0.3)`)
    .attr('opacity', 0)

  newGroup.append('circle').attr('r', r)
    .attr('fill', gradUrl('node-leaf')).attr('stroke', C.nodeLeafStroke).attr('stroke-width', 2)
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', Math.max(10, Math.min(14, r * 0.6)) + 'px').attr('font-weight', 'bold').text(value)

  // Phase 1: Enter with overshoot bounce
  await transitionEnd(
    newGroup.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${lastX}, ${startY}) scale(1.15)`)
      .attr('opacity', 1)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Settle to normal size
  await transitionEnd(
    newGroup.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('transform', `translate(${lastX}, ${startY}) scale(1)`)
  )
  await transitionEnd(
    newGroup.select('circle').transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke)
  )
}

/**
 * 删除节点动画
 * @param {SVGElement} svg - SVG 容器
 * @param {number} index - 删除的节点索引
 * @param {Array} data - 当前链表数据
 */
export async function animateDeleteNode(svg: SVGSVGElement, index: number, data: number[], options: LLOptions = {} as LLOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const container = select(svg)
  const { width, height } = options
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const { startX, startY, effectiveRadius, effectiveGap } = layout(data, width, height)
  const nodeSpacing = effectiveRadius * 2 + effectiveGap
  const targetX = startX + index * nodeSpacing

  const targetNode = container.selectAll('g.linked-node').filter(function() {
    const m = select(this).attr('transform').match(/translate\(([^,]+)/)
    return m && Math.abs(parseFloat(m[1]) - targetX) < 5
  })

  // Phase 1: Highlight error with overshoot grow
  await transitionEnd(
    targetNode.select('circle').transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('node-error')).attr('stroke', C.nodeErrorStroke)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Shrink and fade out
  await transitionEnd(
    targetNode.transition().duration(duration(300)).ease(EASING.easeInCubic)
      .attr('transform', `translate(${targetX}, ${startY + 30}) scale(0.3)`)
      .attr('opacity', 0)
  )
}

/**
 * 搜索节点动画
 * @param {SVGElement} svg - SVG 容器
 * @param {number} index - 目标节点索引
 * @param {Array} data - 当前链表数据
 */
export async function animateSearchNode(svg: SVGSVGElement, index: number, data: number[], options: LLOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const container = select(svg)
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const { effectiveRadius } = layout(data, options.width, options.height)
  const r = effectiveRadius
  const nodes = container.selectAll('g.linked-node')

  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    const isTarget = i === index
    const sel = select(nodes.nodes()[i])

    if (isTarget) {
      await transitionEnd(
        sel.select('circle').transition().duration(duration(300)).ease(EASING.easeOutBack)
          .attr('r', r + 8)
          .attr('fill', gradUrl('node-leaf')).attr('stroke', C.nodeLeafStroke)
      )
      await transitionEnd(
        sel.select('circle').transition().duration(duration(250)).ease(EASING.easeOutCubic)
          .attr('r', r + 2)
      )
    } else {
      await transitionEnd(
        sel.select('circle').transition().duration(duration(200)).ease(EASING.easeOutBack)
          .attr('r', r + 4)
          .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke)
      )
      await transitionEnd(
        sel.select('circle').transition().duration(duration(200)).ease(EASING.easeOutCubic)
          .attr('r', r)
          .attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke)
      )
    }
  }
}

/**
 * 指定位置插入动画
 * @param {SVGElement} svg - SVG 容器
 * @param {number} index - 插入位置索引
 * @param {*} value - 插入的值
 * @param {Array} data - 当前链表数据
 */
export async function animateInsertAt(svg: SVGSVGElement, index: number, value: number, data: number[], options: LLOptions = {} as LLOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const container = select(svg)
  const { width, height } = options
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const newData = [...data.slice(0, index), value, ...data.slice(index)]
  const { startX, startY, effectiveRadius, effectiveGap } = layout(newData, width, height)
  const r = effectiveRadius
  const nodeSpacing = r * 2 + effectiveGap
  const targetX = startX + index * nodeSpacing

  const newGroup = container.append('g')
    .attr('class', 'linked-node')
    .attr('transform', `translate(${targetX}, ${startY - 50}) scale(0.3)`)
    .attr('opacity', 0)

  newGroup.append('circle').attr('r', r)
    .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke).attr('stroke-width', 2)
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', Math.max(10, Math.min(14, r * 0.6)) + 'px').attr('font-weight', 'bold').text(value)

  // Phase 1: Enter with overshoot bounce
  await transitionEnd(
    newGroup.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${targetX}, ${startY}) scale(1.15)`)
      .attr('opacity', 1)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Settle to normal size
  await transitionEnd(
    newGroup.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('transform', `translate(${targetX}, ${startY}) scale(1)`)
  )
  await transitionEnd(
    newGroup.select('circle').transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke)
  )
}

/**
 * 链表反转动画
 * @param {SVGElement} svg - SVG 容器
 * @param {Array} data - 当前链表数据
 */
export async function animateReverse(svg: SVGSVGElement, data: number[], options: LLOptions = {} as LLOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const container = select(svg)
  const { width, height } = options
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const { startX, startY, effectiveRadius, effectiveGap } = layout(data, width, height)
  const r = effectiveRadius
  const nodeSpacing = r * 2 + effectiveGap

  const nodes = container.selectAll('g.linked-node')

  // Step 1: highlight all nodes with scale pulse
  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    await transitionEnd(
      select(nodes.nodes()[i]).select('circle')
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('r', r + 6)
        .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke)
    )
    if (anim?.isAborted?.()) return
  }

  if (anim?.isAborted?.()) return

  // Step 2: move nodes to reversed positions (mirror horizontally)
  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    const targetX = startX + (data.length - 1 - i) * nodeSpacing
    await transitionEnd(
      select(nodes.nodes()[i])
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('transform', `translate(${targetX}, ${startY})`)
    )
    if (anim?.isAborted?.()) return
  }

  if (anim?.isAborted?.()) return

  // Step 3: re-render to fix arrows, HEAD and NULL labels
  const reversed = [...data].reverse()
  renderLinkedList(svg, reversed, { width, height, isDark })
}

/**
 * 环检测动画（快慢指针）
 * @param {SVGElement} svg - SVG 容器
 * @param {Array} steps - 快慢指针的每一步状态 [{ slow, fast }]
 */
export async function animateCycleDetection(svg: SVGSVGElement, steps: { slow: number; fast: number }[], anim?: Animation) {
  const container = select(svg)
  const isDark = detectDarkMode()
  const C = getColors(isDark)

  // Read current radius from existing nodes
  const firstCircle = container.select('g.linked-node circle')
  const baseR = firstCircle.empty() ? NODE_RADIUS : (parseFloat(firstCircle.attr('r')) || NODE_RADIUS)

  for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
    if (anim?.isAborted?.()) return
    const { slow, fast } = steps[stepIdx]

    const nodes = container.selectAll('g.linked-node')

    // Slow pointer: scale pulse with easeOutBack
    if (slow >= 0 && slow < nodes.size()) {
      await transitionEnd(
        select(nodes.nodes()[slow])
          .select('circle')
          .transition().duration(duration(250)).ease(EASING.easeOutBack)
          .attr('r', baseR + 6)
          .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke)
      )
      await transitionEnd(
        select(nodes.nodes()[slow])
          .select('circle')
          .transition().duration(duration(200)).ease(EASING.easeOutCubic)
          .attr('r', baseR)
      )
    }

    if (anim?.isAborted?.()) return

    // Fast pointer: scale pulse with easeOutBack
    if (fast >= 0 && fast < nodes.size()) {
      await transitionEnd(
        select(nodes.nodes()[fast])
          .select('circle')
          .transition().duration(duration(250)).ease(EASING.easeOutBack)
          .attr('r', baseR + 6)
          .attr('fill', gradUrl('node-error')).attr('stroke', C.nodeErrorStroke)
      )
      await transitionEnd(
        select(nodes.nodes()[fast])
          .select('circle')
          .transition().duration(duration(200)).ease(EASING.easeOutCubic)
          .attr('r', baseR)
      )
    }
  }
}
