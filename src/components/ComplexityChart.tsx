import { memo, useMemo, useRef, useEffect, useState } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface AlgorithmComplexity {
  name: string
  complexity: string
  timeComplexity?: string
  spaceComplexity?: string
  color?: string
  description?: string
}

interface ComplexityChartProps {
  algorithms: AlgorithmComplexity[]
  maxN?: number
  showChart?: boolean
  showTable?: boolean
  showLegend?: boolean
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
  'var(--color-accent-emerald)',
  'var(--color-accent-amber)',
  'var(--color-accent-violet)',
  'var(--color-accent-rose)',
  'var(--color-accent-teal)',
  'var(--color-accent-cyan)',
  'var(--color-accent-pink)',
]

function getColor(algorithms: AlgorithmComplexity[], index: number): string {
  return algorithms[index].color || defaultColors[index % defaultColors.length]
}

function ComplexityChart({
  algorithms,
  maxN = 50,
  showChart = true,
  showTable,
  showLegend = true,
}: ComplexityChartProps) {
  const { t } = useGlobalSettings()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  const hasTableData = algorithms.some((a) => a.timeComplexity || a.spaceComplexity)
  const shouldShowTable = showTable ?? hasTableData
  const hasDescription = algorithms.some((a) => a.description)

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

  const { paths, maxY } = useMemo(() => {
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = Math.max(0, dimensions.width - padding.left - padding.right)
    const chartHeight = Math.max(0, dimensions.height - padding.top - padding.bottom)

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
      return { d, color: getColor(algorithms, i) }
    })

    return { paths, maxY, xScale, yScale }
  }, [algorithms, maxN, dimensions])

  return (
    <div ref={containerRef} className="w-full h-full">
      {algorithms.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-ink-light dark:text-dark-ink-light">
          {t('complexityChart.empty')}
        </div>
      ) : (
        <>
          {showLegend && (
            <div
              className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3"
              role="list"
              aria-label={t('complexityChart.legend')}
            >
              {algorithms.map((algo, i) => (
                <div key={i} className="flex items-center gap-1.5" role="listitem">
                  <span
                    className="inline-block w-3 h-3 border-2 border-ink dark:border-dark-border shrink-0"
                    style={{ backgroundColor: getColor(algorithms, i) }}
                  />
                  <span className="text-[11px] font-mono font-bold text-ink dark:text-dark-ink">
                    {algo.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {shouldShowTable && (
            <div className="border-2 border-ink dark:border-dark-border mb-3 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper">
                    <th className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-r border-paper/20 dark:border-dark-paper/20">
                      {t('complexityChart.algorithm')}
                    </th>
                    <th className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-r border-paper/20 dark:border-dark-paper/20">
                      {t('complexityChart.timeComplexity')}
                    </th>
                    <th className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-r border-paper/20 dark:border-dark-paper/20">
                      {t('complexityChart.spaceComplexity')}
                    </th>
                    {hasDescription && (
                      <th className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider hidden md:table-cell">
                        {t('complexityChart.description')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {algorithms.map((algo, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0
                          ? 'bg-white dark:bg-slate border-t border-ink/15 dark:border-dark-border/30'
                          : 'bg-paper-warm dark:bg-slate-light border-t border-ink/15 dark:border-dark-border/30'
                      }
                    >
                      <td className="px-2.5 py-1.5 border-r border-ink/10 dark:border-dark-border/20">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2.5 h-2.5 border border-ink dark:border-dark-border shrink-0"
                            style={{ backgroundColor: getColor(algorithms, i) }}
                          />
                          <span className="text-xs font-bold text-ink dark:text-dark-ink">
                            {algo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-2.5 py-1.5 border-r border-ink/10 dark:border-dark-border/20">
                        <code className="text-[11px] font-mono font-bold text-ink dark:text-dark-ink">
                          {algo.timeComplexity || algo.complexity}
                        </code>
                      </td>
                      <td className="px-2.5 py-1.5 border-r border-ink/10 dark:border-dark-border/20">
                        <code className="text-[11px] font-mono text-ink-light dark:text-dark-ink-light">
                          {algo.spaceComplexity || '—'}
                        </code>
                      </td>
                      {hasDescription && (
                        <td className="px-2.5 py-1.5 hidden md:table-cell">
                          <span className="text-[11px] text-ink-light dark:text-dark-ink-light">
                            {algo.description || '—'}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showChart && (
            <div className={shouldShowTable ? 'h-40 mt-2' : 'w-full h-full min-h-[200px]'}>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                role="img"
                aria-label={t('performanceChart.title')}
              >
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
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={dimensions.height - 60}
                    stroke="currentColor"
                    className="text-ink/20 dark:text-dark-ink/20"
                  />
                  <line
                    x1="0"
                    y1={dimensions.height - 60}
                    x2={dimensions.width - 70}
                    y2={dimensions.height - 60}
                    stroke="currentColor"
                    className="text-ink/20 dark:text-dark-ink/20"
                  />

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
                    <g
                      key={i}
                      transform={`translate(${(dimensions.width - 70) * 0.7}, ${10 + i * 20})`}
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="15"
                        y2="0"
                        stroke={getColor(algorithms, i)}
                        strokeWidth="2"
                      />
                      <text
                        x="20"
                        y="0"
                        dominantBaseline="middle"
                        className="text-[11px] fill-ink dark:fill-dark-ink"
                      >
                        {algo.name} ({algo.complexity})
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default memo(ComplexityChart)
