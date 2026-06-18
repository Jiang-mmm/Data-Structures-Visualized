import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import { renderHeap, animateInsertHeap, animateExtractHeap, animatePeekHeap } from '../visualizers/heapVisualizer'
import { useHeapState } from '../hooks/useHeapState'
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
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function HeapPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insert, extractMax, peek, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, heapSize } = useHeapState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('heapStructure')
  useSharedData({ dataType: 'heap', loadData: ((d: unknown) => loadData(d as any)) as any, validator: Array.isArray })
  usePageTracker('heap')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleInsert = useCallback(async () => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      // 先更新数据，让 Visualizer 重渲染出新增的 .heap-node 节点
      // 再运行动画，确保 animateInsertHeap 能找到正确的新节点（最后一个 .heap-node）
      insert(value)
      // 等待两帧: 第一帧 React commit + Visualizer useEffect 触发 renderFn，第二帧确保 DOM 就绪
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
      if (anim?.isAborted?.()) return
      if (svgRef.current) await animateInsertHeap(svgRef.current, value, data, anim)
    } catch (e) {
      handleAnimationError(e, t('heap.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, data, insert, setIsAnimating, getAnimationContext, svgRef, t])

  const handleExtract = useCallback(async () => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateExtractHeap(svgRef.current, anim)
      extractMax()
    } catch (e) {
      handleAnimationError(e, t('heap.extractMax'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, data.length, extractMax, setIsAnimating, getAnimationContext, svgRef])

  const handlePeek = useCallback(async () => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animatePeekHeap(svgRef.current, anim)
      peek()
    } catch (e) {
      handleAnimationError(e, t('heap.peek'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, data.length, peek, setIsAnimating, getAnimationContext, svgRef])

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('heap.title')} subtitle={t('heap.subtitle')}>
        <ExportImport dataType="heap" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="heap" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('heap.inputPlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating}>{t('heap.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleExtract} disabled={isAnimating || data.length === 0}>{t('heap.extractMax')}</OperationButton>
        <OperationButton variant="outline" onClick={handlePeek} disabled={isAnimating || data.length === 0} popAnimation>{t('heap.peek')}</OperationButton>
        {isAnimating && <OperationButton variant="outline" onClick={handleStop}>{t('common.stop')}</OperationButton>}
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
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
          ]} />
        </OperationInfo>
      </OperationBar>

      <Visualizer data={data} renderFn={renderHeap as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.heapLabel")} overlay={<StatsOverlay stats={[{ label: 'SIZE', value: heapSize }]} />} />
      {data.length === 0 && (
        <EmptyState icon="▲" titleKey="emptyState.emptyHeap" descriptionKey="emptyState.emptyHeapDesc" onFill={reset} />
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