import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, getDefaultEasing, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'

const BAR_GAP_RATIO = 0.35
const CORNER_RADIUS = 4

interface SortOptions {
  width: number
  height: number
  isDark?: boolean
}

interface LayoutResult {
  maxVal: number
  barWidth: number
  maxBarHeight: number
  gap: number
  offsetX: number
  n: number
}

function getLayout(data: number[], width: number, height: number): LayoutResult {
  const n = Math.max(data.length, 1)
  const usableWidth = width - 40
  const barWidth = Math.max(14, Math.min(36, usableWidth / (n * (1 + BAR_GAP_RATIO))))
  const gap = barWidth * BAR_GAP_RATIO
  const totalWidth = n * barWidth + (n - 1) * gap
  const offsetX = Math.max(10, (width - totalWidth) / 2)
  const maxVal = Math.max(...data, 1)
  const maxBarHeight = height - 90
  return { maxVal, barWidth, maxBarHeight, gap, offsetX, n }
}

function indexToX(index: number, barWidth: number, gap: number, offsetX: number): number {
  return offsetX + index * (barWidth + gap)
}

export function renderSortBars(svg: SVGSVGElement, data: number[], options: SortOptions = {} as SortOptions): void {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)

  container.selectAll('text.sort-done').remove()

  if (!data || data.length === 0) {
    container.selectAll('g.bar').remove()
    container.selectAll('defs').remove()
    return
  }

  const { barWidth, maxBarHeight, maxVal, gap, offsetX, n } = getLayout(data, width, height)

  ensureGradientDefs(svg, isDark)

  // Add drop shadow filter for bars
  const defs = container.select('defs')
  if (defs.select('#bar-shadow').empty()) {
    const filter = defs.append('filter').attr('id', 'bar-shadow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%')
    filter.append('feDropShadow').attr('dx', 1).attr('dy', 2).attr('stdDeviation', 2).attr('flood-opacity', 0.15)
  }

  if (data.length > 100) {
    renderSortBarsImmediate(svg, data, options, container, { barWidth, maxBarHeight, maxVal, gap, offsetX, n, C })
  } else {
    container.selectAll('g.bar')
      .data(data, (_d: number, i: number) => i)
      .join(
        (enter: any) => {
          const g = enter.append('g')
            .attr('class', 'bar')
            .attr('transform', (_d: number, i: number) => `translate(${indexToX(i, barWidth, gap, offsetX)}, 0)`)

          g.append('rect')
            .attr('x', 0)
            .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight)
            .attr('width', barWidth)
            .attr('height', (d: number) => (d / maxVal) * maxBarHeight)
            .attr('rx', CORNER_RADIUS)
            .attr('fill', gradUrl('bar-default'))
            .attr('stroke', C.sortDefaultStroke)
            .attr('stroke-width', 1.5)
            .attr('filter', 'url(#bar-shadow)')

          g.append('text')
            .attr('class', 'bar-value')
            .attr('x', barWidth / 2)
            .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight - 6)
            .attr('text-anchor', 'middle')
            .attr('fill', C.textSecondary)
            .attr('font-size', barWidth > 20 ? '11px' : '9px')
            .attr('font-weight', '700')
            .text((d: number) => d)

          g.append('text')
            .attr('class', 'bar-index')
            .attr('x', barWidth / 2)
            .attr('y', height - 26)
            .attr('text-anchor', 'middle')
            .attr('fill', C.textMuted)
            .attr('font-size', '9px')
            .text((_d: number, i: number) => i)

          return g
        },
        (update: any) => {
          update.select('rect')
            .transition().duration(duration(200))
            .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight)
            .attr('height', (d: number) => (d / maxVal) * maxBarHeight)
            .attr('fill', gradUrl('bar-default'))
            .attr('stroke', C.sortDefaultStroke)
            .attr('stroke-width', 1.5)

          update.select('text.bar-value')
            .text((d: number) => d)
            .transition().duration(duration(200))
            .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight - 6)
            .attr('fill', C.textSecondary)

          return update.transition().duration(duration(200))
            .attr('transform', (_d: number, i: number) => `translate(${indexToX(i, barWidth, gap, offsetX)}, 0)`)
        },
        (exit: any) => exit.transition().duration(duration(200)).attr('opacity', 0).remove()
      )
  }
}

