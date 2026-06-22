import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderSkipList, animateInsertSkipList, animateSearchSkipList, animateDeleteSkipList } from '../visualizers/skipListVisualizer'
import { useSkipListState } from '../hooks/useSkipListState'
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
import { getColors } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function SkipListPage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const {
    data, logs, isAnimating, setIsAnimating,
    insert, remove, search, size, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useSkipListState(abortAnimation)
  const [inputValue, setInputValue] = useState<string>('')
  const learningMode = useLearningMode('skipList')
  useSharedData({
    dataType: 'skip-list',
    loadData,
    validator: (d): d is unknown => !!(d && typeof d === 'object' && !Array.isArray(d)),
  })
  usePageTracker('skipList')

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

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      // 先更新数据，让 Visualizer 重渲染出新增的节点
      insert(value)
      // 等待两帧: 第一帧 React commit + Visualizer useEffect 触发 renderFn，第二帧确保 DOM 就绪
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
      if (anim?.isAborted?.()) return
      if (svgRef.current) await animateInsertSkipList(svgRef.current, value, anim)
    } catch (error) {
      handleAnimationError(error, t('skipList.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, insert, setIsAnimating, getAnimationContext, svgRef, t])

  const handleDelete = useCallback(async () => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateDeleteSkipList(svgRef.current, value, anim)
      remove(value)
    } catch (error) {
      handleAnimationError(error, t('skipList.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, remove, setIsAnimating, getAnimationContext, svgRef, t])

  const handleSearch = useCallback(async () => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const result = search(value)
      if (svgRef.current) await animateSearchSkipList(svgRef.current, result.path, result.found, anim)
    } catch (error) {
      handleAnimationError(error, t('skipList.search'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, inputValue, search, setIsAnimating, getAnimationContext, svgRef, t])

  const isEmpty = size() === 0

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('skipList.title')} subtitle={t('skipList.subtitle')}>
        <ExportImport dataType="skip-list" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
            const obj = imported as Record<string, unknown>
            if (Array.isArray(obj.nodes) && Array.isArray(obj.edges) && typeof obj.maxLevel === 'number') {
              loadData(imported as Parameters<typeof loadData>[0])
            } else {
              showToast({ type: 'error', message: t('errors.importFailed') })
            }
          } else {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={data} dataType="skip-list" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('skipList.inputPlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating}>{t('skipList.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating || isEmpty} isBusy={isAnimating}>{t('skipList.delete')}</OperationButton>
        <OperationButton variant="warning" onClick={handleSearch} disabled={isAnimating || isEmpty} isBusy={isAnimating}>{t('skipList.search')}</OperationButton>
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
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
          ]} />
          <span className="font-mono text-xs text-ink-light">SIZE: {size()}</span>
        </OperationInfo>
      </OperationBar>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer data={data} renderFn={renderSkipList as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t('visualizer.skipListLabel')} />
          {isEmpty && (
            <EmptyState icon="≡" titleKey="emptyState.emptySkipList" descriptionKey="emptyState.emptySkipListDesc" onFill={reset} />
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
