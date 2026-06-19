import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import { renderStack, animatePush, animatePop, animatePeek } from '../visualizers/stackVisualizer'
import { useStackState } from '../hooks/useStackState'
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
import LearningModeToggle from '../components/LearningModeToggle'
import ContentTier from '../components/ContentTier'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function StackPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, push, pop, peek, clear, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, size } = useStackState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('stack')
  useSharedData({ dataType: 'stack', loadData: ((d: unknown) => loadData(d as any)) as any, validator: Array.isArray })
  usePageTracker('stack')

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
      setShowLearning(true)
      learningMode.goToStep(idx)
    }
  }, [learningMode.steps, learningMode.goToStep])

  const handlePush = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animatePush(svgRef.current, value, data, dimensions, anim)
      push(value)
    } catch (e) {
      handleAnimationError(e, t('stack.push'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, data, dimensions, push, setIsAnimating, getAnimationContext, svgRef, setInputValue])

  const handlePop = useCallback(async (): Promise<void> => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try { if (svgRef.current) await animatePop(svgRef.current, data, dimensions, anim); pop() }
    catch (e) { handleAnimationError(e, t('stack.pop')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, dimensions, pop, setIsAnimating, getAnimationContext, svgRef])

  const handlePeek = useCallback(async (): Promise<void> => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try { if (svgRef.current) await animatePeek(svgRef.current, data, dimensions, anim); peek() }
    catch (e) { handleAnimationError(e, t('stack.peek')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, dimensions, peek, setIsAnimating, getAnimationContext, svgRef])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('stack.title')} subtitle={t('stack.subtitle')}>
        <ExportImport dataType="stack" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="stack" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handlePush} disabled={isAnimating} isBusy={isAnimating}>{'+ ' + t('stack.push')}</OperationButton>
        <OperationButton variant="danger" onClick={handlePop} disabled={isAnimating || data.length === 0} isBusy={isAnimating}>{'- ' + t('stack.pop')}</OperationButton>
        <OperationButton variant="secondary" onClick={handlePeek} disabled={isAnimating || data.length === 0} isBusy={isAnimating} popAnimation>{t('stack.peek')}</OperationButton>
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
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.top' },
          ]} />
        </OperationInfo>
      </OperationBar>
      <ContentTier structureKey="stack" />
      <Visualizer data={data} renderFn={renderStack as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.stackLabel")} overlay={<StatsOverlay stats={[{ label: 'SIZE', value: size }]} />} />
      {data.length === 0 && (
        <EmptyState icon="▥" titleKey="emptyState.emptyStack" descriptionKey="emptyState.emptyStackDesc" onFill={reset} />
      )}
      <LearningModeToggle
        showLearning={showLearning}
        setShowLearning={setShowLearning}
        learningMode={learningMode}
        isAnimating={isAnimating}
      />

      <LogPanel logs={logs} onJumpToStep={handleJumpToStep} />
    </div>
  )
}
