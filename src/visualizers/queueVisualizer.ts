import { select } from '../utils/d3Imports'
import { tStatic } from '../i18n/useI18n'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'

const RECT_WIDTH = 70
const RECT_HEIGHT = 50
const GAP = 10
const BASE_DURATION = 400
const LARGE_DATA_THRESHOLD = 30

interface QueueVisualizerOptions {
  width: number
  height: number
  isDark?: boolean
}

function layout(data: number[], width: number, height: number) {
  const totalWidth = data.length * (RECT_WIDTH + GAP) - GAP
  const startX = (width - totalWidth) / 2
  const startY = (height - RECT_HEIGHT) / 2
  return { startX, startY, totalWidth }
}

export function renderQueue(svg: SVGSVGElement, data: number[], options: QueueVisualizerOptions = { width: 800, height: 400 }) {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!data || data.length === 0) {
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyQueueShort'))
    return
  }

  const { startX, startY } = layout(data, width, height)

  container.append('text')
    .attr('x', startX + RECT_WIDTH / 2).attr('y', startY - 20)
    .attr('text-anchor', 'middle').attr('fill', C.nodeLeaf)
    .attr('font-size', '12px').attr('font-weight', 'bold').text(tStatic('visualizer.queueFront'))

  container.append('text')
    .attr('x', startX + (data.length - 1) * (RECT_WIDTH + GAP) + RECT_WIDTH / 2)
    .attr('y', startY - 20)
    .attr('text-anchor', 'middle').attr('fill', C.nodeActive)
    .attr('font-size', '12px').attr('font-weight', 'bold').text(tStatic('visualizer.queueRear'))

  const groups = container.selectAll('g.queue-item')
    .data(data, (_d: unknown, i: number) => `${data[i]}-${i}`)
    .join('g')
    .attr('class', 'queue-item')
    .attr('transform', (_d: unknown, i: number) => `translate(${startX + i * (RECT_WIDTH + GAP)}, ${startY})`)
    .attr('tabindex', '0')
    .attr('role', 'group')
    .attr('aria-label', (d: number) => `Queue element ${d}`)
    .on('focus', function(this: SVGGElement) {
      if (!this?.querySelector) return
      select(this).select('rect').attr('stroke', C.nodeActive).attr('stroke-width', 3)
    })
    .on('blur', function(this: SVGGElement, _event?: unknown, d?: number) {
      if (!this?.querySelector || d == null) return
      const idx = data.indexOf(d)
      select(this).select('rect').attr('stroke', idx === 0 ? C.nodeLeafStroke : idx === data.length - 1 ? C.nodeActiveStroke : C.nodeDefaultStroke).attr('stroke-width', 2)
    })
    .on('keydown', function(this: SVGGElement, event?: KeyboardEvent) {
      if (!event?.key) return
      const allNodes = Array.from(container.selectAll('.queue-item').nodes())
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

  groups.append('rect')
    .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT).attr('rx', 6)
    .attr('fill', (_d: unknown, i: number) => i === 0 ? gradUrl('node-leaf') : i === data.length - 1 ? gradUrl('node-active') : gradUrl('bar-default'))
    .attr('stroke', (_d: unknown, i: number) => i === 0 ? C.nodeLeafStroke : i === data.length - 1 ? C.nodeActiveStroke : C.nodeDefaultStroke)
    .attr('stroke-width', 2)

  groups.append('text')
    .attr('x', RECT_WIDTH / 2).attr('y', RECT_HEIGHT / 2).attr('dy', '0.35em')
    .attr('text-anchor', 'middle').attr('fill', C.textWhite)
    .attr('font-size', '16px').attr('font-weight', 'bold').text((d: number) => d)
}

export async function animateEnqueue(svg: SVGSVGElement, value: number, data: number[], options: QueueVisualizerOptions = { width: 800, height: 400 }, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { width, height } = options
  const newData = [...data, value]
  const { startX, startY } = layout(newData, width, height)
  const lastX = startX + (newData.length - 1) * (RECT_WIDTH + GAP)

  const newGroup = container.append('g')
    .attr('class', 'queue-item')
    .attr('transform', `translate(${width + 50}, ${startY})`)
    .attr('opacity', 0)

  newGroup.append('rect')
    .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT).attr('rx', 6)
    .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke).attr('stroke-width', 2)

  newGroup.append('text')
    .attr('x', RECT_WIDTH / 2).attr('y', RECT_HEIGHT / 2).attr('dy', '0.35em')
    .attr('text-anchor', 'middle').attr('fill', C.textWhite)
    .attr('font-size', '16px').attr('font-weight', 'bold').text(value)

  await transitionEnd(
    newGroup.transition().duration(duration(BASE_DURATION)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${lastX}, ${startY})`)
      .attr('opacity', 1)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    newGroup.select('rect').transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
  )
}

export async function animateDequeue(svg: SVGSVGElement, data: number[], _options?: QueueVisualizerOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const frontGroup = container.selectAll('g.queue-item').filter((_d: unknown, i: number) => i === 0)

  await transitionEnd(
    frontGroup.select('rect').transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      .attr('width', RECT_WIDTH + 6).attr('height', RECT_HEIGHT + 4)
      .attr('x', -3).attr('y', -2)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    frontGroup.transition().duration(duration(BASE_DURATION)).ease(EASING.easeInCubic)
      .attr('transform', function(this: SVGGElement) {
        const current = select(this).attr('transform') || ''
        const matchY = current.match(/, ([^)]+)\)/)
        return `translate(-100, ${matchY ? matchY[1] : 0})`
      })
      .attr('opacity', 0)
  )
}

export async function animateFront(svg: SVGSVGElement, data: number[], _options?: QueueVisualizerOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  if (!data || data.length === 0) return

  const frontGroup = container.selectAll('g.queue-item').filter((_d: unknown, i: number) => i === 0)
  if (frontGroup.empty()) return

  const frontRect = frontGroup.select('rect')

  await new Promise<void>((resolve) => {
    frontGroup.transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('transform', function(this: SVGGElement) {
        const current = select(this).attr('transform') || ''
        const matchX = current.match(/translate\(([^,]+)/)
        const matchY = current.match(/, ([^)]+)\)/)
        const x = matchX ? parseFloat(matchX[1]) : 0
        const y = matchY ? parseFloat(matchY[1]) : 0
        return `translate(${x - 4}, ${y - 12})`
      })
    frontRect.transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
      .on('end', resolve).on('interrupt', resolve)
  })

  if (anim?.isAborted?.()) return

  await transitionEnd(
    frontRect.transition().duration(duration(120)).ease(EASING.easeOutCubic)
      .attr('width', RECT_WIDTH + 14).attr('height', RECT_HEIGHT + 10)
      .attr('x', -7).attr('y', -5)
      .transition().duration(duration(600)).ease(EASING.easeOutElastic)
      .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT)
      .attr('x', 0).attr('y', 0)
  )

  if (anim?.isAborted?.()) return

  await new Promise<void>((resolve) => {
    frontGroup.transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('transform', function(this: SVGGElement) {
        const current = select(this).attr('transform') || ''
        const matchX = current.match(/translate\(([^,]+)/)
        const matchY = current.match(/, ([^)]+)\)/)
        const x = matchX ? parseFloat(matchX[1]) : 0
        const y = matchY ? parseFloat(matchY[1]) : 0
        return `translate(${x + 4}, ${y + 12})`
      })
    frontRect.transition().duration(duration(250)).ease(EASING.easeOutCubic)
      .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke)
      .on('end', resolve).on('interrupt', resolve)
  })
}
