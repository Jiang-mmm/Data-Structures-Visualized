import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, wait, measureRender, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { calculateCenterStart } from '../utils/visualizerLayout'
import { getLargeDataThreshold, isLargeData } from '../utils/performanceConfig'

const RECT_WIDTH = 60
const RECT_HEIGHT = 50
const INDEX_LABEL_HEIGHT = 20
const CONTENT_HEIGHT = RECT_HEIGHT + INDEX_LABEL_HEIGHT
const GAP = 10

/**
 * 生成以单元格中心为原点的 transform 字符串
 * 用于替代修改 width/height/x/y 的高性能缩放动画
 */
function cellTransform(x: number, y: number, scaleX: number, scaleY: number) {
  const cx = RECT_WIDTH / 2
  const cy = RECT_HEIGHT / 2
  return `translate(${x + cx}, ${y + cy}) scale(${scaleX}, ${scaleY}) translate(${-cx}, ${-cy})`
}

export interface ArrayVisualizerOptions {
  width: number
  height: number
  isDark?: boolean
}

function layout(dataLength: number, width: number, height: number) {
  const totalW = dataLength * (RECT_WIDTH + GAP) - GAP
  const startX = calculateCenterStart(totalW, width)
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
  const d3InternalKeys = new Set(['__data__', '__zoom', '__brush', '__transition', '__event', '__on'])
  allNodes.forEach(node => {
    const keys = Object.keys(node)
    keys.forEach(key => {
      if (d3InternalKeys.has(key)) {
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
  return measureRender('renderArray', () => {
    const { width, height, isDark = detectDarkMode() } = options
    const C = getColors(isDark)

    purgeSVG(svg)

    if (!data || data.length === 0) return

    // 大数据场景：简化渲染（跳过阴影、渐变、超量标签）
    const isLarge = isLargeData('array', data.length)
    const skipValueLabels = data.length > 100

    if (!isLarge) {
      ensureGradientDefs(svg, isDark)
    }

    const ns = 'http://www.w3.org/2000/svg'

    // 为数组单元格添加阴影滤镜（大数据场景跳过）
    if (!isLarge) {
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
      // 大数据场景使用纯色填充，跳过渐变与阴影
      if (isLarge) {
        rect.setAttribute('fill', C.nodeDefault)
      } else {
        rect.setAttribute('fill', gradUrl('bar-default'))
        rect.setAttribute('filter', 'url(#array-shadow)')
      }
      rect.setAttribute('stroke', C.nodeDefaultStroke)
      rect.setAttribute('stroke-width', '2')
      g.appendChild(rect)

      // 大数据场景跳过数值标签（>100 个元素时不可读）
      if (!skipValueLabels) {
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
      }

      const textIndex = document.createElementNS(ns, 'text')
      textIndex.setAttribute('x', String(RECT_WIDTH / 2))
      textIndex.setAttribute('y', String(RECT_HEIGHT + 18))
      textIndex.setAttribute('text-anchor', 'middle')
      textIndex.setAttribute('fill', C.textMuted)
      textIndex.setAttribute('font-size', '11px')
      textIndex.setAttribute('font-weight', '600')
      textIndex.setAttribute('font-family', 'var(--font-mono)')
      textIndex.textContent = `[${i}]`
      g.appendChild(textIndex)

      svg.appendChild(g)
    })
  })
}

/**
 * 插入动画 — 生动流畅版
 * 指示器弹入 → 右侧元素逐个高亮让位 → 新元素弹入 → 颜色脉冲恢复
 */
export async function animateInsert(svg: SVGSVGElement, index: number, _value: number, oldData: number[], options: ArrayVisualizerOptions = { width: 800, height: 400 }, anim?: Animation) {
  if (oldData.length > getLargeDataThreshold('array')) return
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
        .transition().duration(duration(250)).ease(EASING.easeOutCubic)
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
  if (_data && _data.length > getLargeDataThreshold('array')) return
  if (anim?.isAborted?.()) return

  const container = select(svg)
  const { width, height, isDark = detectDarkMode() } = options
  const C = getColors(isDark)

  const targetGroup = container.selectAll('g.array-item').filter((_d: unknown, i: number) => i === index)
  if (targetGroup.empty()) return

  // Phase 1: 变红 + 脉冲放大（easeOutBack 过冲效果）
  const deletePulseSX = (RECT_WIDTH + 8) / RECT_WIDTH
  const deletePulseSY = (RECT_HEIGHT + 6) / RECT_HEIGHT
  await transitionEnd(
    targetGroup.select('rect')
      .interrupt()
      .transition().duration(duration(200)).ease(EASING.easeOutBack)
      .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      .attr('transform', cellTransform(0, 0, deletePulseSX, deletePulseSY))
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
        .attr('transform', cellTransform(x, y + RECT_HEIGHT + 20, 0, 0))
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
        .transition().duration(duration(250)).ease(EASING.easeOutCubic)
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
  if (data.length > getLargeDataThreshold('array')) return
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
      const foundPulseSX = (RECT_WIDTH + 10) / RECT_WIDTH
      const foundPulseSY = (RECT_HEIGHT + 8) / RECT_HEIGHT
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(280)).ease(EASING.easeOutBack)
          .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke)
          .attr('transform', cellTransform(0, 0, foundPulseSX, foundPulseSY))
      )
      if (anim?.isAborted?.()) return

      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(350)).ease(EASING.easeOutElastic)
          .attr('transform', cellTransform(0, 0, 1, 1))
      )

      await wait(400, anim)
      break
    }

    // 检查当前元素：缩放脉冲 + 颜色变化
    const checkPulseSX = (RECT_WIDTH + 4) / RECT_WIDTH
    const checkPulseSY = (RECT_HEIGHT + 3) / RECT_HEIGHT
    await transitionEnd(
      sel.select('rect')
        .interrupt()
        .transition().duration(duration(200)).ease(EASING.easeOutBack)
        .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
        .attr('transform', cellTransform(0, 0, checkPulseSX, checkPulseSY))
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
          .attr('transform', cellTransform(0, 0, 1, 1))
      )
      await wait(400, anim)
    } else {
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(180)).ease(EASING.easeOutCubic)
          .attr('fill', C.nodeDefault).attr('stroke', C.nodeDefaultStroke)
          .attr('transform', cellTransform(0, 0, 1, 1))
      )
    }
  }
}