function renderSortBarsImmediate(svg: SVGSVGElement, data: number[], options: SortOptions, container: ReturnType<typeof select>, layout: LayoutResult & { C: ReturnType<typeof getColors> }): void {
  const { height } = options
  const { barWidth, maxBarHeight, maxVal, gap, offsetX, C } = layout

  container.selectAll('text.sort-done').remove()

  container.selectAll('g.bar')
    .data(data, (_d: number, i: number) => i)
    .join(
      (enter: any) => {
        const g = enter.append('g')
          .attr('class', 'bar')
          .attr('transform', (_d: number, i: number) => `translate(${indexToX(i, barWidth, gap, offsetX)}, 0)`)

        g.append('rect')
          .attr('x', 0)
          .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight)
          .attr('width', barWidth)
          .attr('height', (d: number) => (d / maxVal) * maxBarHeight)
          .attr('rx', CORNER_RADIUS)
          .attr('fill', gradUrl('bar-default'))
          .attr('stroke', C.sortDefaultStroke)
          .attr('stroke-width', 1.5)

        g.append('text')
          .attr('class', 'bar-value')
          .attr('x', barWidth / 2)
          .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight - 6)
          .attr('text-anchor', 'middle')
          .attr('fill', C.textSecondary)
          .attr('font-size', barWidth > 20 ? '11px' : '9px')
          .attr('font-weight', '700')
          .text((d: number) => d)

        g.append('text')
          .attr('class', 'bar-index')
          .attr('x', barWidth / 2)
          .attr('y', height - 26)
          .attr('text-anchor', 'middle')
          .attr('fill', C.textMuted)
          .attr('font-size', '9px')
          .text((_d: number, i: number) => i)

        return g
      },
      (update: any) => {
        update.select('rect')
          .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight)
          .attr('height', (d: number) => (d / maxVal) * maxBarHeight)
          .attr('fill', gradUrl('bar-default'))
          .attr('stroke', C.sortDefaultStroke)
          .attr('stroke-width', 1.5)

        update.select('text.bar-value')
          .text((d: number) => d)
          .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight - 6)
          .attr('fill', C.textSecondary)

        return update
          .attr('transform', (_d: number, i: number) => `translate(${indexToX(i, barWidth, gap, offsetX)}, 0)`)
      },
      (exit: any) => exit.attr('opacity', 0).remove()
    )
}

export async function animateCompare(svg: SVGSVGElement, i: number, j: number, data: number[], options: SortOptions, anim?: Animation): Promise<void> {
  const container = select(svg)
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const defaultEase = getDefaultEasing()
  const bars = container.selectAll('g.bar')
  if (i >= bars.size() || j >= bars.size()) return

  const barI = bars.filter((_d: number, idx: number) => idx === i)
  const barJ = bars.filter((_d: number, idx: number) => idx === j)
  if (barI.empty() || barJ.empty()) return

  const rectsI = barI.select('rect')
  const rectsJ = barJ.select('rect')
  const valueTextsI = barI.select('text.bar-value')
  const valueTextsJ = barJ.select('text.bar-value')

  // Phase 1: Both bars highlight with glow
  await transitionEnd(
    rectsI.transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('bar-compare')).attr('stroke', C.sortCompareStroke)
      .attr('stroke-width', 2.5)
  )
  await transitionEnd(
    rectsJ.transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('bar-compare')).attr('stroke', C.sortCompareStroke)
      .attr('stroke-width', 2.5)
  )

  await transitionEnd(
    valueTextsI.transition().duration(duration(150)).ease(EASING.easeOutBack)
      .attr('font-size', () => {
        const w = rectsI.attr('width')
        return parseFloat(w || '0') > 20 ? '14px' : '11px'
      })
      .attr('fill', C.nodeActive)
  )
  await transitionEnd(
    valueTextsJ.transition().duration(duration(150)).ease(EASING.easeOutBack)
      .attr('font-size', () => {
        const w = rectsJ.attr('width')
        return parseFloat(w || '0') > 20 ? '14px' : '11px'
      })
      .attr('fill', C.nodeActive)
  )

  if (anim?.isAborted?.()) return

  // Phase 2: Settle back
  await transitionEnd(
    rectsI.transition().duration(duration(200)).ease(defaultEase)
      .attr('fill', gradUrl('bar-default')).attr('stroke', C.sortDefaultStroke)
      .attr('stroke-width', 1.5)
  )
  await transitionEnd(
    rectsJ.transition().duration(duration(200)).ease(defaultEase)
      .attr('fill', gradUrl('bar-default')).attr('stroke', C.sortDefaultStroke)
      .attr('stroke-width', 1.5)
  )

  await transitionEnd(
    valueTextsI.transition().duration(duration(150)).ease(defaultEase)
      .attr('fill', C.textSecondary)
      .attr('font-size', () => {
        const w = rectsI.attr('width')
        return parseFloat(w || '0') > 20 ? '11px' : '9px'
      })
  )
  await transitionEnd(
    valueTextsJ.transition().duration(duration(150)).ease(defaultEase)
      .attr('fill', C.textSecondary)
      .attr('font-size', () => {
        const w = rectsJ.attr('width')
        return parseFloat(w || '0') > 20 ? '11px' : '9px'
      })
  )
}

