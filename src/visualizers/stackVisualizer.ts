import { select } from '../utils/d3Imports'
import { tStatic } from '../i18n/useI18n'
import { duration, EASING, transitionEnd, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'

const RECT_WIDTH = 80
const RECT_HEIGHT = 50
const GAP = 8
const BASE_DURATION = 400
const LARGE_DATA_THRESHOLD = 30

interface StackVisualizerOptions {
  width: number
  height: number
  isDark?: boolean
}

function layout(data: number[], width: number, height: number) {
  const totalHeight = data.length * (RECT_HEIGHT + GAP) - GAP
  const startX = (width - RECT_WIDTH) / 2
  const startY = (height - totalHeight) / 2 + totalHeight - RECT_HEIGHT
  return { startX, startY, totalHeight }
}

function drawContainer(container: ReturnType<typeof select>, data: number[], width: number, height: number, C: ReturnType<typeof getColors>) {
  if (data.length === 0) {
    const startX = (width - RECT_WIDTH) / 2
    const startY = height / 2
    container.append('rect')
      .attr('x', startX - 4).attr('y', startY - 100)
      .attr('width', RECT_WIDTH + 8).attr('height', 200).attr('rx', 8)
      .attr('fill', 'none').attr('stroke', C.containerStroke).attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
    return
  }

  const { startX, startY, totalHeight } = layout(data, width, height)
  const topY = startY - (data.length - 1) * (RECT_HEIGHT + GAP)

  container.append('rect')
    .attr('class', 'stack-container')
    .attr('x', startX - 4).attr('y', topY - 4)
    .attr('width', RECT_WIDTH + 8).attr('height', totalHeight + 8).attr('rx', 8)
    .attr('fill', 'none').attr('stroke', C.containerStroke).attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
}

export function renderStack(svg: SVGSVGElement, data: number[], options: StackVisualizerOptions = { width: 800, height: 400 }) {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!data || data.length === 0) {
    drawContainer(container, data || [], width, height, C)
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyStackShort'))
    return
  }

  const { startX, startY } = layout(data, width, height)

  drawContainer(container, data, width, height, C)

  const groups = container.selectAll('g.stack-item')
    .data(data, (_d: unknown, i: number) => `${data[i]}-${i}`)
    .join('g')
    .attr('class', 'stack-item')
    .attr('transform', (_d: unknown, i: number) => `translate(${startX}, ${startY - i * (RECT_HEIGHT + GAP)})`)
    .attr('tabindex', '0')
    .attr('role', 'group')
    .attr('aria-label', (d: number) => `Stack element ${d}`)
    .on('focus', function(this: SVGGElement) {
      if (!this?.querySelector) return
      select(this).select('rect').attr('stroke', C.nodeActive).attr('stroke-width', 3)
    })
    .on('blur', function(this: SVGGElement, _event?: unknown, d?: number) {
      if (!this?.querySelector || d == null) return
      const idx = data.indexOf(d)
      select(this).select('rect').attr('stroke', idx === data.length - 1 ? C.nodeRootStroke : C.nodeDefaultStroke).attr('stroke-width', 2)
    })
    .on('keydown', function(this: SVGGElement, event?: KeyboardEvent) {
      if (!event?.key) return
      const allNodes = Array.from(container.selectAll('.stack-item').nodes())
      const idx = allNodes.indexOf(this)
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault()
        const next = allNodes[(idx + 1) % allNodes.length] as HTMLElement
        next?.focus()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const prev = allNodes[(idx - 1 + allNodes.length) % allNodes.length] as HTMLElement
        prev?.focus()
      }
    })

  groups.append('rect')
    .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT).attr('rx', 6)
    .attr('fill', (_d: unknown, i: number) => i === data.length - 1 ? gradUrl('node-root') : gradUrl('bar-default'))
    .attr('stroke', (_d: unknown, i: number) => i === data.length - 1 ? C.nodeRootStroke : C.nodeDefaultStroke)
    .attr('stroke-width', 2)

  groups.append('text')
    .attr('x', RECT_WIDTH / 2).attr('y', RECT_HEIGHT / 2).attr('dy', '0.35em')
    .attr('text-anchor', 'middle').attr('fill', C.textWhite)
    .attr('font-size', '16px').attr('font-weight', 'bold')
    .text((d: number) => d)

  // Stack Top label with colored badge
  const topLabelY = startY - (data.length - 1) * (RECT_HEIGHT + GAP) + RECT_HEIGHT / 2
  container.append('rect')
    .attr('x', startX + RECT_WIDTH + 12).attr('y', topLabelY - 11)
    .attr('width', 100).attr('height', 22).attr('rx', 4)
    .attr('fill', C.nodeRoot).attr('opacity', 0.25)
  container.append('text')
    .attr('x', startX + RECT_WIDTH + 18)
    .attr('y', topLabelY + 1)
    .attr('dy', '0.35em').attr('fill', C.nodeRootStroke)
    .attr('font-size', '13px').attr('font-weight', 'bold')
    .text('← ' + tStatic('visualizer.stackTop'))

  // Stack Bottom label with colored badge
  const bottomLabelY = startY + RECT_HEIGHT / 2
  container.append('rect')
    .attr('x', startX + RECT_WIDTH + 12).attr('y', bottomLabelY - 11)
    .attr('width', 108).attr('height', 22).attr('rx', 4)
    .attr('fill', C.nodeDefault).attr('opacity', 0.15)
  container.append('text')
    .attr('x', startX + RECT_WIDTH + 18)
    .attr('y', bottomLabelY + 1)
    .attr('dy', '0.35em').attr('fill', C.nodeDefault)
    .attr('font-size', '12px').attr('font-weight', 'bold')
    .text('← ' + tStatic('visualizer.stackBottom'))
}

