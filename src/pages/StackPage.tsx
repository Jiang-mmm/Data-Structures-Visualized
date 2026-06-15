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
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'

export default function StackPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, push, pop, peek, clear, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, size } = useStackState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('stack')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

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
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('stack.title')} subtitle={t('stack.subtitle')} icon="☰">
        <ExportImport dataType="stack" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="stack" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="purple" onClick={handlePush} disabled={isAnimating}>{'+ ' + t('stack.push')}</OperationButton>
        <OperationButton variant="danger" onClick={handlePop} disabled={isAnimating || data.length === 0}>{'- ' + t('stack.pop')}</OperationButton>
        <OperationButton variant="outline" onClick={handlePeek} popAnimation>{t('stack.peek')}</OperationButton>
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
        <OperationInfo><span className="font-mono text-xs text-ink-light">SIZE: {size}</span></OperationInfo>
      </OperationBar>
      <Visualizer data={data} renderFn={renderStack} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.stackLabel")} />
      {data.length === 0 && (
        <EmptyState icon="☰" titleKey="emptyState.emptyStack" descriptionKey="emptyState.emptyStackDesc" onFill={reset} />
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
