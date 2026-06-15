import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationButton } from '../components/OperationBar'
import OperationGroup from '../components/OperationGroup'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import ProgressBar from '../components/ProgressBar'
import LearningModeToggle from '../components/LearningModeToggle'
import { renderSortBars, animateCompare, animateSwap, animateSorted } from '../visualizers/sortVisualizer'
import { useSortState } from '../hooks/useSortState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import { useLearningMode } from '../hooks/useLearningMode'
import { getAllSortAlgorithms } from '../algorithms/sorting'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { validateImportData } from '../utils/validate'
import { showToast } from '../components/toastStore'
import { getColors, detectDarkMode } from '../utils/themeColors'

const VARIANT_MAP: Record<string, string> = {
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  purple: 'purple',
}

export default function SortPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, stats, progress, randomize, reset, loadData, stop, runAlgorithm, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useSortState()
  const { containerRef, svgRef, dimensions, getAnimationContext } = useVisualizer()
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode(selectedAlgorithm)

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const animateFns = useMemo(() => ({ animateCompare, animateSwap, animateSorted, renderSortBars }), [])

  const legendItems = useMemo(() => {
    const C = getColors(detectDarkMode())
    return [
      { color: C.sortDefault, labelKey: 'sortLegend.unsorted' },
      { color: C.nodeActive, labelKey: 'sortLegend.comparing' },
      { color: C.nodeVisited, labelKey: 'sortLegend.swapping' },
      { color: C.sortSorted, labelKey: 'sortLegend.sorted' },
    ]
  }, [])

  const handleSort = async (algorithmKey: string): Promise<void> => {
    if (isAnimating) return
    setSelectedAlgorithm(algorithmKey)
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      await runAlgorithm(algorithmKey, animateFns, svgRef, dimensions, anim)
    } catch (e) {
      if (e instanceof Error && e.message !== 'Animation aborted') {
        showToast({ type: 'error', message: t('errors.animationError').replace('{action}', '') })
      }
    } finally {
      setIsAnimating(false)
    }
  }

  const algorithms = useMemo(() => Array.from(getAllSortAlgorithms()), [])

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('sort.title')} subtitle={t('sort.subtitle')} icon="⇚">
        <ExportImport dataType="sort" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="sort" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
        <OperationButton variant="primary" onClick={randomize}>{t('sort.randomize')}</OperationButton>
      </PageHeader>

      <OperationBar>
        {algorithms
          .filter(([key]) => ['bubble', 'quick', 'merge', 'heap'].includes(key))
          .map(([key, algo]) => (
            <OperationButton
              key={key}
              variant={(VARIANT_MAP[algo.variant] || 'primary') as any}
              onClick={() => handleSort(key)}
              disabled={isAnimating}
              title={`${algo.nameKey ? t(algo.nameKey) : algo.name} | Time: ${algo.timeComplexity} | Space: ${algo.spaceComplexity}`}
            >
              {algo.icon} {algo.nameKey ? t(algo.nameKey) : algo.name}
              <span className="hidden lg:inline ml-1 font-mono text-[9px] opacity-60">{algo.timeComplexity}</span>
            </OperationButton>
          ))}
        <OperationGroup label={t('common.more')}>
          {algorithms
            .filter(([key]) => ['selection', 'insertion', 'counting', 'shell'].includes(key))
            .map(([key, algo]) => (
              <OperationButton
                key={key}
                variant={(VARIANT_MAP[algo.variant] || 'primary') as any}
                onClick={() => handleSort(key)}
                disabled={isAnimating}
                title={`${algo.nameKey ? t(algo.nameKey) : algo.name} | Time: ${algo.timeComplexity} | Space: ${algo.spaceComplexity}`}
              >
                {algo.icon} {algo.nameKey ? t(algo.nameKey) : algo.name}
                <span className="hidden lg:inline ml-1 font-mono text-[9px] opacity-60">{algo.timeComplexity}</span>
              </OperationButton>
            ))}
        </OperationGroup>
        {isAnimating && <OperationButton variant="danger" onClick={stop}>{t('sort.stop')}</OperationButton>}
        <UndoPreviewButton
          variant="outline"
          onClick={undo}
          disabled={isAnimating || !canUndo()}
          previewData={getUndoPreview()}
          previewLabel={t('shortcuts.undo')}
        >
          {t('common.undo')}
        </UndoPreviewButton>
        <UndoPreviewButton
          variant="outline"
          onClick={redo}
          disabled={isAnimating || !canRedo()}
          previewData={getRedoPreview()}
          previewLabel={t('shortcuts.redo')}
        >
          {t('common.redo')}
        </UndoPreviewButton>
      </OperationBar>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-ink/5 dark:bg-dark-ink/10 border-b border-ink/10 dark:border-dark-border/30 text-sm stats-bar">
        <SpeedControl />

        <div className="hidden sm:block w-px h-5 bg-ink/20" />

        {isAnimating && (
          <div className="flex-1 min-w-[100px] max-w-48">
            <ProgressBar progress={progress} label={`${progress}%`} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-[10px] sm:text-xs text-ink-light/80 dark:text-dark-ink-light/80">
          {stats.algorithm && (
            <span className="text-ink dark:text-dark-ink font-semibold hidden sm:inline">{stats.algorithm}</span>
          )}
          <span className="stat-item">{t('sort.compare')}: <span className="text-accent-amber font-bold">{stats.comparisons}</span></span>
          <span className="stat-item">{t('sort.swap')}: <span className="text-accent-rose font-bold">{stats.swaps}</span></span>
          <span className="stat-item">{t('sort.steps')}: <span className="text-accent-violet font-bold">{stats.steps}</span></span>
        </div>

        <div className="ml-auto hidden md:flex items-center gap-3">
          <span className="text-ink-light/60 dark:text-dark-ink-light/60 font-mono text-xs">{t('sort.legend')}:</span>
          {legendItems.map(item => (
            <div key={item.labelKey} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border border-black/20 dark:border-white/20"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-ink-light/70 dark:text-dark-ink-light/70 text-xs">{t(item.labelKey)}</span>
            </div>
          ))}
        </div>
      </div>

      <Visualizer data={data} renderFn={renderSortBars} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.sortLabel")} />
      {data.length === 0 && (
        <EmptyState icon="⇚" titleKey="emptyState.emptySort" descriptionKey="emptyState.emptySortDesc" onFill={randomize} />
      )}

      <LearningModeToggle
        showLearning={showLearning}
        setShowLearning={setShowLearning}
        learningMode={learningMode}
        isAnimating={isAnimating}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-ink dark:text-dark-ink">{t('sort.selectAlgorithm')}:</span>
          {algorithms.filter(([key]) => ['bubble', 'quick', 'merge', 'heap'].includes(key)).map(([key, algo]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedAlgorithm(key)
                learningMode.reset()
              }}
              className={`px-2 py-1 text-xs border-2 border-ink dark:border-dark-border transition-colors ${selectedAlgorithm === key
                  ? 'bg-accent-blue text-white border-accent-blue'
                  : 'hover:bg-ink hover:text-white dark:hover:bg-dark-ink dark:hover:text-dark-paper'
                }`}
            >
              {algo.icon} {algo.nameKey ? t(algo.nameKey) : algo.name}
            </button>
          ))}
        </div>
      </LearningModeToggle>

      <LogPanel logs={logs} />
    </div>
  )
}
