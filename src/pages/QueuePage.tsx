import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import Timeline from '../components/Timeline'
import { renderQueue, animateEnqueue, animateDequeue, animateFront } from '../visualizers/queueVisualizer'
import { useQueueState } from '../hooks/useQueueState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { getValidationError, validateImportData } from '../utils/validate'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import StepExplainer from '../components/StepExplainer'
import { useLearningMode } from '../hooks/useLearningMode'

export default function QueuePage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, enqueue, dequeue, front, clear, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, size } = useQueueState()
  const { containerRef, svgRef, dimensions, getAnimationContext } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('queue')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleEnqueue = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateEnqueue(svgRef.current, value, data, dimensions, anim)
      enqueue(value)
    } catch (e) {
      handleAnimationError(e, t('queue.enqueue'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, setIsAnimating, getAnimationContext, svgRef, data, dimensions, enqueue, setInputValue])

  const handleDequeue = useCallback(async (): Promise<void> => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try { if (svgRef.current) await animateDequeue(svgRef.current, data, dimensions, anim); dequeue() }
    catch (e) { handleAnimationError(e, t('queue.dequeue')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, setIsAnimating, getAnimationContext, svgRef, dimensions, dequeue])

  const handleFront = useCallback(async (): Promise<void> => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try { if (svgRef.current) await animateFront(svgRef.current, data, dimensions, anim); front() }
    catch (e) { handleAnimationError(e, t('queue.peek')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, setIsAnimating, getAnimationContext, svgRef, dimensions, front])

  const timelineHistory = useMemo(() => logs.map(log => ({ type: log.type, description: log.message })), [logs])

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={t('queue.title')} subtitle={t('queue.subtitle')} icon="→">
        <ExportImport dataType="queue" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported, 'queue')
          if (result.valid && result.data) {
            loadData(result.data)
          }
        }} />
        <ShareButton data={data} dataType="queue" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="success" onClick={handleEnqueue} disabled={isAnimating}>{'+ ' + t('queue.enqueue')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDequeue} disabled={isAnimating || data.length === 0}>{'- ' + t('queue.dequeue')}</OperationButton>
        <OperationButton variant="outline" onClick={handleFront} popAnimation>{t('queue.peek')}</OperationButton>
        <OperationButton variant="outline" onClick={clear} disabled={data.length === 0}>{t('common.clear')}</OperationButton>
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
        <OperationInfo><span className="font-mono text-xs text-ink-light">SIZE: {size}</span></OperationInfo>
      </OperationBar>
      <Visualizer data={data} renderFn={renderQueue} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.queueLabel")} />
      {data.length === 0 && (
        <EmptyState icon="→" titleKey="emptyState.emptyQueue" descriptionKey="emptyState.emptyQueueDesc" onFill={reset} />
      )}
      {logs.length > 0 && (
        <Timeline
          history={timelineHistory}
          currentIndex={logs.length - 1}
          onJump={undefined}
          maxHeight="h-24"
        />
      )}
      <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
        <button
          onClick={() => setShowLearning(!showLearning)}
          className={`px-3 py-1.5 text-sm font-bold border-2 transition-all duration-200
            shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            ${showLearning
              ? 'bg-accent-blue text-paper border-accent-blue'
              : 'border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]'
            }`}
        >
          {showLearning ? t('learning.close') : t('learning.open')}
        </button>
      </div>

      {showLearning && (
        <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
          <StepExplainer
            step={learningMode.currentStep}
            currentStepIndex={learningMode.currentStepIndex}
            totalSteps={learningMode.totalSteps}
            progress={learningMode.progress}
            onNext={learningMode.nextStep}
            onPrev={learningMode.prevStep}
            onReset={learningMode.reset}
            isAnimating={isAnimating}
          />
        </div>
      )}

      <LogPanel logs={logs} />
    </div>
  )
}