export async function animatePush(svg: SVGSVGElement, value: number, data: number[], options: StackVisualizerOptions = { width: 800, height: 400 }, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { width, height } = options
  const newData = [...data, value]
  const { startX, startY } = layout(newData, width, height)

  const existingNodes = container.selectAll('g.stack-item').nodes()
  for (let i = 0; i < existingNodes.length; i++) {
    if (anim?.isAborted?.()) return
    const delay = duration(i * 30)
    select(existingNodes[i] as SVGGElement)
      .transition().delay(delay).duration(duration(BASE_DURATION / 2)).ease(EASING.easeOutCubic)
      .attr('transform', `translate(${startX}, ${startY - i * (RECT_HEIGHT + GAP)})`)
  }
  if (existingNodes.length > 0) {
    await new Promise<void>((resolve) => {
      select(existingNodes[existingNodes.length - 1] as SVGGElement)
        .transition().delay(duration((existingNodes.length - 1) * 30))
        .on('end', resolve).on('interrupt', resolve)
    })
  }

  if (anim?.isAborted?.()) return

  const topY = startY - (newData.length - 1) * (RECT_HEIGHT + GAP)
  const newGroup = container.append('g')
    .attr('class', 'stack-item')
    .attr('transform', `translate(${startX}, ${topY - 50})`)
    .attr('opacity', 0)

  newGroup.append('rect')
    .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT).attr('rx', 6)
    .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke).attr('stroke-width', 2)

  newGroup.append('text')
    .attr('x', RECT_WIDTH / 2).attr('y', RECT_HEIGHT / 2).attr('dy', '0.35em')
    .attr('text-anchor', 'middle').attr('fill', C.textWhite)
    .attr('font-size', '16px').attr('font-weight', 'bold').text(value)

  await transitionEnd(
    newGroup.transition().duration(duration(300)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${startX}, ${topY})`)
      .attr('opacity', 1)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    newGroup.select('rect').transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeRoot).attr('stroke', C.nodeRootStroke)
  )
}

export async function animatePop(svg: SVGSVGElement, data: number[], options?: StackVisualizerOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const topIndex = data.length - 1

  const topGroup = container.selectAll('g.stack-item').filter((_d: unknown, i: number) => i === topIndex)

  await transitionEnd(
    topGroup.select('rect').transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    topGroup.transition().duration(duration(300)).ease(EASING.easeInCubic)
      .attr('transform', function(this: SVGGElement) {
        const current = select(this).attr('transform') || ''
        const matchX = current.match(/translate\(([^,]+)/)
        return `translate(${matchX ? matchX[1] : 0}, ${-50}) scale(0.3)`
      })
      .attr('opacity', 0)
  )
}

export async function animatePeek(svg: SVGSVGElement, data: number[], options?: StackVisualizerOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  if (!data || data.length === 0) return

  const topIndex = data.length - 1
  const topGroup = container.selectAll('g.stack-item').filter((_d: unknown, i: number) => i === topIndex)
  if (topGroup.empty()) return

  const topRect = topGroup.select('rect')

  await new Promise<void>((resolve) => {
    topGroup.transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('transform', function(this: SVGGElement) {
        const current = select(this).attr('transform') || ''
        const matchX = current.match(/translate\(([^,]+)/)
        const matchY = current.match(/, ([^)]+)\)/)
        const x = matchX ? parseFloat(matchX[1]) : 0
        const y = matchY ? parseFloat(matchY[1]) : 0
        return `translate(${x - 8}, ${y - 12})`
      })
    topRect.transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
      .on('end', resolve).on('interrupt', resolve)
  })

  if (anim?.isAborted?.()) return

  await transitionEnd(
    topRect.transition().duration(duration(120)).ease(EASING.easeOutCubic)
      .attr('width', RECT_WIDTH + 12).attr('height', RECT_HEIGHT + 8)
      .attr('x', -6).attr('y', -4)
      .transition().duration(duration(600)).ease(EASING.easeOutElastic)
      .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT)
      .attr('x', 0).attr('y', 0)
  )

  if (anim?.isAborted?.()) return

  await new Promise<void>((resolve) => {
    topGroup.transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('transform', function(this: SVGGElement) {
        const current = select(this).attr('transform') || ''
        const matchX = current.match(/translate\(([^,]+)/)
        const matchY = current.match(/, ([^)]+)\)/)
        const x = matchX ? parseFloat(matchX[1]) : 0
        const y = matchY ? parseFloat(matchY[1]) : 0
        return `translate(${x + 8}, ${y + 12})`
      })
    topRect.transition().duration(duration(250)).ease(EASING.easeOutCubic)
      .attr('fill', C.nodeRoot).attr('stroke', C.nodeRootStroke)
      .on('end', resolve).on('interrupt', resolve)
  })
}
