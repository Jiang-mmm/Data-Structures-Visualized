import { useState, useRef, useCallback, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationButton, OperationInfo } from '../components/OperationBar'
import LogPanel from '../components/LogPanel'
import SpeedControl from '../components/SpeedControl'
import PerformanceChart from '../components/PerformanceChart'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { createAnimation } from '../utils/animationEngine'
import { renderSortBars, animateCompare, animateSwap, animateSorted } from '../visualizers/sortVisualizer'
import { getSortAlgorithm, getAllSortAlgorithms } from '../algorithms/sorting'
import { yieldToMain } from '../utils/timeslicing'
import { showToast } from '../components/toastStore'
import { exportPerformanceCSV, exportPerformanceJSON } from '../utils/dataExport'

const YIELD_INTERVAL = 5
const DEFAULT_ALGOS = ['bubble', 'selection', 'insertion']

interface SortAlgorithm {
  name: string
  nameKey?: string
  timeComplexity: string
  spaceComplexity: string
  icon: string
  color: string
  variant: string
  execute: (...args: any[]) => Promise<any>
}

interface AlgoResult {
  comparisons?: number
  swaps?: number
  steps?: number
  progress?: number
  done?: boolean
  error?: boolean
}

interface Log {
  time: string
  type: string
  message: string
}

interface ComparePanelProps {
  algoKey: string
  algorithm: SortAlgorithm
  data?: number[]
  svgRef: (el: SVGSVGElement | null) => void
  onDimensions?: (key: string, dims: { width: number; height: number }) => void
  result?: AlgoResult
}

function ComparePanel({ algoKey, algorithm, data, svgRef, onDimensions, result }: ComparePanelProps) {
  const { t } = useGlobalSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const localSvgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      onDimensions?.(algoKey, { width: rect.width, height: rect.height })
    }
  }, [algoKey, onDimensions])

  useEffect(() => {
    if (!localSvgRef.current || !data || data.length === 0) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    renderSortBars(localSvgRef.current, data, { width: rect.width, height: rect.height })
  }, [data])

  const setSvgRef = useCallback((el: SVGSVGElement | null) => {
    localSvgRef.current = el
    svgRef(el)
  }, [svgRef])

  return (
    <div className="border-2 border-ink dark:border-dark-border bg-white dark:bg-slate overflow-hidden shadow-button dark:shadow-button-dark">
      <div className="p-2 border-b-2 border-ink dark:border-dark-border bg-paper dark:bg-slate">
        <div className="flex items-center gap-2">
          <span className="text-base">{algorithm.icon}</span>
          <span className="font-bold text-xs text-ink dark:text-dark-ink">{algorithm.nameKey ? t(algorithm.nameKey) : algorithm.name}</span>
          <span className="font-mono text-[10px] text-accent-blue ml-auto">{algorithm.timeComplexity}</span>
          <span className="font-mono text-[10px] text-accent-amber">{algorithm.spaceComplexity}</span>
          {result?.done && !result?.error && <span className="text-accent-emerald text-xs">✓</span>}
          {result?.error && <span className="text-accent-rose text-xs">✗</span>}
        </div>
        <div className="font-mono text-[10px] text-ink-light">
          {result && (
            <>
              {result.comparisons && result.comparisons > 0 && `C: ${result.comparisons}`}
              {result.swaps && result.swaps > 0 && ` · S: ${result.swaps}`}
              {result.progress !== undefined && result.progress < 100 && ` · ${Math.round(result.progress)}%`}
            </>
          )}
        </div>
        {result?.progress !== undefined && result.progress < 100 && (
          <div className="mt-1 h-1 bg-border dark:bg-dark-border overflow-hidden">
            <div
              className="h-full bg-accent-emerald transition-all duration-100"
              style={{ width: `${Math.min(100, result.progress)}%` }}
            />
          </div>
        )}
      </div>
      <div ref={containerRef} className="h-40">
        <svg ref={setSvgRef} className="w-full h-full" role="img" aria-label={algorithm.nameKey ? t(algorithm.nameKey) : algorithm.name} />
      </div>
    </div>
  )
}

