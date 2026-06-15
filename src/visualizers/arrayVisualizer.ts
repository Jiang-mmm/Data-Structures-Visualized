import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, wait, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'

const RECT_WIDTH = 60
const RECT_HEIGHT = 50
const INDEX_LABEL_HEIGHT = 20
const CONTENT_HEIGHT = RECT_HEIGHT + INDEX_LABEL_HEIGHT
const GAP = 10

/** 大数据量阈值，超过此值跳过动画直接更新 */
const LARGE_DATA_THRESHOLD = 50

export interface ArrayVisualizerOptions {
  width: number
  height: number
  isDark?: boolean
}

function layout(dataLength: number, width: number, height: number) {
  const totalW = dataLength * (RECT_WIDTH + GAP) - GAP
  const startX = Math.max(0, (width - totalW) / 2)
  const startY = Math.max(20, Math.floor((height - CONTENT_HEIGHT) / 2))
  return { startX, startY }
}

function posX(startX: number, i: number) {
  return startX + i * (RECT_WIDTH + GAP)
}

/**
 * 彻底清理 SVG：中断所有 D3 过渡 + 移除 D3 内部数据 + 删除所有 DOM 节点
 * 这是防止多次操作后元素下沉的关键
 */
function purgeSVG(svg: SVGSVGElement) {
  const container = select(svg)
  container.selectAll('*').interrupt()
  container.interrupt()

  const allNodes = svg.querySelectorAll('*')
  allNodes.forEach(node => {
    const keys = Object.keys(node)
    keys.forEach(key => {
      if (key.startsWith('__')) {
        delete (node as any)[key]
      }
    })
  })

  while (svg.firstChild) {
    svg.removeChild(svg.firstChild)
  }
}

/**
 * 渲染数组可视化
 * 纯静态渲染，无 D3 数据绑定，确保每次渲染都是全新的干净状态
 */
export function renderArray(svg: SVGSVGElement, data: number[], options: ArrayVisualizerOptions = { width: 800, height: 400 }) {
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)

  purgeSVG(svg)

  if (!data || data.length === 0) return

  ensureGradientDefs(svg, isDark)

  const ns = 'http://www.w3.org/2000/svg'

  // Add drop shadow filter for array cells
  const defs = svg.querySelector('defs')
  if (defs && !defs.querySelector('#array-shadow')) {
    const filter = document.createElementNS(ns, 'filter')
    filter.setAttribute('id', 'array-shadow')
    filter.setAttribute('x', '-20%')
    filter.setAttribute('y', '-20%')
    filter.setAttribute('width', '140%')
    filter.setAttribute('height', '140%')
    const shadow = document.createElementNS(ns, 'feDropShadow')
    shadow.setAttribute('dx', '1')
    shadow.setAttribute('dy', '2')
    shadow.setAttribute('stdDeviation', '2')
    shadow.setAttribute('flood-opacity', '0.15')
    filter.appendChild(shadow)
    defs.appendChild(filter)
  }

  const { startX, startY } = layout(data.length, width, height)

  data.forEach((value, i) => {
    const g = document.createElementNS(ns, 'g')
    g.setAttribute('class', 'array-item')
    g.setAttribute('transform', `translate(${posX(startX, i)}, ${startY})`)
    g.setAttribute('tabindex', '0')
    g.setAttribute('role', 'group')
    g.setAttribute('aria-label', `Array element [${i}]: ${value}`)
    g.addEventListener('focus', () => {
      rect.setAttribute('stroke', C.nodeActive)
      rect.setAttribute('stroke-width', '3')
    })
    g.addEventListener('blur', () => {
      rect.setAttribute('stroke', C.nodeDefaultStroke)
      rect.setAttribute('stroke-width', '2')
    })
    g.addEventListener('keydown', (event) => {
      const allItems = Array.from(svg.querySelectorAll('.array-item'))
      const idx = allItems.indexOf(g)
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        const next = allItems[(idx + 1) % allItems.length] as HTMLElement
        next.focus()
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        const prev = allItems[(idx - 1 + allItems.length) % allItems.length] as HTMLElement
        prev.focus()
      }
    })

    const rect = document.createElementNS(ns, 'rect')
    rect.setAttribute('width', String(RECT_WIDTH))
    rect.setAttribute('height', String(RECT_HEIGHT))
    rect.setAttribute('rx', '8')
    rect.setAttribute('fill', gradUrl('bar-default'))
    rect.setAttribute('stroke', C.nodeDefaultStroke)
    rect.setAttribute('stroke-width', '2')
    rect.setAttribute('filter', 'url(#array-shadow)')
    g.appendChild(rect)

    const textValue = document.createElementNS(ns, 'text')
    textValue.setAttribute('x', String(RECT_WIDTH / 2))
    textValue.setAttribute('y', String(RECT_HEIGHT / 2))
    textValue.setAttribute('dy', '0.35em')
    textValue.setAttribute('text-anchor', 'middle')
    textValue.setAttribute('fill', C.textWhite)
    textValue.setAttribute('font-size', '16px')
    textValue.setAttribute('font-weight', 'bold')
    textValue.textContent = String(value)
    g.appendChild(textValue)

    const textIndex = document.createElementNS(ns, 'text')
    textIndex.setAttribute('x', String(RECT_WIDTH / 2))
    textIndex.setAttribute('y', String(RECT_HEIGHT + 18))
    textIndex.setAttribute('text-anchor', 'middle')
    textIndex.setAttribute('fill', C.textMuted)
    textIndex.setAttribute('font-size', '11px')
    textIndex.setAttribute('font-weight', '600')
    textIndex.setAttribute('font-family', 'monospace')
    textIndex.textContent = `[${i}]`
    g.appendChild(textIndex)

    svg.appendChild(g)
  })
}

