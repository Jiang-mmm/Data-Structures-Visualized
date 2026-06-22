import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderRedBlackTree, animateInsertRedBlackTree, animateSearchRedBlackTree, animateTraversalRedBlackTree } from '../visualizers/redBlackTreeVisualizer'
import { useRedBlackTreeState } from '../hooks/useRedBlackTreeState'
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
import ColorLegend from '../components/ColorLegend'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function RedBlackTreePage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const {
    data, logs, isAnimating, setIsAnimating,
    insert, search, inorder,
    getFlattened, nodeCount,
    reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useRedBlackTreeState(abortAnimation)
  const [inputValue, setInputValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const learningMode = useLearningMode('redBlackTree')
  useSharedData({ dataType: 'redBlackTree', loadData, validator: (d: unknown) => d !== null })
  usePageTracker('redBlackTree')

  // 扁平化数据（仅在 data 变化时重新计算）
  const flattenedData = useMemo(() => getFlattened(), [getFlattened])

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
      // 先执行插入获取路径（通过查找路径模拟）
      const { path } = search(value)
      if (svgRef.current) await animateInsertRedBlackTree(svgRef.current, path, flattenedData, anim)
      insert(value)
    } catch (error) {
      handleAnimationError(error, t('redBlackTree.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, flattenedData, insert, search, setIsAnimating, getAnimationContext, svgRef, setInputValue, t])

  const handleTraversal = useCallback(async (fn: () => number[]): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const order = fn()
      if (svgRef.current) await animateTraversalRedBlackTree(svgRef.current, order, flattenedData, anim)
    } catch (error) { handleAnimationError(error, t('redBlackTree.inorder')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, flattenedData, setIsAnimating, getAnimationContext, svgRef, t])

  const handleSearch = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(searchValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(searchValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    const { found, path } = search(value)
    try {
      if (svgRef.current) await animateSearchRedBlackTree(svgRef.current, path, found ? value : null, flattenedData, anim)
    } catch (error) { handleAnimationError(error, t('redBlackTree.search')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, searchValue, flattenedData, search, setIsAnimating, getAnimationContext, svgRef, t])

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleJumpToStep = useCallback((stepId: string): void => {
    const idx = learningMode.steps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      learningMode.goToStep(idx)
    }
  }, [learningMode])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('redBlackTree.title')} subtitle={t('redBlackTree.subtitle')}>
        <ExportImport dataType="redBlackTree" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          // 红黑树导入：直接加载（数据为 RedBlackNode | null）
          try {
            loadData(imported as any)
            showToast({ type: 'success', message: t('common.confirmClear') })
          } catch {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={data} dataType="redBlackTree" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating}>{t('redBlackTree.insert')}</OperationButton>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={searchValue} onChange={setSearchValue} />
        <OperationButton variant="warning" onClick={handleSearch} disabled={isAnimating} isBusy={isAnimating}>{t('redBlackTree.search')}</OperationButton>
        <OperationButton variant="primary" onClick={() => handleTraversal(inorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('redBlackTree.inorder')}</OperationButton>
        {(isAnimating) && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
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
            { color: '#dc2626', labelKey: 'nodeLegend.redNode' },
            { color: '#1a1a1a', labelKey: 'nodeLegend.blackNode' },
          ]} />
          <span className="font-mono text-xs text-ink-light">NODES: {nodeCount}</span>
        </OperationInfo>
      </OperationBar>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer
            data={flattenedData}
            renderFn={renderRedBlackTree as any}
            svgRef={svgRef}
            dimensions={dimensions}
            containerRef={containerRef}
            isAnimating={isAnimating}
            ariaLabel={t('visualizer.redBlackTreeLabel')}
          />
          {nodeCount === 0 && (
            <EmptyState icon="◑" titleKey="emptyState.emptyRedBlackTree" descriptionKey="emptyState.emptyRedBlackTreeDesc" onFill={reset} />
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
