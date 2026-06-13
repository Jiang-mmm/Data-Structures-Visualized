import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import Timeline from '../components/Timeline'
import { renderTree, animateInsertNode, animateTraversal, animateLevelOrder, animateSearch, animateDeleteNode, clearTreePositions } from '../visualizers/treeVisualizer'
import { useTreeState } from '../hooks/useTreeState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import OperationGroup from '../components/OperationGroup'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { getValidationError } from '../utils/validate'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import StepExplainer from '../components/StepExplainer'
import { useLearningMode } from '../hooks/useLearningMode'

export default function TreePage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insert, preorder, inorder, postorder, levelorder, search, deleteNode, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, nodeCount } = useTreeState()
  const { containerRef, svgRef, dimensions, getAnimationContext } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('tree')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleInsert = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateInsertNode(svgRef.current, value, data, dimensions, anim)
      insert(value)
    } catch (e) {
      handleAnimationError(e, t('tree.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, data, dimensions, insert, setIsAnimating, getAnimationContext, svgRef, setInputValue])

  const handleTraversal = useCallback(async (fn: () => number[]): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    const order = fn()
    try { if (svgRef.current) await animateTraversal(svgRef.current, order, data, dimensions, anim) }
    catch (e) { handleAnimationError(e, t('tree.preorder')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, dimensions, setIsAnimating, getAnimationContext, svgRef])

  const handleLevelOrder = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    const order = levelorder()
    try { if (svgRef.current) await animateLevelOrder(svgRef.current, order, data, dimensions, anim) }
    catch (e) { handleAnimationError(e, t('tree.levelorder')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, dimensions, levelorder, setIsAnimating, getAnimationContext, svgRef])

  const handleSearch = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(searchValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(searchValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    const { found, path } = search(value)
    try { if (svgRef.current) await animateSearch(svgRef.current, path, found, data, dimensions, anim) }
    catch (e) { handleAnimationError(e, t('tree.search')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, searchValue, data, dimensions, search, setIsAnimating, getAnimationContext, svgRef])

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateDeleteNode(svgRef.current, value, data, { width: dimensions.width, height: dimensions.height }, anim)
      deleteNode(value)
    } catch (e) {
      handleAnimationError(e, t('common.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, data, dimensions, deleteNode, setIsAnimating, getAnimationContext, svgRef, setInputValue])

  const handleReset = useCallback((): void => {
    clearTreePositions()
    reset()
  }, [reset])

  const timelineHistory = useMemo(() => logs.map(log => ({ type: log.type, description: log.message })), [logs])

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={t('tree.title')} subtitle={t('tree.subtitle')} icon="❖">
        <ExportImport dataType="tree" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          if (Array.isArray(imported)) {
            loadData(imported)
          }
        }} />
        <ShareButton data={data} dataType="tree" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={handleReset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="success" onClick={handleInsert} disabled={isAnimating}>{t('tree.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={searchValue} onChange={setSearchValue} />
        <OperationButton variant="teal" onClick={handleSearch} disabled={isAnimating}>{t('tree.search')}</OperationButton>
        <OperationButton variant="primary" onClick={() => handleTraversal(preorder)} disabled={isAnimating} popAnimation>{t('tree.preorder')}</OperationButton>
        <OperationButton variant="purple" onClick={() => handleTraversal(inorder)} disabled={isAnimating} popAnimation>{t('tree.inorder')}</OperationButton>
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="warning" onClick={() => handleTraversal(postorder)} disabled={isAnimating} popAnimation>{t('tree.postorder')}</OperationButton>
          <OperationButton variant="teal" onClick={handleLevelOrder} disabled={isAnimating} popAnimation>{t('tree.levelorder')}</OperationButton>
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
        </OperationGroup>
        <OperationInfo><span className="font-mono text-xs text-ink-light">NODES: {nodeCount}</span></OperationInfo>
      </OperationBar>
      <Visualizer data={data} renderFn={renderTree} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.treeLabel")} />
      {data.length === 0 && (
        <EmptyState icon="❖" titleKey="emptyState.emptyTree" descriptionKey="emptyState.emptyTreeDesc" onFill={reset} />
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
