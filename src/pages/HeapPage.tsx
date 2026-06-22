import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
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
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function HeapPage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const { data, logs, isAnimating, setIsAnimating, insert, extractMax, peek, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, heapSize } = useHeapState(abortAnimation)
  const [inputValue, setInputValue] = useState<string>('')
  const learningMode = useLearningMode('heapStructure')
  useSharedData({ dataType: 'heap', loadData, validator: Array.isArray })
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

  const handleJumpToStep = useCallback((stepId: string): void => {
    const idx = learningMode.steps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      learningMode.goToStep(idx)
    }
  }, [learningMode])

  const handleInsert = useCallback(async () => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)
    setInputValue('')

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
    } catch (error) {
      handleAnimationError(error, t('heap.insert'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, inputValue, data, insert, setIsAnimating, getAnimationContext, svgRef, t])

  const handleExtract = useCallback(async () => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateExtractHeap(svgRef.current, anim)
      extractMax()
    } catch (error) {
      handleAnimationError(error, t('heap.extractMax'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, data.length, extractMax, setIsAnimating, getAnimationContext, svgRef, t])

  const handlePeek = useCallback(async () => {
    if (isAnimating || data.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animatePeekHeap(svgRef.current, anim)
      peek()
    } catch (error) {
      handleAnimationError(error, t('heap.peek'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, data.length, peek, setIsAnimating, getAnimationContext, svgRef, t])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
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
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('heap.inputPlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating}>{t('heap.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleExtract} disabled={isAnimating || data.length === 0} isBusy={isAnimating}>{t('heap.extractMax')}</OperationButton>
        <OperationButton variant="secondary" onClick={handlePeek} disabled={isAnimating || data.length === 0} isBusy={isAnimating} popAnimation>{t('heap.peek')}</OperationButton>
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
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
          ]} />
        </OperationInfo>
      </OperationBar>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer data={data} renderFn={renderHeap as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.heapLabel")} overlay={<StatsOverlay stats={[{ label: 'SIZE', value: heapSize }]} />} />
          {data.length === 0 && (
            <EmptyState icon="▲" titleKey="emptyState.emptyHeap" descriptionKey="emptyState.emptyHeapDesc" onFill={reset} />
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