/**
 * 插入动画 — 生动流畅版
 * 指示器弹入 → 右侧元素逐个高亮让位 → 新元素弹入 → 颜色脉冲恢复
 */
export async function animateInsert(svg: SVGSVGElement, index: number, _value: number, oldData: number[], options: ArrayVisualizerOptions = { width: 800, height: 400 }, anim?: Animation) {
  if (oldData.length > LARGE_DATA_THRESHOLD) return
  if (anim?.isAborted?.()) return

  const container = select(svg)
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)

  container.selectAll('.insert-indicator').remove()

  const newLength = oldData.length + 1
  const { startX: finalStartX, startY } = layout(newLength, width, height)
  const insertX = posX(finalStartX, index)

  // Phase 1: 插入指示器弹入
  const indicator = container.append('g').attr('class', 'insert-indicator')
  indicator.append('line')
    .attr('x1', insertX + RECT_WIDTH / 2).attr('y1', startY - 40)
    .attr('x2', insertX + RECT_WIDTH / 2).attr('y2', startY - 12)
    .attr('stroke', C.nodeActive).attr('stroke-width', 2.5)
    .attr('stroke-dasharray', '4,3').attr('opacity', 0)
  indicator.append('polygon')
    .attr('points', `${insertX + RECT_WIDTH / 2 - 6},${startY - 18} ${insertX + RECT_WIDTH / 2 + 6},${startY - 18} ${insertX + RECT_WIDTH / 2},${startY - 10}`)
    .attr('fill', C.nodeActive).attr('opacity', 0)

  await transitionEnd(
    indicator.selectAll('*').interrupt()
      .transition().duration(duration(280)).ease(EASING.easeOutBack)
      .attr('opacity', 1)
  )
  if (anim?.isAborted?.()) { indicator.remove(); return }

  // Phase 2: 右侧元素逐个高亮 + 让位（交错动画）
  const rightGroups = container.selectAll('g.array-item')
    .filter((_d: unknown, i: number) => i >= index)
    .nodes()

  for (let gi = 0; gi < rightGroups.length; gi++) {
    if (anim?.isAborted?.()) { indicator.remove(); return }
    const sel = select(rightGroups[gi] as SVGGElement)
    // 高亮
    await transitionEnd(
      sel.select('rect')
        .interrupt()
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('fill', C.nodeRoot).attr('stroke', C.nodeRootStroke)
    )
    // 位置右移
    const giIndex = gi + index
    const newX = posX(finalStartX, giIndex + 1)
    await transitionEnd(
      sel.interrupt()
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('transform', `translate(${newX}, ${startY})`)
    )
    await wait(30, anim)
  }

  // Phase 3: 指示器消失
  await transitionEnd(
    indicator.selectAll('*').interrupt()
      .transition().duration(duration(200)).ease(EASING.easeOutCubic)
      .attr('opacity', 0)
  )
  indicator.remove()
  if (anim?.isAborted?.()) return

  // Phase 4: 所有元素颜色脉冲恢复（两阶段）
  await new Promise<void>((resolve) => {
    let pending = 0
    container.selectAll('g.array-item')
      .each(function () { pending++ })
      .select('rect')
      .interrupt()
      .transition().duration(duration(250)).ease(EASING.easeOutBack)
      .attr('fill', gradUrl('node-root')).attr('stroke', C.nodeRootStroke)
      .on('end', () => { pending--; if (pending <= 0) resolve() })
      .on('interrupt', () => { pending--; if (pending <= 0) resolve() })
    if (pending === 0) resolve()
  })

  await new Promise<void>((resolve) => {
    let pending = 0
    container.selectAll('g.array-item')
      .each(function () { pending++ })
      .select('rect')
      .interrupt()
      .transition().duration(duration(300)).ease(EASING.easeOutCubic)
      .attr('fill', gradUrl('bar-default')).attr('stroke', C.nodeDefaultStroke)
      .attr('stroke-width', 2)
      .on('end', () => { pending--; if (pending <= 0) resolve() })
      .on('interrupt', () => { pending--; if (pending <= 0) resolve() })
    if (pending === 0) resolve()
  })
}

