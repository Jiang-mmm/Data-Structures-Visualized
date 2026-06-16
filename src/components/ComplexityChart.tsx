import { memo, useMemo, useRef, useEffect, useState } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface ComplexityChartProps {
  algorithms: Array<{
    name: string
    complexity: string
    color?: string
  }>
  maxN?: number
}

const complexityFunctions: Record<string, (n: number) => number> = {
  'O(1)': () => 1,
  'O(log n)': (n) => Math.log2(n),
  'O(n)': (n) => n,
  'O(n log n)': (n) => n * Math.log2(n),
  'O(n²)': (n) => n * n,
  'O(n^2)': (n) => n * n,
  'O(2^n)': (n) => Math.pow(2, n),
}

const defaultColors = [
  'var(--color-accent-blue)',
  'var(--color-accent-amber)',
  'var(--color-accent-emerald)',
  'var(--color-accent-rose)',
  'var(--color-accent-violet)',
]

function ComplexityChart({ algorithms, maxN = 50 }: ComplexityChartProps) {
  const { t } = useGlobalSettings()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const { paths, maxY, xScale, yScale } = useMemo(() => {
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = dimensions.width - padding.left - padding.right
    const chartHeight = dimensions.height - padding.top - padding.bottom

    let maxY = 0
    const allPoints: Array<Array<{ x: number; y: number }>> = []

    algorithms.forEach((algo) => {
      const fn = complexityFunctions[algo.complexity] || complexityFunctions['O(n)']
      const points: Array<{ x: number; y: number }> = []
      for (let n = 1; n <= maxN; n += 2) {
        const y = fn(n)
        maxY = Math.max(maxY, y)
        points.push({ x: n, y })
      }
      allPoints.push(points)
    })

    maxY = Math.min(maxY, 1000)
    const xScale = (x: number) => (x / maxN) * chartWidth
    const yScale = (y: number) => chartHeight - (Math.min(y, maxY) / maxY) * chartHeight

    const paths = allPoints.map((points, i) => {
      const d = points
        .map((p, j) => `${j === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
        .join(' ')
      return { d, color: algorithms[i].color || defaultColors[i % defaultColors.length] }
    })

    return { paths, maxY, xScale, yScale }
  }, [algorithms, maxN, dimensions])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]">
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} role="img" aria-label={t('performanceChart.title')}>
        <g transform={`translate(50, 20)`}>
          <text
            x={-((dimensions.height - 60) / 2)}
            y={-35}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-[11px] fill-ink-light dark:fill-dark-ink-light font-mono"
          >
            f(n)
          </text>
          <line x1="0" y1="0" x2="0" y2={dimensions.height - 60} stroke="currentColor" className="text-ink/20 dark:text-dark-ink/20" />
          <line x1="0" y1={dimensions.height - 60} x2={dimensions.width - 70} y2={dimensions.height - 60} stroke="currentColor" className="text-ink/20 dark:text-dark-ink/20" />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = (dimensions.height - 60) * (1 - ratio)
            return (
              <text
                key={ratio}
                x="-10"
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-[10px] fill-ink-light dark:fill-dark-ink-light"
              >
                {Math.round(maxY * ratio)}
              </text>
            )
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const x = (dimensions.width - 70) * ratio
            return (
              <text
                key={ratio}
                x={x}
                y={dimensions.height - 45}
                textAnchor="middle"
                className="text-[10px] fill-ink-light dark:fill-dark-ink-light"
              >
                {Math.round(maxN * ratio)}
              </text>
            )
          })}

          <text
            x={(dimensions.width - 70) / 2}
            y={dimensions.height - 25}
            textAnchor="middle"
            className="text-[11px] fill-ink-light dark:fill-dark-ink-light font-mono"
          >
            n
          </text>

          {paths.map((path, i) => (
            <path
              key={i}
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth="2"
            />
          ))}

          {algorithms.map((algo, i) => (
            <g key={i} transform={`translate(${(dimensions.width - 70) * 0.7}, ${10 + i * 20})`}>
              <line x1="0" y1="0" x2="15" y2="0" stroke={algo.color || defaultColors[i % defaultColors.length]} strokeWidth="2" />
              <text x="20" y="0" dominantBaseline="middle" className="text-[11px] fill-ink dark:fill-dark-ink">
                {algo.name} ({algo.complexity})
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

export default memo(ComplexityChart)
