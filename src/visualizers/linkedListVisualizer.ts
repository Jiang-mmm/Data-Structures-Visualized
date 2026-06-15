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
  const totalWidth = data.length * (NODE_RADIUS * 2 + NODE_GAP) - NODE_GAP
  const startX = (width - totalWidth) / 2 + NODE_RADIUS + 40
  const startY = height / 2
  return { startX, startY, totalWidth }
}

function ensureArrowDef(container: ReturnType<typeof select>, C: ReturnType<typeof getColors>) {
  if (!container.select('#ll-arrow').empty()) {
    container.select('#ll-arrow path').attr('fill', C.arrowStroke)
    return
  }
  container.append('defs').append('marker')
    .attr('id', 'll-arrow').attr('viewBox', '0 0 10 10')
    .attr('refX', 8).attr('refY', 5)
    .attr('markerWidth', 6).attr('markerHeight', 6)
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
  const { startX, startY } = layout(data, width, height)

  // HEAD label with background box
  const headLabelX = startX - NODE_RADIUS - 18
  container.append('rect')
    .attr('x', headLabelX - 24).attr('y', startY - 12)
    .attr('width', 48).attr('height', 24).attr('rx', 4)
    .attr('fill', C.nodeRoot).attr('stroke', C.nodeRootStroke).attr('stroke-width', 1.5)
  container.append('text').attr('x', headLabelX).attr('y', startY + 5)
    .attr('text-anchor', 'middle').attr('fill', C.textWhite).attr('font-size', '11px').attr('font-weight', 'bold')
    .text(tStatic('linkedlist.headLabel'))

  container.append('line')
    .attr('x1', headLabelX + 24 + 4).attr('y1', startY)
    .attr('x2', startX - NODE_RADIUS + 5).attr('y2', startY)
    .attr('stroke', C.arrowStroke).attr('stroke-width', 2).attr('marker-end', 'url(#ll-arrow)')

  data.forEach((value, i) => {
    const x = startX + i * (NODE_RADIUS * 2 + NODE_GAP)
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
    g.append('circle').attr('r', NODE_RADIUS).attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)
    g.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
      .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text(value)

    if (i < data.length - 1) {
      const nx = startX + (i + 1) * (NODE_RADIUS * 2 + NODE_GAP)
      container.append('line')
        .attr('x1', x + NODE_RADIUS + 5).attr('y1', y)
        .attr('x2', nx - NODE_RADIUS - 5).attr('y2', y)
        .attr('stroke', C.arrowStroke).attr('stroke-width', 2).attr('marker-end', 'url(#ll-arrow)')
    }
  })

  const lastX = startX + (data.length - 1) * (NODE_RADIUS * 2 + NODE_GAP)

  // Arrow pointing to NULL
  container.append('line')
    .attr('x1', lastX + NODE_RADIUS + 5).attr('y1', startY)
    .attr('x2', lastX + NODE_RADIUS + 15).attr('y2', startY)
    .attr('stroke', C.arrowStroke).attr('stroke-width', 2).attr('marker-end', 'url(#ll-arrow)')

  container.append('text').attr('x', lastX + NODE_RADIUS + 22).attr('y', startY + 5)
    .attr('fill', C.textSecondary).attr('font-size', '12px').text(tStatic('linkedlist.nullLabel'))
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
  const { startX, startY } = layout(newData, width, height)

  const newGroup = container.append('g')
    .attr('class', 'linked-node')
    .attr('transform', `translate(${startX}, ${startY - 50}) scale(0.3)`)
    .attr('opacity', 0)

  newGroup.append('circle').attr('r', NODE_RADIUS)
    .attr('fill', gradUrl('node-leaf')).attr('stroke', C.nodeLeafStroke).attr('stroke-width', 2)
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text(value)

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
  const { startX, startY } = layout(newData, width, height)
  const lastX = startX + (newData.length - 1) * (NODE_RADIUS * 2 + NODE_GAP)

  const newGroup = container.append('g')
    .attr('class', 'linked-node')
    .attr('transform', `translate(${lastX}, ${startY - 50}) scale(0.3)`)
    .attr('opacity', 0)

  newGroup.append('circle').attr('r', NODE_RADIUS)
    .attr('fill', gradUrl('node-leaf')).attr('stroke', C.nodeLeafStroke).attr('stroke-width', 2)
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text(value)

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
  const { startX, startY } = layout(data, width, height)
  const targetX = startX + index * (NODE_RADIUS * 2 + NODE_GAP)

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
  const nodes = container.selectAll('g.linked-node')

  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    const isTarget = i === index
    const sel = select(nodes.nodes()[i])

    if (isTarget) {
      // Found: two-phase pulse with bigger overshoot
      await transitionEnd(
        sel.select('circle').transition().duration(duration(300)).ease(EASING.easeOutBack)
          .attr('r', NODE_RADIUS + 8)
          .attr('fill', gradUrl('node-leaf')).attr('stroke', C.nodeLeafStroke)
      )
      await transitionEnd(
        sel.select('circle').transition().duration(duration(250)).ease(EASING.easeOutCubic)
          .attr('r', NODE_RADIUS + 2)
      )
    } else {
      // Examining: scale pulse then return
      await transitionEnd(
        sel.select('circle').transition().duration(duration(200)).ease(EASING.easeOutBack)
          .attr('r', NODE_RADIUS + 4)
          .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke)
      )
      await transitionEnd(
        sel.select('circle').transition().duration(duration(200)).ease(EASING.easeOutCubic)
          .attr('r', NODE_RADIUS)
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
  const { startX, startY } = layout(newData, width, height)
  const targetX = startX + index * (NODE_RADIUS * 2 + NODE_GAP)

  const newGroup = container.append('g')
    .attr('class', 'linked-node')
    .attr('transform', `translate(${targetX}, ${startY - 50}) scale(0.3)`)
    .attr('opacity', 0)

  newGroup.append('circle').attr('r', NODE_RADIUS)
    .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke).attr('stroke-width', 2)
  newGroup.append('text').attr('dy', '0.35em').attr('text-anchor', 'middle')
    .attr('fill', C.textWhite).attr('font-size', '14px').attr('font-weight', 'bold').text(value)

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
  const { startX, startY } = layout(data, width, height)

  const nodes = container.selectAll('g.linked-node')

  // Step 1: highlight all nodes with scale pulse
  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    await transitionEnd(
      select(nodes.nodes()[i]).select('circle')
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('r', NODE_RADIUS + 6)
        .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke)
    )
    if (anim?.isAborted?.()) return
  }

  if (anim?.isAborted?.()) return

  // Step 2: move nodes to reversed positions (mirror horizontally)
  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    const targetX = startX + (data.length - 1 - i) * (NODE_RADIUS * 2 + NODE_GAP)
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
          .attr('r', NODE_RADIUS + 6)
          .attr('fill', gradUrl('node-active')).attr('stroke', C.nodeActiveStroke)
      )
      await transitionEnd(
        select(nodes.nodes()[slow])
          .select('circle')
          .transition().duration(duration(200)).ease(EASING.easeOutCubic)
          .attr('r', NODE_RADIUS)
      )
    }

    if (anim?.isAborted?.()) return

    // Fast pointer: scale pulse with easeOutBack
    if (fast >= 0 && fast < nodes.size()) {
      await transitionEnd(
        select(nodes.nodes()[fast])
          .select('circle')
          .transition().duration(duration(250)).ease(EASING.easeOutBack)
          .attr('r', NODE_RADIUS + 6)
          .attr('fill', gradUrl('node-error')).attr('stroke', C.nodeErrorStroke)
      )
      await transitionEnd(
        select(nodes.nodes()[fast])
          .select('circle')
          .transition().duration(duration(200)).ease(EASING.easeOutCubic)
          .attr('r', NODE_RADIUS)
      )
    }
  }
}
