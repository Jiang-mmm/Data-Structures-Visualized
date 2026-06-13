import { select } from '../utils/d3Imports'
import { duration, EASING, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { tStatic } from '../i18n/useI18n'

const BUCKET_HEIGHT = 44
const BUCKET_WIDTH = 52
const ENTRY_RADIUS = 16
const GAP_Y = 48
const BUCKET_GROUP_GAP = 24
const LARGE_DATA_THRESHOLD = 50

interface HashEntry {
  key: number | string
  value: string
}

interface HashVisualizerOptions {
  width?: number
  height?: number
  hashFn: (key: number | string) => number
  isDark?: boolean
}

export function renderHash(svg: SVGSVGElement, data: HashEntry[], options: HashVisualizerOptions = {} as HashVisualizerOptions) {
  const { width, height, hashFn, isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const container = select(svg)
  container.selectAll('*').interrupt()
  container.selectAll('*').remove()
  ensureGradientDefs(svg, isDark)

  if (!data || data.length === 0) {
    container.append('text')
      .attr('x', width / 2).attr('y', height / 2)
      .attr('text-anchor', 'middle').attr('fill', C.textMuted)
      .attr('font-size', '14px').text(tStatic('emptyState.emptyHashShort'))
    return
  }

  const bucketCount = 7
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const entries = data
      .filter((item) => hashFn(item.key) === i)
      .map((e, j) => ({ ...e, colIdx: j }))
    return { index: i, entries }
  })

  const startY = 50
  const groupWidth = BUCKET_WIDTH
  const totalWidth = bucketCount * groupWidth + (bucketCount - 1) * BUCKET_GROUP_GAP
  const offsetX = Math.max(20, (width - totalWidth) / 2)

  if (container.select('defs #hash-arrow').empty()) {
    const defs = container.append('defs')
    defs.append('marker')
      .attr('id', 'hash-arrow').attr('viewBox', '0 0 10 10')
      .attr('refX', 10).attr('refY', 5)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', C.arrowStroke)
  }

  for (let bi = 0; bi < bucketCount; bi++) {
    const bucket = buckets[bi]
    const bx = offsetX + bi * (groupWidth + BUCKET_GROUP_GAP)
    const by = startY

    const bucketGroup = container.append('g')
      .attr('class', `hash-bucket-${bi}`)
      .attr('transform', `translate(${bx}, ${by})`)

    bucketGroup.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', BUCKET_WIDTH).attr('height', BUCKET_HEIGHT)
      .attr('rx', 4)
      .attr('fill', C.bucketBg).attr('stroke', C.bucketStroke).attr('stroke-width', 2)

    bucketGroup.append('text')
      .attr('x', BUCKET_WIDTH / 2).attr('y', BUCKET_HEIGHT / 2 + 1)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', C.bucketText).attr('font-size', '12px').attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(bi)

    if (bucket.entries.length > 0) {
      bucketGroup.append('text')
        .attr('x', BUCKET_WIDTH / 2).attr('y', -8)
        .attr('text-anchor', 'middle')
        .attr('fill', C.countText).attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(`(${bucket.entries.length})`)
    }

    const centerX = bx + BUCKET_WIDTH / 2
    const entryStartY = by + BUCKET_HEIGHT + GAP_Y

    for (let ei = 0; ei < bucket.entries.length; ei++) {
      const entry = bucket.entries[ei]
      const ey = entryStartY + ei * (ENTRY_RADIUS * 2 + 12)

      if (ei === 0) {
        container.append('line')
          .attr('x1', centerX).attr('y1', by + BUCKET_HEIGHT)
          .attr('x2', centerX).attr('y2', ey - ENTRY_RADIUS)
          .attr('stroke', C.arrowStroke).attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4,3')
      }

      if (ei > 0) {
        const prevEy = entryStartY + (ei - 1) * (ENTRY_RADIUS * 2 + 12)
        container.append('line')
          .attr('x1', centerX).attr('y1', prevEy + ENTRY_RADIUS)
          .attr('x2', centerX).attr('y2', ey - ENTRY_RADIUS)
          .attr('stroke', C.arrowStroke).attr('stroke-width', 1.5)
          .attr('marker-end', 'url(#hash-arrow)')
      }

      const entryGroup = container.append('g')
        .attr('class', `hash-entry key-${entry.key}`)
        .attr('transform', `translate(${centerX}, ${ey})`)

      entryGroup.append('circle')
        .attr('r', ENTRY_RADIUS)
        .attr('fill', gradUrl('node-default')).attr('stroke', C.nodeDefaultStroke).attr('stroke-width', 2)

      entryGroup.append('text')
        .attr('dy', '-0.15em').attr('text-anchor', 'middle')
        .attr('fill', C.textWhite).attr('font-size', '10px').attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(entry.key)

      entryGroup.append('text')
        .attr('dy', '1em').attr('text-anchor', 'middle')
        .attr('fill', C.entryValue).attr('font-size', '8px')
        .text(entry.value)
    }
  }
}

