import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
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
import { getColors } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import StatsOverlay from '../components/StatsOverlay'
import ContentTier from '../components/ContentTier'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function QueuePage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const { data, logs, isAnimating, setIsAnimating, enqueue, dequeue, front, clear, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, size } = useQueueState(abortAnimation)
  const [inputValue, setInputValue] = useState<string>('')
  const learningMode = useLearningMode('queue')
  useSharedData({ dataType: 'queue', loadData, validator: Array.isArray })
  usePageTracker('queue')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleJumpToStep = useCallback((stepId: string): void => {
    const idx = learningMode.steps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      learningMode.goToStep(idx)
    }
  }, [learningMode.steps, learningMode.goToStep])

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
    } catch (error) {
      handleAnimationError(error, t('queue.enqueue'))
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
    catch (error) { handleAnimationError(error, t('queue.dequeue')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, setIsAnimating, getAnimationContext, svgRef, dimensions, dequeue])

  const handleFront = useCallback(async (): Promise<void> => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try { if (svgRef.current) await animateFront(svgRef.current, data, dimensions, anim); front() }
    catch (error) { handleAnimationError(error, t('queue.peek')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, setIsAnimating, getAnimationContext, svgRef, dimensions, front])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('queue.title')} subtitle={t('queue.subtitle')}>
        <ExportImport dataType="queue" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="queue" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleEnqueue} disabled={isAnimating} isBusy={isAnimating}>{'+ ' + t('queue.enqueue')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDequeue} disabled={isAnimating || data.length === 0} isBusy={isAnimating}>{'- ' + t('queue.dequeue')}</OperationButton>
        <OperationButton variant="secondary" onClick={handleFront} disabled={isAnimating || data.length === 0} isBusy={isAnimating} popAnimation>{t('queue.peek')}</OperationButton>
        <OperationButton variant="secondary" onClick={() => { if (window.confirm(t('common.confirmClear'))) clear() }} disabled={data.length === 0}>{t('common.clear')}</OperationButton>
        {isAnimating && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
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
        <OperationInfo>
          <ColorLegend items={[
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeLeaf, labelKey: 'queue.front' },
          ]} />
        </OperationInfo>
      </OperationBar>
      <ContentTier structureKey="queue" />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer data={data} renderFn={renderQueue as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.queueLabel")} overlay={<StatsOverlay stats={[{ label: 'SIZE', value: size }]} />} />
          {data.length === 0 && (
            <EmptyState icon="⇒" titleKey="emptyState.emptyQueue" descriptionKey="emptyState.emptyQueueDesc" onFill={reset} />
          )}
        </div>
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
          onJumpToStep={handleJumpToStep}
        />
      </div>
    </div>
  )
}
