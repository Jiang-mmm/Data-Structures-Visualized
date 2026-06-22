import { useMemo, useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationButton } from '../components/OperationBar'
import OperationGroup from '../components/OperationGroup'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import AnimationExportButton from '../components/AnimationExportButton'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import PerformanceIndicator from '../components/PerformanceIndicator'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import ProgressBar from '../components/ProgressBar'
import { renderSortBars, animateCompare, animateSwap, animateSorted } from '../visualizers/sortVisualizer'
import { useSortState } from '../hooks/useSortState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import { useLearningMode } from '../hooks/useLearningMode'
import { learningConfigs } from '../configs/learning'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'
import { getAllSortAlgorithms } from '../algorithms/sorting'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { validateImportData } from '../utils/validate'
import { showToast } from '../components/toastStore'
import { getColors, detectDarkMode } from '../utils/themeColors'
import AlgorithmInfo from '../components/AlgorithmInfo'

const VARIANT_MAP: Record<string, string> = {
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  purple: 'primary',
}

export default function SortPage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const { data, logs, isAnimating, setIsAnimating, stats, progress, randomize, reset, loadData, stop, runAlgorithm, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useSortState(abortAnimation)
  useSharedData({ dataType: 'sort', loadData, validator: Array.isArray })
  usePageTracker('sort')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble')
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
      await runAlgorithm(algorithmKey, animateFns as any, svgRef, dimensions, anim)
    } catch (error) {
      if (error instanceof Error && error.message !== 'Animation aborted') {
        showToast({ type: 'error', message: t('errors.animationError').replace('{action}', '') })
      }
    } finally {
      setIsAnimating(false)
    }
  }

  const algorithms = useMemo(() => Array.from(getAllSortAlgorithms()), [])
  const selectedAlgo = algorithms.find(([key]) => key === selectedAlgorithm)?.[1]

  const handleJumpToStep = useCallback((stepId: string): void => {
    const idx = learningMode.steps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      learningMode.goToStep(idx)
    }
  }, [learningMode])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('sort.title')} subtitle={t('sort.subtitle')}>
        <ExportImport dataType="sort" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid) {
            loadData(result.data ?? [])
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="sort" disabled={isAnimating} />
        <AnimationExportButton
          svgRef={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          disabled={isAnimating || data.length === 0}
        />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
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
              disabled={isAnimating} isBusy={isAnimating}
              disabledReason={t('page.animating')}
              title={`${algo.nameKey ? t(algo.nameKey) : algo.name} | Time: ${algo.timeComplexity} | Space: ${algo.spaceComplexity}`}
            >
              {algo.icon} {algo.nameKey ? t(algo.nameKey) : algo.name}
              <span className="hidden lg:inline ml-1 font-mono text-[10px] opacity-60">{algo.timeComplexity}</span>
            </OperationButton>
          ))}
        <OperationGroup label={t('common.more')}>
          {algorithms
            .filter(([key]) => ['selection', 'insertion', 'counting', 'shell', 'radix', 'bucket', 'comb', 'tim'].includes(key))
            .map(([key, algo]) => (
              <OperationButton
                key={key}
                variant={(VARIANT_MAP[algo.variant] || 'primary') as any}
                onClick={() => handleSort(key)}
                disabled={isAnimating} isBusy={isAnimating}
                disabledReason={t('page.animating')}
                title={`${algo.nameKey ? t(algo.nameKey) : algo.name} | Time: ${algo.timeComplexity} | Space: ${algo.spaceComplexity}`}
              >
                {algo.icon} {algo.nameKey ? t(algo.nameKey) : algo.name}
                <span className="hidden lg:inline ml-1 font-mono text-[10px] opacity-60">{algo.timeComplexity}</span>
              </OperationButton>
            ))}
        </OperationGroup>
        {isAnimating && <OperationButton variant="secondary" onClick={stop}>{t('sort.stop')}</OperationButton>}
        <UndoPreviewButton
          variant="secondary"
          onClick={undo}
          disabled={isAnimating || !canUndo()}
          previewData={getUndoPreview()}
          previewLabel={t('shortcuts.undo')}
        >
          {t('common.undo')}
        </UndoPreviewButton>
        <UndoPreviewButton
          variant="secondary"
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

        <div className="hidden sm:block w-px h-5 bg-ink/20 dark:bg-dark-border/40" />

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
          <span className="stat-item">{t('sort.swap')}: <span className="text-accent-blue font-bold">{stats.swaps}</span></span>
          <span className="stat-item">{t('sort.steps')}: <span className="text-ink-light/80 dark:text-dark-ink-light/80 font-bold">{stats.steps}</span></span>
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

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <div className="absolute top-2 right-2 z-20">
            <PerformanceIndicator visualizerKey="sort" dataLength={data.length} />
          </div>
          <Visualizer data={data} renderFn={renderSortBars as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.sortLabel")} />
          {data.length === 0 && (
            <EmptyState icon="⇅" titleKey="emptyState.emptySort" descriptionKey="emptyState.emptySortDesc" onFill={randomize} />
          )}
          {selectedAlgo && (
            <AlgorithmInfo
              algorithmKey={selectedAlgorithm}
              name={selectedAlgo.nameKey ? t(selectedAlgo.nameKey) : selectedAlgo.name}
              timeComplexity={selectedAlgo.timeComplexity}
              spaceComplexity={selectedAlgo.spaceComplexity}
              isAnimating={isAnimating}
            />
          )}
        </div>
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
          onJumpToStep={handleJumpToStep}
          algorithmKey={selectedAlgorithm}
          quizQuestions={learningConfigs[selectedAlgorithm as keyof typeof learningConfigs]?.quiz}
        />
      </div>
    </div>
  )
}
