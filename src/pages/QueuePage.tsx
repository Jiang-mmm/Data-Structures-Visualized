import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
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
import { getColors, detectDarkMode } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function QueuePage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, enqueue, dequeue, front, clear, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, size } = useQueueState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
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

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('queue.title')} subtitle={t('queue.subtitle')} icon="⇒">
        <ExportImport dataType="queue" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="queue" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleEnqueue} disabled={isAnimating}>{'+ ' + t('queue.enqueue')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDequeue} disabled={isAnimating || data.length === 0}>{'- ' + t('queue.dequeue')}</OperationButton>
        <OperationButton variant="outline" onClick={handleFront} popAnimation>{t('queue.peek')}</OperationButton>
        <OperationButton variant="outline" onClick={clear} disabled={data.length === 0}>{t('common.clear')}</OperationButton>
        {isAnimating && <OperationButton variant="danger" onClick={handleStop}>{t('common.stop')}</OperationButton>}
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
        <OperationInfo>
          <ColorLegend items={[
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeLeaf, labelKey: 'queue.front' },
          ]} />
          <span className="font-mono text-xs text-ink-light">SIZE: {size}</span>
        </OperationInfo>
      </OperationBar>
      <Visualizer data={data} renderFn={renderQueue} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.queueLabel")} />
      {data.length === 0 && (
        <EmptyState icon="⇒" titleKey="emptyState.emptyQueue" descriptionKey="emptyState.emptyQueueDesc" onFill={reset} />
      )}
      <LearningModeToggle
        showLearning={showLearning}
        setShowLearning={setShowLearning}
        learningMode={learningMode}
        isAnimating={isAnimating}
      />

      <LogPanel logs={logs} />
    </div>
  )
}