export async function animateSwap(svg: SVGSVGElement, i: number, j: number, data: number[], options: SortOptions = {} as SortOptions, anim?: Animation): Promise<void> {
  const container = select(svg)
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const { barWidth, gap, offsetX } = getLayout(data, width, height)
  const bars = container.selectAll('g.bar')
  if (i >= bars.size() || j >= bars.size()) return

  const barI = bars.filter((_d: number, idx: number) => idx === i)
  const barJ = bars.filter((_d: number, idx: number) => idx === j)
  if (barI.empty() || barJ.empty()) return

  const xI = indexToX(i, barWidth, gap, offsetX)
  const xJ = indexToX(j, barWidth, gap, offsetX)
  const midX = (xI + xJ) / 2
  const arcHeight = Math.abs(j - i) * 16 + 24
  const liftY = -14

  const rectI = barI.select('rect')
  const rectJ = barJ.select('rect')

  await transitionEnd(
    rectI.transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('bar-swap')).attr('stroke', C.sortSwapStroke)
      .attr('stroke-width', 2.5)
  )
  await transitionEnd(
    rectJ.transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('bar-swap')).attr('stroke', C.sortSwapStroke)
      .attr('stroke-width', 2.5)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    barI.transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${xI}, ${liftY})`)
  )
  await transitionEnd(
    barJ.transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${xJ}, ${liftY})`)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    barI.transition().duration(duration(300)).ease(EASING.easeInOut)
      .attr('transform', `translate(${midX}, ${-arcHeight})`)
  )
  await transitionEnd(
    barJ.transition().duration(duration(300)).ease(EASING.easeInOut)
      .attr('transform', `translate(${midX}, ${arcHeight})`)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    barI.transition().duration(duration(400)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${xJ}, 0)`)
  )
  await transitionEnd(
    barJ.transition().duration(duration(400)).ease(EASING.easeOutBack)
      .attr('transform', `translate(${xI}, 0)`)
  )

  if (anim?.isAborted?.()) return

  await transitionEnd(
    rectI.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', gradUrl('bar-default')).attr('stroke', C.sortDefaultStroke)
      .attr('stroke-width', 1.5)
  )
  await transitionEnd(
    rectJ.transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('fill', gradUrl('bar-default')).attr('stroke', C.sortDefaultStroke)
      .attr('stroke-width', 1.5)
  )
}

export async function animateSorted(svg: SVGSVGElement, data: number[], options: SortOptions = {} as SortOptions, anim?: Animation): Promise<void> {
  const container = select(svg)
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const defaultEase = getDefaultEasing()
  const bars = container.selectAll('g.bar')
  const { width, height } = options
  const { barWidth, maxBarHeight, maxVal, gap, offsetX, n } = getLayout(data, width, height)

  // Wave-fill effect: bars light up with staggered delays for a true wave
  const staggerDelay = duration(40)
  const growDur = duration(300)
  const settleDur = duration(250)
  const promises: Promise<void>[] = []

  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return
    const node = bars.nodes()[i]
    if (!node) continue
    const sel = select(node as SVGGElement).select('rect')

    // Phase 1: Grow + color change with elastic bounce (staggered)
    sel.transition().delay(i * staggerDelay).duration(growDur).ease(EASING.easeOutElastic)
      .attr('fill', gradUrl('bar-sorted')).attr('stroke', C.sortSortedStroke)
      .attr('stroke-width', 2.5)
      .attr('height', (d: number) => (d / maxVal) * maxBarHeight + 8)
      .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight - 4)

    // Phase 2: Settle back (staggered)
    const p = transitionEnd(
      sel.transition().delay(i * staggerDelay + growDur).duration(settleDur).ease(defaultEase)
        .attr('height', (d: number) => (d / maxVal) * maxBarHeight)
        .attr('y', (d: number) => height - 45 - (d / maxVal) * maxBarHeight)
        .attr('stroke-width', 1.5)
    )
    promises.push(p)
  }

  await Promise.all(promises)

  if (anim?.isAborted?.()) return

  // SORTED label with fade-in
  const mid = (data.length - 1) / 2
  await transitionEnd(
    container.append('text')
      .attr('class', 'sort-done')
      .attr('x', indexToX(mid, barWidth, gap, offsetX) + barWidth / 2)
      .attr('y', height - 50)
      .attr('text-anchor', 'middle')
      .attr('fill', C.sortSortedStroke)
      .attr('font-size', '16px')
      .attr('font-weight', '800')
      .attr('font-family', "'JetBrains Mono', monospace")
      .attr('opacity', 0)
      .text(tStatic('sortLegend.sorted').toUpperCase())
      .transition().duration(duration(600)).ease(EASING.easeOutBack)
      .attr('opacity', 1)
  )
}

export function highlightSortedPosition(svg: SVGSVGElement, index: number): void {
  const container = select(svg)
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const bars = container.selectAll('g.bar')
  if (index >= bars.size()) return

  const rect = select(bars.nodes()[index] as SVGGElement).select('rect')
  rect.transition().duration(duration(300)).ease(EASING.easeOutBack)
    .attr('fill', gradUrl('bar-sorted')).attr('stroke', C.sortSortedStroke)
    .attr('stroke-width', 3)
    .transition().duration(duration(250)).ease(EASING.easeOutCubic)
    .attr('stroke-width', 1.5)
}
