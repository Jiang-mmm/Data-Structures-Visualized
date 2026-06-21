import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderSegmentTree, animateSegmentTreePath } from '../visualizers/segmentTreeVisualizer'
import { useSegmentTreeState } from '../hooks/useSegmentTreeState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { getColors } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function SegmentTreePage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const {
    data, logs, isAnimating, setIsAnimating,
    build, query, update,
    getFlattened, nodeCount,
    reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useSegmentTreeState(abortAnimation)
  const [buildInput, setBuildInput] = useState<string>('')
  const [queryStart, setQueryStart] = useState<string>('')
  const [queryEnd, setQueryEnd] = useState<string>('')
  const [updateIndex, setUpdateIndex] = useState<string>('')
  const [updateValue, setUpdateValue] = useState<string>('')
  const learningMode = useLearningMode('segmentTree')
  useSharedData({ dataType: 'segmentTree', loadData, validator: (d: unknown) => Array.isArray(d) })
  usePageTracker('segmentTree')

  // 扁平化数据（仅在 data 变化时重新计算）
  const flattenedData = useMemo(() => getFlattened(), [getFlattened])

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleBuild = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const trimmed = buildInput.trim()
    if (!trimmed) {
      showToast({ type: 'error', message: t('segmentTree.buildEmpty') })
      return
    }
    // 解析数组输入：支持 "1,2,3" 或 "1 2 3"
    const parts = trimmed.split(/[,\s]+/).filter(s => s.length > 0)
    const arr = parts.map(s => parseInt(s, 10))
    if (arr.some(v => isNaN(v))) {
      showToast({ type: 'error', message: t('segmentTree.buildInvalid') })
      return
    }
    if (arr.length === 0 || arr.length > 50) {
      showToast({ type: 'error', message: t('segmentTree.buildInvalid') })
      return
    }

    setIsAnimating(true)
    try {
      build(arr)
    } catch (error) {
      handleAnimationError(error, t('segmentTree.build'))
    } finally {
      setIsAnimating(false)
    }
    setBuildInput('')
  }, [isAnimating, buildInput, build, setIsAnimating, t])

  const handleQuery = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const qs = parseInt(queryStart, 10)
    const qe = parseInt(queryEnd, 10)
    if (isNaN(qs) || isNaN(qe)) {
      showToast({ type: 'error', message: t('segmentTree.queryInvalid') })
      return
    }
    if (qs < 0 || qe >= data.length || qs > qe) {
      showToast({ type: 'error', message: t('segmentTree.queryOutOfRange') })
      return
    }

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const { path } = query(qs, qe)
      if (svgRef.current) await animateSegmentTreePath(svgRef.current, path, flattenedData, anim, false)
    } catch (error) {
      handleAnimationError(error, t('segmentTree.query'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, queryStart, queryEnd, data.length, query, flattenedData, setIsAnimating, getAnimationContext, svgRef, t])

  const handleUpdate = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const idx = parseInt(updateIndex, 10)
    const val = parseInt(updateValue, 10)
    if (isNaN(idx) || isNaN(val)) {
      showToast({ type: 'error', message: t('segmentTree.updateInvalid') })
      return
    }
    if (idx < 0 || idx >= data.length) {
      showToast({ type: 'error', message: t('segmentTree.updateOutOfRange') })
      return
    }

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      // 先动画（基于当前树），再更新状态
      const { path } = query(idx, idx)
      if (svgRef.current) await animateSegmentTreePath(svgRef.current, path, flattenedData, anim, true)
      update(idx, val)
    } catch (error) {
      handleAnimationError(error, t('segmentTree.update'))
    } finally {
      setIsAnimating(false)
    }
    setUpdateIndex('')
    setUpdateValue('')
  }, [isAnimating, updateIndex, updateValue, data.length, query, update, flattenedData, setIsAnimating, getAnimationContext, svgRef, t])

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
      <PageHeader title={t('segmentTree.title')} subtitle={t('segmentTree.subtitle')}>
        <ExportImport dataType="segmentTree" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          // 线段树导入：直接加载数组
          try {
            loadData(imported as number[])
            showToast({ type: 'success', message: t('common.confirmClear') })
          } catch {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={data} dataType="segmentTree" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="text" placeholder={t('segmentTree.buildPlaceholder')} value={buildInput} onChange={setBuildInput} />
        <OperationButton variant="primary" onClick={handleBuild} disabled={isAnimating} isBusy={isAnimating}>{t('segmentTree.build')}</OperationButton>
        <OperationInput type="number" placeholder={t('segmentTree.rangeStart')} value={queryStart} onChange={setQueryStart} />
        <OperationInput type="number" placeholder={t('segmentTree.rangeEnd')} value={queryEnd} onChange={setQueryEnd} />
        <OperationButton variant="warning" onClick={handleQuery} disabled={isAnimating} isBusy={isAnimating}>{t('segmentTree.query')}</OperationButton>
        <OperationInput type="number" placeholder={t('segmentTree.index')} value={updateIndex} onChange={setUpdateIndex} />
        <OperationInput type="number" placeholder={t('segmentTree.value')} value={updateValue} onChange={setUpdateValue} />
        <OperationButton variant="primary" onClick={handleUpdate} disabled={isAnimating} isBusy={isAnimating}>{t('segmentTree.update')}</OperationButton>
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
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
            { color: getColors().nodeLeaf, labelKey: 'nodeLegend.leaf' },
          ]} />
          <span className="font-mono text-xs text-ink-light">NODES: {nodeCount} | ARR: {data.length}</span>
        </OperationInfo>
      </OperationBar>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer
            data={flattenedData}
            renderFn={renderSegmentTree as any}
            svgRef={svgRef}
            dimensions={dimensions}
            containerRef={containerRef}
            isAnimating={isAnimating}
            ariaLabel={t('visualizer.segmentTreeLabel')}
          />
          {data.length === 0 && (
            <EmptyState icon="⊟" titleKey="emptyState.emptySegmentTree" descriptionKey="emptyState.emptySegmentTreeDesc" onFill={reset} />
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
