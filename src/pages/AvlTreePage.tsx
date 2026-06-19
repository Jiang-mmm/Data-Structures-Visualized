import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderAvlTree, animateInsertPath, animateSearchPath, animateTraversal } from '../visualizers/avlTreeVisualizer'
import { useAvlTreeState } from '../hooks/useAvlTreeState'
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
import { getColors } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import ContentTier from '../components/ContentTier'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function AvlTreePage() {
  const { t } = useGlobalSettings()
  const {
    data, logs, isAnimating, setIsAnimating,
    insert, deleteNode, search,
    preorder, inorder, postorder, levelorder,
    getFlattened, nodeCount,
    reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useAvlTreeState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const learningMode = useLearningMode('avlTree')
  useSharedData({ dataType: 'avlTree', loadData: ((d: unknown) => loadData(d as any)) as any, validator: (d: unknown) => d !== null })
  usePageTracker('avlTree')

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
      if (svgRef.current) await animateInsertPath(svgRef.current, path, flattenedData, anim)
      insert(value)
    } catch (e) {
      handleAnimationError(e, t('avlTree.insert'))
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
      if (svgRef.current) await animateTraversal(svgRef.current, order, flattenedData, anim)
    } catch (e) { handleAnimationError(e, t('avlTree.preorder')) }
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
      if (svgRef.current) await animateSearchPath(svgRef.current, path, found ? value : null, flattenedData, anim)
    } catch (e) { handleAnimationError(e, t('avlTree.search')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, searchValue, flattenedData, search, setIsAnimating, getAnimationContext, svgRef, t])

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      // 先查找路径用于动画
      const { path } = search(value)
      if (svgRef.current) await animateSearchPath(svgRef.current, path, value, flattenedData, anim)
      deleteNode(value)
    } catch (e) {
      handleAnimationError(e, t('common.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, flattenedData, search, deleteNode, setIsAnimating, getAnimationContext, svgRef, setInputValue, t])

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

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('avlTree.title')} subtitle={t('avlTree.subtitle')}>
        <ExportImport dataType="avlTree" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          // AVL 树导入：直接加载（数据为 AvlNode | null）
          try {
            loadData(imported as any)
            showToast({ type: 'success', message: t('common.confirmClear') })
          } catch {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={data} dataType="avlTree" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating}>{t('avlTree.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating} isBusy={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={searchValue} onChange={setSearchValue} />
        <OperationButton variant="warning" onClick={handleSearch} disabled={isAnimating} isBusy={isAnimating}>{t('avlTree.search')}</OperationButton>
        <OperationButton variant="primary" onClick={() => handleTraversal(preorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('avlTree.preorder')}</OperationButton>
        <OperationButton variant="primary" onClick={() => handleTraversal(inorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('avlTree.inorder')}</OperationButton>
        {(isAnimating) && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="primary" onClick={() => handleTraversal(postorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('avlTree.postorder')}</OperationButton>
          <OperationButton variant="primary" onClick={() => handleTraversal(levelorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('avlTree.levelorder')}</OperationButton>
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
        </OperationGroup>
        <OperationInfo>
          <ColorLegend items={[
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
            { color: getColors().nodeLeaf, labelKey: 'nodeLegend.leaf' },
          ]} />
          <span className="font-mono text-xs text-ink-light">NODES: {nodeCount}</span>
        </OperationInfo>
      </OperationBar>
      <ContentTier structureKey="avlTree" />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer
            data={flattenedData}
            renderFn={renderAvlTree as any}
            svgRef={svgRef}
            dimensions={dimensions}
            containerRef={containerRef}
            isAnimating={isAnimating}
            ariaLabel={t('visualizer.avlTreeLabel')}
          />
          {nodeCount === 0 && (
            <EmptyState icon="◆" titleKey="emptyState.emptyAvl" descriptionKey="emptyState.emptyAvlDesc" onFill={reset} />
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
