import { useRef, useEffect, useMemo, memo } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { select } from '../utils/d3Imports'
import { getColors, detectDarkMode } from '../utils/themeColors'

interface AlgorithmResult {
  comparisons?: number
  swaps?: number
  steps?: number
}

interface PerformanceChartProps {
  results: Record<string, AlgorithmResult>
}

function PerformanceChart({ results }: PerformanceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()
  const { t } = useGlobalSettings()

  const metricColors = useMemo(() => {
    const C = getColors(detectDarkMode())
    return {
      comparisons: C.nodeDefault,
      swaps: C.nodeActive,
      steps: C.nodeLeaf,
    }
  }, [])

  const labels: Record<string, string> = useMemo(() => ({
    comparisons: t('performanceChart.comparisons'),
    swaps: t('performanceChart.swaps'),
    steps: t('performanceChart.steps'),
  }), [t])

  useEffect(() => {
    if (!svgRef.current || !results || Object.keys(results).length === 0) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const margin = { top: 30, right: 20, bottom: 50, left: 60 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const svg = select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const C = getColors(detectDarkMode())

    const algoKeys = Object.keys(results)
    if (algoKeys.length === 0) return

    const metrics = ['comparisons', 'swaps', 'steps']
    const groupWidth = innerW / algoKeys.length
    const barWidth = groupWidth / (metrics.length + 1)

    const maxVal = Math.max(
      ...algoKeys.map(k => Math.max(...metrics.map(m => Number(results[k][m as keyof AlgorithmResult]) || 0)))
    )
    if (maxVal === 0) return

    const yScale = (val: number) => innerH - (val / maxVal) * innerH

    const yTicks = 5
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxVal / yTicks) * i)
      const y = yScale(val)

      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', C.containerStroke)
        .attr('stroke-width', i === 0 ? 1.5 : 0.5)
        .attr('stroke-dasharray', i === 0 ? 'none' : '2,3')

      g.append('text')
        .attr('x', -8).attr('y', y + 4)
        .attr('text-anchor', 'end')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('fill', C.textMuted)
        .text(val)
    }

    algoKeys.forEach((key, i) => {
      const groupX = i * groupWidth
      const algoResult = results[key]

      metrics.forEach((metric, j) => {
        const val = algoResult[metric as keyof AlgorithmResult] || 0
        const barH = (val / maxVal) * innerH
        const x = groupX + (j + 0.5) * barWidth
        const y = innerH - barH

        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', barWidth - 2)
          .attr('height', Math.max(0, barH))
          .attr('rx', 3)
          .attr('fill', metricColors[metric as keyof typeof metricColors])
          .attr('opacity', 0.85)
          .attr('stroke', C.containerStroke)
          .attr('stroke-width', 0.5)

        if (barH > 15) {
          g.append('text')
            .attr('x', x + (barWidth - 2) / 2)
            .attr('y', y - 4)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('font-family', 'monospace')
            .attr('fill', C.textSecondary)
            .text(val)
        }
      })

      // Background stripe for each group
      if (i % 2 === 1) {
        g.append('rect')
          .attr('class', 'bg-stripe')
          .attr('x', groupX)
          .attr('y', 0)
          .attr('width', groupWidth)
          .attr('height', innerH)
          .attr('fill', C.containerStroke)
          .attr('opacity', 0.06)
      }

      const displayName = key.length > 6 ? key.substring(0, 5) + '…' : key
      g.append('text')
        .attr('x', groupX + groupWidth / 2)
        .attr('y', innerH + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('fill', C.textPrimary)
        .text(displayName)
    })

    const legendY = -10
    let legendX = 0
    metrics.forEach((metric) => {
      g.append('rect')
        .attr('x', legendX)
        .attr('y', legendY - 6)
        .attr('width', 8).attr('height', 8)
        .attr('fill', metricColors[metric as keyof typeof metricColors])

      g.append('text')
        .attr('x', legendX + 12)
        .attr('y', legendY)
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('fill', C.textSecondary)
        .text(labels[metric])

      legendX += labels[metric].length * 6 + 30
    })

  }, [results, mode, t, metricColors, labels])

  return (
    <div ref={containerRef} className="w-full h-48 neo-border bg-white dark:bg-slate overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" role="img" aria-label={t('performanceChart.title')} />
    </div>
  )
}

export default memo(PerformanceChart)
