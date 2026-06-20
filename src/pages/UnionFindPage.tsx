import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderUnionFind, animateInsertUnionFind, animateDeleteUnionFind, animateFindUnionFind, animateUnionUnionFind } from '../visualizers/unionFindVisualizer'
import { useUnionFindState } from '../hooks/useUnionFindState'
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
import { findIdByValue } from '../algorithms/unionFind'

export default function UnionFindPage() {
  const { t } = useGlobalSettings()
  const {
    data, logs, isAnimating, setIsAnimating,
    insert, remove, find, union, checkConnected, size, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useUnionFindState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [inputValueB, setInputValueB] = useState<string>('')
  const learningMode = useLearningMode('unionFind')
  useSharedData({
    dataType: 'union-find',
    loadData,
    validator: (d): d is unknown => !!(d && typeof d === 'object' && !Array.isArray(d)),
  })
  usePageTracker('unionFind')

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
  }, [learningMode.steps, learningMode.goToStep])

  const handleInsert = useCallback(async () => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      insert(value)
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
      if (anim?.isAborted?.()) return
      if (svgRef.current) await animateInsertUnionFind(svgRef.current, value, anim)
    } catch (error) {
      handleAnimationError(error, t('unionFind.insert'))
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
      if (svgRef.current) await animateDeleteUnionFind(svgRef.current, value, anim)
      remove(value)
    } catch (error) {
      handleAnimationError(error, t('unionFind.remove'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, remove, setIsAnimating, getAnimationContext, svgRef])

  const handleFind = useCallback(async () => {
    if (isAnimating) return
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const result = find(value)
      if (svgRef.current && result.path.length > 0) {
        await animateFindUnionFind(svgRef.current, result.path, result.rootId, anim)
      }
    } catch (error) {
      handleAnimationError(error, t('unionFind.find'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, inputValue, find, setIsAnimating, getAnimationContext, svgRef])

  const handleUnion = useCallback(async () => {
    if (isAnimating) return
    const errorA = getValidationError(inputValue)
    const errorB = getValidationError(inputValueB)
    if (errorA || errorB) {
      showToast({ type: 'error', message: errorA || errorB })
      return
    }
    const valueA = parseInt(inputValue, 10)
    const valueB = parseInt(inputValueB, 10)
    if (valueA === valueB) {
      showToast({ type: 'warning', message: t('errors.invalidRange') })
      return
    }

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const idA = findIdByValue(data, valueA)
      const idB = findIdByValue(data, valueB)
      if (idA && idB && svgRef.current) {
        await animateUnionUnionFind(svgRef.current, idA, idB, anim)
      }
      union(valueA, valueB)
    } catch (error) {
      handleAnimationError(error, t('unionFind.union'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
    setInputValueB('')
  }, [isAnimating, inputValue, inputValueB, data, union, setIsAnimating, getAnimationContext, svgRef, t])

  const handleConnected = useCallback(async () => {
    if (isAnimating) return
    const errorA = getValidationError(inputValue)
    const errorB = getValidationError(inputValueB)
    if (errorA || errorB) {
      showToast({ type: 'error', message: errorA || errorB })
      return
    }
    const valueA = parseInt(inputValue, 10)
    const valueB = parseInt(inputValueB, 10)
    if (valueA === valueB) {
      showToast({ type: 'warning', message: t('errors.invalidRange') })
      return
    }

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const idA = findIdByValue(data, valueA)
      const idB = findIdByValue(data, valueB)
      if (idA && idB && svgRef.current) {
        await animateUnionUnionFind(svgRef.current, idA, idB, anim)
      }
      checkConnected(valueA, valueB)
    } catch (error) {
      handleAnimationError(error, t('unionFind.connected'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, inputValue, inputValueB, data, checkConnected, setIsAnimating, getAnimationContext, svgRef, t])

  const isEmpty = size() === 0

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('unionFind.title')} subtitle={t('unionFind.subtitle')}>
        <ExportImport dataType="union-find" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          if (imported && typeof imported === 'object' && !Array.isArray(imported)) {
            const obj = imported as Record<string, unknown>
            if (Array.isArray(obj.nodes) && typeof obj.parent === 'object' && typeof obj.rank === 'object') {
              loadData(imported as Parameters<typeof loadData>[0])
            } else {
              showToast({ type: 'error', message: t('errors.importFailed') })
            }
          } else {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={data} dataType="union-find" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('unionFind.inputPlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationInput type="number" placeholder={t('unionFind.inputPlaceholderB')} value={inputValueB} onChange={setInputValueB} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating}>{t('unionFind.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating || isEmpty} isBusy={isAnimating}>{t('unionFind.remove')}</OperationButton>
        <OperationButton variant="warning" onClick={handleFind} disabled={isAnimating || isEmpty} isBusy={isAnimating}>{t('unionFind.find')}</OperationButton>
        <OperationButton variant="primary" onClick={handleUnion} disabled={isAnimating || isEmpty} isBusy={isAnimating}>{t('unionFind.union')}</OperationButton>
        <OperationButton variant="secondary" onClick={handleConnected} disabled={isAnimating || isEmpty} isBusy={isAnimating}>{t('unionFind.connected')}</OperationButton>
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
          <Visualizer data={data} renderFn={renderUnionFind as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t('visualizer.unionFindLabel')} />
          {isEmpty && (
            <EmptyState icon="⬓" titleKey="emptyState.emptyUnionFind" descriptionKey="emptyState.emptyUnionFindDesc" onFill={reset} />
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
