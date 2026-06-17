import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
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
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function TreePage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insert, preorder, inorder, postorder, levelorder, search, deleteNode, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, nodeCount } = useTreeState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyle>(() => {
    const stored = localStorage.getItem('ds-tree-edge-style')
    return (stored === 'curved' || stored === 'straight' || stored === 'orthogonal') ? stored as EdgeStyle : 'straight'
  })
  const learningMode = useLearningMode('tree')
  useSharedData({ dataType: 'tree', loadData, validator: Array.isArray })
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

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleReset = useCallback((): void => {
    clearTreePositions()
    reset()
  }, [reset])

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
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
        <OperationButton variant="outline" onClick={handleReset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating}>{t('tree.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={searchValue} onChange={setSearchValue} />
        <OperationButton variant="amber" onClick={handleSearch} disabled={isAnimating}>{t('tree.search')}</OperationButton>
        <OperationButton variant="purple" onClick={() => handleTraversal(preorder)} disabled={isAnimating} popAnimation>{t('tree.preorder')}</OperationButton>
        <OperationButton variant="purple" onClick={() => handleTraversal(inorder)} disabled={isAnimating} popAnimation>{t('tree.inorder')}</OperationButton>
        {isAnimating && <OperationButton variant="outline" onClick={handleStop}>{t('common.stop')}</OperationButton>}
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="purple" onClick={() => handleTraversal(postorder)} disabled={isAnimating} popAnimation>{t('tree.postorder')}</OperationButton>
          <OperationButton variant="purple" onClick={handleLevelOrder} disabled={isAnimating} popAnimation>{t('tree.levelorder')}</OperationButton>
          <OperationButton
            variant="outline"
            onClick={() => {
              const next = edgeStyle === 'straight' ? 'curved' : edgeStyle === 'curved' ? 'orthogonal' : 'straight'
              setEdgeStyle(next)
              localStorage.setItem('ds-tree-edge-style', next)
            }}
            disabled={isAnimating}
          >
            {edgeStyle === 'straight' ? '⤿ ' : edgeStyle === 'curved' ? '⌇ ' : '⊞ '}{t('tree.edgeStyle')}
          </OperationButton>
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
        <OperationInfo>
          <ColorLegend items={[
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
            { color: getColors().nodeLeaf, labelKey: 'nodeLegend.leaf' },
          ]} />
          <span className="font-mono text-xs text-ink-light">NODES: {nodeCount}</span>
        </OperationInfo>
      </OperationBar>
      <Visualizer data={data} renderFn={renderTree as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.treeLabel")} renderOptions={{ edgeStyle }} />
      {data.length === 0 && (
        <EmptyState icon="◆" titleKey="emptyState.emptyTree" descriptionKey="emptyState.emptyTreeDesc" onFill={reset} />
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