/**
 * 查找全部动画 — 扫描所有元素，高亮全部匹配项
 * 非匹配项：琥珀色脉冲后恢复；匹配项：绿色脉冲并保持高亮
 */
export async function animateSearchAll(svg: SVGSVGElement, indices: number[], data: number[], options: ArrayVisualizerOptions, anim?: Animation) {
  if (data.length > getLargeDataThreshold('array')) return
  if (anim?.isAborted?.()) return

  const container = select(svg)
  const { isDark = detectDarkMode() } = options
  const C = getColors(isDark)
  const groups = container.selectAll('g.array-item')
  const matchSet = new Set(indices)
  const foundPulseSX = (RECT_WIDTH + 8) / RECT_WIDTH
  const foundPulseSY = (RECT_HEIGHT + 6) / RECT_HEIGHT
  const checkPulseSX = (RECT_WIDTH + 4) / RECT_WIDTH
  const checkPulseSY = (RECT_HEIGHT + 3) / RECT_HEIGHT

  for (let i = 0; i < data.length; i++) {
    if (anim?.isAborted?.()) return

    const node = groups.nodes()[i]
    if (!node) continue
    const sel = select(node as SVGGElement)
    const isMatch = matchSet.has(i)

    if (isMatch) {
      // 匹配项：绿色脉冲并保持高亮
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(280)).ease(EASING.easeOutBack)
          .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke)
          .attr('transform', cellTransform(0, 0, foundPulseSX, foundPulseSY))
      )
      if (anim?.isAborted?.()) return
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(300)).ease(EASING.easeOutElastic)
          .attr('transform', cellTransform(0, 0, 1, 1))
      )
    } else {
      // 非匹配项：琥珀色脉冲后恢复
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(200)).ease(EASING.easeOutBack)
          .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
          .attr('transform', cellTransform(0, 0, checkPulseSX, checkPulseSY))
      )
      await wait(60, anim)
      if (anim?.isAborted?.()) return
      await transitionEnd(
        sel.select('rect')
          .interrupt()
          .transition().duration(duration(160)).ease(EASING.easeOutCubic)
          .attr('fill', C.nodeDefault).attr('stroke', C.nodeDefaultStroke)
          .attr('transform', cellTransform(0, 0, 1, 1))
      )
    }
  }

  // 全部未找到：最后一个变红提示
  if (indices.length === 0 && data.length > 0) {
    if (anim?.isAborted?.()) return
    const lastNode = groups.nodes()[data.length - 1]
    if (lastNode) {
      await transitionEnd(
        select(lastNode as SVGGElement).select('rect')
          .interrupt()
          .transition().duration(duration(300)).ease(EASING.easeOutCubic)
          .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
      )
    }
  }

  await wait(500, anim)
}