export default function SortComparePage() {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5)
  )
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>(DEFAULT_ALGOS)
  const [algoResults, setAlgoResults] = useState<Record<string, AlgoResult>>({})
  const animationRefs = useRef<Record<string, { abort: () => void }>>({})
  const stoppedRef = useRef(false)
  const [logs, setLogs] = useState<Log[]>([])
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const { t } = useGlobalSettings()

  const svgRefs = useRef<Record<string, SVGSVGElement | null>>({})
  const dimensionsMap = useRef<Record<string, { width: number; height: number }>>({})

  const updateDimensions = useCallback((key: string, dims: { width: number; height: number }) => {
    dimensionsMap.current[key] = dims
  }, [])

  useEffect(() => {
    if (!showExportMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  const addLog = useCallback((type: string, message: string) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false })
    setLogs(prev => [...prev, { time, type, message }])
  }, [])

  const handleRandomize = () => {
    if (isRunning) return
    const newData = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5)
    setData(newData)
    setAlgoResults({})
    setLogs([])
    showToast({ type: 'info', message: t('toast.randomized') })
  }

  const handleReset = () => {
    if (isRunning) return
    setAlgoResults({})
    setLogs([])
    showToast({ type: 'info', message: t('toast.reset') })
  }

  const toggleAlgo = (key: string) => {
    if (isRunning) return
    setSelectedAlgos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleRunAll = async () => {
    if (isRunning || selectedAlgos.length === 0) return
    setIsRunning(true)
    stoppedRef.current = false

    setAlgoResults({})
    setLogs([])
    addLog('info', `${t('page.comparing')}: ${selectedAlgos.join(', ')}`)

    const promises = selectedAlgos.map(async (key) => {
      const algorithm = getSortAlgorithm(key)
      if (!algorithm) return

      const arr = [...data]
      const svgRef = svgRefs.current[key]
      const dims = dimensionsMap.current[key] || { width: 300, height: 160 }

      const anim = createAnimation()
      animationRefs.current[key] = anim

      setAlgoResults(prev => ({ ...prev, [key]: { comparisons: 0, swaps: 0, steps: 0, progress: 0 } }))

      const onCompare = (count: number, pct: number) => {
        setAlgoResults(prev => ({
          ...prev,
          [key]: { ...(prev[key] || {}), comparisons: count, progress: pct },
        }))
      }

      const onSwap = (swaps: number, steps: number) => {
        setAlgoResults(prev => ({
          ...prev,
          [key]: { ...(prev[key] || {}), swaps, steps },
        }))
      }

      let lastStep = 0
      const callbacks = {
        onStep: async () => {
          if (lastStep % YIELD_INTERVAL === 0) await yieldToMain()
          lastStep++
        },
        onCompare,
        onSwap,
      }

      const animateFns = {
        animateCompare: (s: SVGSVGElement, i: number, j: number, d: number[], dims2: any, a: any) => animateCompare(s, i, j, d, dims2 || dims, a),
        animateSwap: (s: SVGSVGElement, i: number, j: number, d: number[], dims2: any, a: any) => animateSwap(s, i, j, d, dims2 || dims, a),
        animateSorted: (s: SVGSVGElement, d: number[], dims2: any, a: any) => animateSorted(s, d, dims2 || dims, a),
        renderSortBars: (s: SVGSVGElement, d: number[], dims2: any) => renderSortBars(s, d, dims2 || dims),
      }

      try {
        const result = await algorithm.execute(arr, animateFns as any, { current: svgRef }, dims, anim, callbacks)
        if (result?.aborted) {
          setAlgoResults(prev => ({ ...prev, [key]: { ...(prev[key] || {}), done: true, progress: prev[key]?.progress || 0 } }))
          return
        }
        setAlgoResults(prev => ({
          ...prev,
          [key]: {
            comparisons: result?.comparisons || 0,
            swaps: result?.swaps || 0,
            steps: result?.steps || 0,
            done: true,
            progress: 100,
          },
        }))
      } catch (e) {
        setAlgoResults(prev => ({
          ...prev,
          [key]: { comparisons: 0, swaps: 0, steps: 0, done: true, error: true },
        }))
      } finally {
        delete animationRefs.current[key]
      }
    })

    await Promise.all(promises)

    setIsRunning(false)
    if (!stoppedRef.current) {
      const doneCount = selectedAlgos.length
      addLog('info', `${t('page.compareDone')}: ${doneCount}/${selectedAlgos.length} ${t('page.algorithms')}`)
      showToast({ type: 'success', message: `${t('page.compareDone')}: ${doneCount} ${t('page.algorithms')}` })
    }
  }

  const handleStop = () => {
    stoppedRef.current = true
    setIsRunning(false)
    Object.values(animationRefs.current).forEach(anim => anim?.abort?.())
    addLog('warning', t('errors.compareStopped'))
    showToast({ type: 'warning', message: t('errors.compareStopped') })
  }

  const handleExportCSV = () => {
    const data = Object.entries(algoResults).map(([key, r]) => ({
      algorithm: key, comparisons: r.comparisons || 0, swaps: r.swaps || 0, steps: r.steps || 0
    }))
    exportPerformanceCSV(data)
    setShowExportMenu(false)
  }

  const handleExportJSON = () => {
    const data = Object.entries(algoResults).map(([key, r]) => ({
      algorithm: key, comparisons: r.comparisons || 0, swaps: r.swaps || 0, steps: r.steps || 0
    }))
    exportPerformanceJSON(data)
    setShowExportMenu(false)
  }

  const allAlgorithms = Array.from(getAllSortAlgorithms().entries())
  const allDone = selectedAlgos.length > 0 && selectedAlgos.every(k => algoResults[k]?.done)

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('compare.title')} subtitle={t('compare.subtitle')}>
        <OperationButton variant="outline" onClick={handleReset}>{t('compare.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationButton variant="primary" onClick={handleRunAll} disabled={isRunning || selectedAlgos.length === 0}>
          {t('compare.runAll')}
        </OperationButton>
        <OperationButton variant="outline" onClick={handleStop} disabled={!isRunning}>
          {t('common.stop')}
        </OperationButton>
        <OperationButton variant="outline" onClick={handleRandomize} disabled={isRunning}>
          {t('compare.randomize')}
        </OperationButton>
        {allDone && (
          <div className="relative" ref={exportMenuRef}>
            <OperationButton variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
              {t('compare.exportResults')}
            </OperationButton>
            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate border-2 border-ink dark:border-dark-border shadow-card dark:shadow-card-dark z-10 min-w-[120px]">
                <button
                  className="w-full px-3 py-2 text-left text-sm text-ink dark:text-dark-ink hover:bg-paper-warm dark:hover:bg-slate-light transition-colors"
                  onClick={handleExportCSV}
                >
                  {t('compare.exportCSV')}
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-ink dark:text-dark-ink hover:bg-paper-warm dark:hover:bg-slate-light transition-colors border-t border-border dark:border-dark-border"
                  onClick={handleExportJSON}
                >
                  {t('compare.exportJSON')}
                </button>
              </div>
            )}
          </div>
        )}
        <OperationInfo>
          <span className="font-mono text-xs text-ink-light">
            {allDone ? `✓ ${t('page.done')}` : isRunning ? t('page.running') : `${selectedAlgos.length} ${t('page.selected')}`}
          </span>
        </OperationInfo>
      </OperationBar>

      <div className="flex-1 p-2 overflow-auto bg-paper dark:bg-dark-paper">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
          {allAlgorithms.map(([key, algo]) => {
            const isSelected = selectedAlgos.includes(key)
            const result = algoResults[key]
            return (
              <div
                key={key}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={isRunning ? -1 : 0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAlgo(key) } }}
                className={`
                  p-2 border-2 cursor-pointer transition-all text-center
                  ${isSelected
                    ? 'border-ink dark:border-dark-border bg-white dark:bg-slate'
                    : 'border-border dark:border-dark-border bg-paper-warm dark:bg-slate opacity-50'
                  }
                  ${isRunning ? 'pointer-events-none' : ''}
                `}
                onClick={() => toggleAlgo(key)}
              >
                <span className="text-lg">{algo.icon}</span>
                <div className="font-bold text-[10px] text-ink dark:text-dark-ink mt-0.5">{algo.nameKey ? t(algo.nameKey) : algo.name}</div>
                <div className="font-mono text-[8px] text-ink-light">
                  <span className="text-accent-blue">{algo.timeComplexity}</span>
                  <span className="mx-0.5 opacity-40">|</span>
                  <span className="text-accent-amber">{algo.spaceComplexity}</span>
                </div>
                {result?.done && !result?.error && <div className="text-accent-emerald text-[10px]">✓</div>}
                {result?.error && <div className="text-accent-rose text-[10px]">✗</div>}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedAlgos.map((key) => {
            const algorithm = getSortAlgorithm(key)
            if (!algorithm) return null
            return (
              <ComparePanel
                key={key}
                algoKey={key}
                algorithm={algorithm as any}
                data={data}
                svgRef={(el: SVGSVGElement | null) => { svgRefs.current[key] = el }}
                onDimensions={updateDimensions}
                result={algoResults[key]}
              />
            )
          })}
        </div>

        {allDone && Object.keys(algoResults).length > 0 && (
          <div className="mb-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm text-ink dark:text-dark-ink">
                {t('performanceChart.title')}
              </span>
              <span className="font-mono text-[10px] text-ink-light">
                {selectedAlgos.length} {t('page.algorithms')}
              </span>
            </div>
            <PerformanceChart results={algoResults} />
          </div>
        )}
      </div>

      <LogPanel logs={logs} />
    </div>
  )
}