/**
 * 删除动画 — 生动流畅版
 * 目标变红脉冲 → 缩小滑出消失 → 右侧元素逐个合拢
 */
export async function animateDelete(svg: SVGSVGElement, index: number, _data: number[], options: ArrayVisualizerOptions = { width: 800, height: 400 }, anim?: Animation) {
  if (_data && _data.length > LARGE_DATA_THRESHOLD) return
  if (anim?.isAborted?.()) return

  const container = select(svg)
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)

  const targetGroup = container.selectAll('g.array-item').filter((_d: unknown, i: number) => i === index)
  if (targetGroup.empty()) return

  // Phase 1: 变红 + 脉冲放大（easeOutBack 过冲效果）
  await transitionEnd(
    targetGroup.select('rect')
      .interrupt()
      .transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      .attr('width', RECT_WIDTH + 8).attr('height', RECT_HEIGHT + 6)
      .attr('x', -4).attr('y', -3)
  )
  if (anim?.isAborted?.()) return

  // Phase 2: 缩小 + 向下滑出 + 淡出
  const node = targetGroup.node()
  if (node) {
    const t = (node as SVGGElement).getAttribute('transform') || ''
    const m = t.match(/translate\(([^,]+),\s*([^)]+)\)/)
    const x = m ? parseFloat(m[1]) : 0
    const y = m ? parseFloat(m[2]) : 0

    await transitionEnd(
      targetGroup.interrupt()
        .transition().duration(duration(300)).ease(EASING.easeInCubic)
        .attr('transform', `translate(${x + RECT_WIDTH / 2}, ${y + RECT_HEIGHT + 20}) scale(0)`)
        .attr('opacity', 0)
    )
  }
  if (anim?.isAborted?.()) return

  // Phase 3: 右侧元素逐个左移合拢
  const { startX: newStartX, startY } = layout(_data.length - 1, width, height)
  const allGroups = container.selectAll('g.array-item').nodes()
  for (let gi = index + 1; gi < allGroups.length; gi++) {
    if (anim?.isAborted?.()) return
    const newX = posX(newStartX, gi - 1)
    await transitionEnd(
      select(allGroups[gi] as SVGGElement).interrupt()
        .transition().duration(duration(250)).ease(EASING.easeOutBack)
        .attr('transform', `translate(${newX}, ${startY})`)
    )
    await wait(30, anim)
  }

  await wait(100, anim)
}

/**
 * 搜索动画 — 生动流畅版
 * 逐个检查 + 缩放脉冲 + 找到时两阶段高亮
 */
export async function animateSearch(svg: SVGSVGElement, index: number, data: number[], options: ArrayVisualizerOptions, anim?: Animation) {
  if (data.length > LARGE_DATA_THRESHOLD) return
  if (anim?.isAborted?.()) return

  const container = select(svg)
  const { isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const groups = container.selectAll('g.array-item')
  const isFound = index !== -1

  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return

    const node = groups.nodes()[i]
    if (!node) continue
    const sel = select(node as SVGGElement)

    if (i === index) {
      // 找到目标：两阶段脉冲（放大弹跳 → 弹性缩回）
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(280)).ease(EASING.easeOutBack)
          .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke)
          .attr('width', RECT_WIDTH + 10).attr('height', RECT_HEIGHT + 8)
          .attr('x', -5).attr('y', -4)
      )
      if (anim?.isAborted?.()) return

      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(350)).ease(EASING.easeOutElastic)
          .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT)
          .attr('x', 0).attr('y', 0)
      )

      await wait(400, anim)
      break
    }

    // 检查当前元素：缩放脉冲 + 颜色变化
    await transitionEnd(
      sel.select('rect')
        .interrupt()
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
        .attr('width', RECT_WIDTH + 4).attr('height', RECT_HEIGHT + 3)
        .attr('x', -2).attr('y', -1.5)
    )

    await wait(80, anim)
    if (anim?.isAborted?.()) return

    // 恢复
    if (!isFound && i === data.length - 1) {
      // 未找到：最后一个变红
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(300)).ease(EASING.easeOutCubic)
          .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
          .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT)
          .attr('x', 0).attr('y', 0)
      )
      await wait(400, anim)
    } else {
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(180)).ease(EASING.easeOutCubic)
          .attr('fill', C.nodeDefault).attr('stroke', C.nodeDefaultStroke)
          .attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT)
          .attr('x', 0).attr('y', 0)
      )
    }
  }
}