/**
 * 读取 g.array-item 的 translate x 坐标
 */
function readItemX(node: SVGElement): number {
  const t = node.getAttribute('transform') || ''
  const m = t.match(/translate\(([^,]+)/)
  return m ? parseFloat(m[1]) : 0
}

/**
 * 二分查找动画 — 展示 lo/mid/hi 指针与范围收缩过程
 * 前提：data 必须升序有序（由 hook 层校验）
 */
export async function animateBinarySearch(svg: SVGSVGElement, value: number, data: number[], options: ArrayVisualizerOptions, anim?: Animation) {
  if (data.length > getLargeDataThreshold('array')) return
  if (anim?.isAborted?.()) return
  if (data.length === 0) return

  const container = select(svg)
  const { isDark = detectDarkMode(), width, height } = options
  const C = getColors(isDark)
  const groups = container.selectAll('g.array-item')
  const nodes = groups.nodes() as SVGElement[]

  // 指针标签层（lo / mid / hi）
  const labelLayer = container.append('g').attr('class', 'binary-search-labels')
  // 范围指示线（lo~hi 下方）
  const rangeLayer = container.append('g').attr('class', 'binary-search-range')

  const { startY } = layout(data.length, width, height)
  const labelY = startY - 14
  const rangeY = startY + RECT_HEIGHT + 38

  const foundPulseSX = (RECT_WIDTH + 10) / RECT_WIDTH
  const foundPulseSY = (RECT_HEIGHT + 8) / RECT_HEIGHT
  const checkPulseSX = (RECT_WIDTH + 6) / RECT_WIDTH
  const checkPulseSY = (RECT_HEIGHT + 4) / RECT_HEIGHT

  function updateLabels(lo: number, mid: number, hi: number) {
    labelLayer.selectAll('*').remove()
    rangeLayer.selectAll('*').remove()
    const labels: Array<{ i: number; text: string; color: string }> = []
    if (lo >= 0 && lo < nodes.length) labels.push({ i: lo, text: 'lo', color: C.nodeRoot })
    if (mid >= 0 && mid < nodes.length) labels.push({ i: mid, text: 'mid', color: C.nodeActive })
    if (hi >= 0 && hi < nodes.length) labels.push({ i: hi, text: 'hi', color: C.nodeError })
    labels.forEach(({ i, text, color }) => {
      const x = readItemX(nodes[i]) + RECT_WIDTH / 2
      labelLayer.append('text')
        .attr('transform', `translate(${x}, ${labelY})`)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'var(--font-mono)')
        .text(text)
    })
    // 范围指示线
    if (lo <= hi && lo < nodes.length && hi < nodes.length) {
      const xLo = readItemX(nodes[lo])
      const xHi = readItemX(nodes[hi]) + RECT_WIDTH
      rangeLayer.append('line')
        .attr('x1', xLo).attr('y1', rangeY)
        .attr('x2', xHi).attr('y2', rangeY)
        .attr('stroke', C.nodeActive).attr('stroke-width', 2)
        .attr('opacity', 0.7)
      rangeLayer.append('line')
        .attr('x1', xLo).attr('y1', rangeY - 6)
        .attr('x2', xLo).attr('y2', rangeY + 6)
        .attr('stroke', C.nodeActive).attr('stroke-width', 2)
      rangeLayer.append('line')
        .attr('x1', xHi).attr('y1', rangeY - 6)
        .attr('x2', xHi).attr('y2', rangeY + 6)
        .attr('stroke', C.nodeActive).attr('stroke-width', 2)
    }
  }

  function dimOutside(lo: number, hi: number) {
    nodes.forEach((node, i) => {
      const sel = select(node)
      if (i < lo || i > hi) {
        sel.transition().duration(duration(180)).attr('opacity', 0.3)
      } else {
        sel.transition().duration(duration(180)).attr('opacity', 1)
      }
    })
  }

  function restoreAll() {
    nodes.forEach((node) => {
      select(node).transition().duration(duration(200)).attr('opacity', 1)
    })
  }

  let lo = 0
  let hi = data.length - 1
  let foundIndex = -1

  try {
    while (lo <= hi) {
      if (anim?.isAborted?.()) return
      const mid = (lo + hi) >> 1
      updateLabels(lo, mid, hi)
      dimOutside(lo, hi)
      await wait(120, anim)
      if (anim?.isAborted?.()) return

      const midNode = nodes[mid]
      if (!midNode) break
      const midSel = select(midNode)

      // 高亮 mid 元素（琥珀色脉冲）
      await transitionEnd(
        midSel.select('rect')
          .interrupt()
          .transition().duration(duration(260)).ease(EASING.easeOutBack)
          .attr('fill', C.nodeActive).attr('stroke', C.nodeActiveStroke)
          .attr('transform', cellTransform(0, 0, checkPulseSX, checkPulseSY))
      )
      if (anim?.isAborted?.()) return
      await wait(200, anim)
      if (anim?.isAborted?.()) return

      if (data[mid] === value) {
        // 找到：绿色弹性脉冲
        await transitionEnd(
          midSel.select('rect')
            .interrupt()
            .transition().duration(duration(320)).ease(EASING.easeOutBack)
            .attr('fill', C.nodeLeaf).attr('stroke', C.nodeLeafStroke)
            .attr('transform', cellTransform(0, 0, foundPulseSX, foundPulseSY))
        )
        if (anim?.isAborted?.()) return
        await transitionEnd(
          midSel.select('rect')
            .interrupt()
            .transition().duration(duration(350)).ease(EASING.easeOutElastic)
            .attr('transform', cellTransform(0, 0, 1, 1))
        )
        foundIndex = mid
        break
      } else if (data[mid] < value) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }

      // mid 恢复默认色（保留在范围内但不高亮）
      await transitionEnd(
        midSel.select('rect')
          .interrupt()
          .transition().duration(duration(180)).ease(EASING.easeOutCubic)
          .attr('fill', C.nodeDefault).attr('stroke', C.nodeDefaultStroke)
          .attr('transform', cellTransform(0, 0, 1, 1))
      )
      await wait(100, anim)
    }

    // 未找到：最后检查的元素变红
    if (foundIndex === -1) {
      if (anim?.isAborted?.()) return
      const lastMid = (lo + hi) >> 1
      const safeMid = Math.max(0, Math.min(nodes.length - 1, lastMid))
      const lastNode = nodes[safeMid]
      if (lastNode) {
        await transitionEnd(
          select(lastNode).select('rect')
            .interrupt()
            .transition().duration(duration(300)).ease(EASING.easeOutCubic)
            .attr('fill', C.nodeError).attr('stroke', C.nodeErrorStroke)
        )
      }
    }

    await wait(500, anim)
  } finally {
    // 清理标签与范围指示，恢复所有元素透明度
    labelLayer.remove()
    rangeLayer.remove()
    restoreAll()
  }
}