export async function animateInsertHash(svg: SVGSVGElement, key: number | string, value: string, options: HashVisualizerOptions = {} as HashVisualizerOptions, anim?: Animation) {
  if (anim?.isAborted?.()) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { hashFn } = options
  const bucketIdx = hashFn(key)

  const bucketGroup = container.select(`.hash-bucket-${bucketIdx}`)
  if (!bucketGroup.empty()) {
    await new Promise<void>((resolve) => {
      bucketGroup.select('rect')
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('fill', C.bucketHighlight).attr('stroke', C.bucketHighlightStroke)
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('fill', C.bucketBg).attr('stroke', C.bucketStroke)
        .on('end interrupt', resolve)
    })
  }
  if (anim?.isAborted?.()) return

  const entryGroup = container.select(`.hash-entry.key-${key}`)
  if (!entryGroup.empty()) {
    const circle = entryGroup.select('circle')
    const texts = entryGroup.selectAll('text')
    circle.attr('r', 0).attr('opacity', 0)
    texts.attr('opacity', 0)

    await new Promise<void>((resolve) => {
      circle
        .transition().duration(duration(300)).ease(EASING.easeOutBack)
        .attr('r', ENTRY_RADIUS + 4)
        .attr('opacity', 1)
        .attr('fill', C.bucketHighlight)
        .transition().duration(duration(250)).ease(EASING.easeOutCubic)
        .attr('r', ENTRY_RADIUS)
        .attr('fill', gradUrl('node-default'))
        .on('end interrupt', resolve)
    })
    texts.transition().duration(duration(200)).ease(EASING.easeOutCubic).attr('opacity', 1)
  }
}

export async function animateSearchHash(svg: SVGSVGElement, key: number | string, found: boolean, data: HashEntry[], options: HashVisualizerOptions = {} as HashVisualizerOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  if (anim?.isAborted?.()) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { hashFn } = options
  const bucketIdx = hashFn(key)

  const bucketGroup = container.select(`.hash-bucket-${bucketIdx}`)
  if (!bucketGroup.empty()) {
    await new Promise<void>((resolve) => {
      bucketGroup.select('rect')
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('fill', found ? C.bucketSuccess : C.bucketError)
        .attr('stroke', found ? C.bucketSuccessStroke : C.bucketErrorStroke)
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('fill', C.bucketBg).attr('stroke', C.bucketStroke)
        .on('end interrupt', resolve)
    })
  }
  if (anim?.isAborted?.()) return

  if (found) {
    const entryGroup = container.select(`.hash-entry.key-${key}`)
    if (!entryGroup.empty()) {
      await new Promise<void>((resolve) => {
        entryGroup.select('circle')
          .transition().duration(duration(300)).ease(EASING.easeOutBack)
          .attr('r', ENTRY_RADIUS + 6)
          .attr('fill', C.nodeActive)
          .attr('stroke', C.nodeActiveStroke)
          .transition().duration(duration(250)).ease(EASING.easeOutCubic)
          .attr('r', ENTRY_RADIUS)
          .attr('fill', C.entryFill)
          .attr('stroke', C.nodeDefaultStroke)
          .on('end interrupt', resolve)
      })
    }
  }
}

export async function animateDeleteHash(svg: SVGSVGElement, key: number | string, data: HashEntry[], options: HashVisualizerOptions = {} as HashVisualizerOptions, anim?: Animation) {
  if (data.length >= LARGE_DATA_THRESHOLD) return
  if (anim?.isAborted?.()) return
  const isDark = detectDarkMode()
  const C = getColors(isDark)
  const container = select(svg)
  const { hashFn } = options
  const bucketIdx = hashFn(key)

  const entryGroup = container.select(`.hash-entry.key-${key}`)
  if (!entryGroup.empty()) {
    await new Promise<void>((resolve) => {
      entryGroup.select('circle')
        .transition().duration(duration(200)).ease(EASING.easeOutCubic)
        .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
        .transition().duration(duration(250)).ease(EASING.easeInCubic)
        .attr('r', 0).attr('opacity', 0)
        .on('end interrupt', resolve)
    })
    entryGroup.selectAll('text')
      .transition().duration(duration(150)).ease(EASING.easeInCubic)
      .attr('opacity', 0)
  }
  if (anim?.isAborted?.()) return

  const bucketGroup = container.select(`.hash-bucket-${bucketIdx}`)
  if (!bucketGroup.empty()) {
    await new Promise<void>((resolve) => {
      bucketGroup.select('rect')
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('fill', C.bucketError).attr('stroke', C.bucketErrorStroke)
        .transition().duration(duration(300)).ease(EASING.easeOutCubic)
        .attr('fill', C.bucketBg).attr('stroke', C.bucketStroke)
        .on('end interrupt', resolve)
    })
  }
}
