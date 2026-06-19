import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderTree, animateInsertNode, animateTraversal, animateLevelOrder, animateSearch, animateDeleteNode, clearTreePositions, type EdgeStyle } from '../visualizers/treeVisualizer'
import { useTreeState } from '../hooks/useTreeState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import OperationGroup from '../components/OperationGroup'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { getValidationError, validateImportData } from '../utils/validate'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { getColors } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import ContentTier from '../components/ContentTier'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function TreePage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insert, preorder, inorder, postorder, levelorder, search, deleteNode, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, nodeCount } = useTreeState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>(() => {
    const stored = localStorage.getItem('ds-tree-edge-style')
    return (stored === 'curved' || stored === 'straight' || stored === 'orthogonal') ? stored as EdgeStyle : 'straight'
  })
  const learningMode = useLearningMode('tree')
  useSharedData({ dataType: 'tree', loadData: ((d: unknown) => loadData(d as any)) as any, validator: Array.isArray })
  usePageTracker('tree')

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
      if (svgRef.current) await animateInsertNode(svgRef.current, value, data, { ...dimensions, edgeStyle }, anim)
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
    try {
      const order = fn()
      if (svgRef.current) await animateTraversal(svgRef.current, order, data, dimensions, anim)
    } catch (e) { handleAnimationError(e, t('tree.preorder')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, dimensions, setIsAnimating, getAnimationContext, svgRef, t])

  const handleLevelOrder = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    const order = levelorder()
    try { if (svgRef.current) await animateLevelOrder(svgRef.current, order, data, dimensions, anim) }
    catch (e) { handleAnimationError(e, t('tree.levelorder')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, data, dimensions, levelorder, setIsAnimating, getAnimationContext, svgRef, t])

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

  const handleReset = useCallback((): void => {
    clearTreePositions()
    reset()
  }, [reset])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('tree.title')} subtitle={t('tree.subtitle')}>
        <ExportImport dataType="tree" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="tree" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={handleReset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating}>{t('tree.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating} isBusy={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={searchValue} onChange={setSearchValue} />
        <OperationButton variant="warning" onClick={handleSearch} disabled={isAnimating} isBusy={isAnimating}>{t('tree.search')}</OperationButton>
        <OperationButton variant="primary" onClick={() => handleTraversal(preorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('tree.preorder')}</OperationButton>
        <OperationButton variant="primary" onClick={() => handleTraversal(inorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('tree.inorder')}</OperationButton>
        {(isAnimating) && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="primary" onClick={() => handleTraversal(postorder)} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('tree.postorder')}</OperationButton>
          <OperationButton variant="primary" onClick={handleLevelOrder} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('tree.levelorder')}</OperationButton>
          <OperationButton
            variant="secondary"
            onClick={() => {
              const next = edgeStyle === 'straight' ? 'curved' : edgeStyle === 'curved' ? 'orthogonal' : 'straight'
              setEdgeStyle(next)
              localStorage.setItem('ds-tree-edge-style', next)
            }}
            disabled={isAnimating} isBusy={isAnimating}
          >
            {edgeStyle === 'straight' ? '⤿ ' : edgeStyle === 'curved' ? '⌇ ' : '⊞ '}{t('tree.edgeStyle')}
          </OperationButton>
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
      <ContentTier structureKey="tree" />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer data={data} renderFn={renderTree as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.treeLabel")} renderOptions={{ edgeStyle }} />
          {data.length === 0 && (
            <EmptyState icon="◆" titleKey="emptyState.emptyTree" descriptionKey="emptyState.emptyTreeDesc" onFill={reset} />
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
