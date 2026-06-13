import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import Timeline from '../components/Timeline'
import { renderStack, animatePush, animatePop, animatePeek } from '../visualizers/stackVisualizer'
import { useStackState } from '../hooks/useStackState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { getValidationError } from '../utils/validate'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import StepExplainer from '../components/StepExplainer'
import { useLearningMode } from '../hooks/useLearningMode'

export default function StackPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, push, pop, peek, clear, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, size } = useStackState()
  const { containerRef, svgRef, dimensions, getAnimationContext } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('stack')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

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

  const timelineHistory = useMemo(() => logs.map(log => ({ type: log.type, description: log.message })), [logs])

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={t('stack.title')} subtitle={t('stack.subtitle')} icon="☰">
        <ExportImport dataType="stack" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          if (Array.isArray(imported)) {
            loadData(imported)
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
      <Visualizer data={data} renderFn={renderStack} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel="栈可视化" />
      {data.length === 0 && (
        <EmptyState icon="☰" titleKey="emptyState.emptyStack" descriptionKey="emptyState.emptyStackDesc" onFill={reset} />
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
