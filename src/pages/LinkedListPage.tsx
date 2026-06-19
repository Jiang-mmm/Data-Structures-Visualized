import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderLinkedList, animateInsertHead, animateInsertTail, animateDeleteNode, animateSearchNode, animateInsertAt, animateReverse, animateCycleDetection } from '../visualizers/linkedListVisualizer'
import { useLinkedListState } from '../hooks/useLinkedListState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ColorLegend from '../components/ColorLegend'
import StatsOverlay from '../components/StatsOverlay'
import OperationGroup from '../components/OperationGroup'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { getValidationError, validateImportData } from '../utils/validate'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { getColors } from '../utils/themeColors'
import ContentTier from '../components/ContentTier'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function LinkedListPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insertHead, insertTail, insertAt, deleteAt, search, reverse, detectCycle, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, length } = useLinkedListState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [inputIndex, setInputIndex] = useState<string>('')
  const [isDoublyMode, setIsDoublyMode] = useState(false)
  const learningMode = useLearningMode(isDoublyMode ? 'doublyLinkedList' : 'linkedlist')
  useSharedData({ dataType: 'linkedlist', loadData: ((d: unknown) => loadData(d as any)) as any, validator: Array.isArray })
  usePageTracker('linkedlist')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const validateValueInput = useCallback((): number | null => {
    const error = getValidationError(inputValue)
    if (error) { showToast({ type: 'error', message: error }); return null }
    return parseInt(inputValue, 10)
  }, [inputValue])

  const validateIndexInput = useCallback((): number | null => {
    const index = parseInt(inputIndex, 10)
    if (isNaN(index)) { showToast({ type: 'error', message: t('errors.invalidIndex') }); return null }
    if (index < 0 || index >= data.length) { showToast({ type: 'error', message: t('errors.indexOutOfRange').replace('{range}', `0~${data.length - 1}`) }); return null }
    return index
  }, [inputIndex, data.length])

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
    showToast({ type: 'warning', message: t('errors.stopped') })
  }, [abortAnimation, setIsAnimating])

  const handleJumpToStep = useCallback((stepId: string): void => {
    const idx = learningMode.steps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      learningMode.goToStep(idx)
    }
  }, [learningMode.steps, learningMode.goToStep])

  const handleInsertHead = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const value = validateValueInput()
    if (value === null) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateInsertHead(svgRef.current, value, data, dimensions, anim)
      insertHead(value)
    } catch (e) {
      handleAnimationError(e, t('linkedlist.pushFront'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, data, dimensions, insertHead, setIsAnimating, getAnimationContext, svgRef, validateValueInput, setInputValue])

  const handleInsertTail = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const value = validateValueInput()
    if (value === null) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateInsertTail(svgRef.current, value, data, dimensions, anim)
      insertTail(value)
    } catch (e) {
      handleAnimationError(e, t('linkedlist.pushBack'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, data, dimensions, insertTail, setIsAnimating, getAnimationContext, svgRef, validateValueInput, setInputValue])

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const index = validateIndexInput()
    if (index === null) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateDeleteNode(svgRef.current, index, data, dimensions, anim)
      deleteAt(index)
    } catch (e) {
      handleAnimationError(e, t('common.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputIndex('')
  }, [isAnimating, data, dimensions, deleteAt, setIsAnimating, getAnimationContext, svgRef, validateIndexInput, setInputIndex])

  const handleSearch = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const value = validateValueInput()
    if (value === null) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const idx = search(value)
      if (svgRef.current) await animateSearchNode(svgRef.current, idx, data, dimensions, anim)
    } catch (e) {
      handleAnimationError(e, t('linkedlist.find'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, data, dimensions, search, setIsAnimating, getAnimationContext, svgRef, validateValueInput, setInputValue])

  const handleInsertAt = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const value = validateValueInput()
    if (value === null) return
    const index = validateIndexInput()
    if (index === null) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateInsertAt(svgRef.current, index, value, data, dimensions, anim)
      insertAt(index, value)
    } catch (e) {
      handleAnimationError(e, t('linkedlist.insertAt'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
    setInputIndex('')
  }, [isAnimating, data, dimensions, insertAt, setIsAnimating, getAnimationContext, svgRef, validateValueInput, validateIndexInput, setInputValue, setInputIndex])

  const handleReverse = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    if (data.length <= 1) {
      showToast({ type: 'info', message: t('errors.tooShortToReverse') })
      return
    }
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateReverse(svgRef.current, data, dimensions, anim)
      reverse()
    } catch (e) {
      handleAnimationError(e, t('linkedlist.reverse'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, data, dimensions, reverse, setIsAnimating, getAnimationContext, svgRef])

  const handleDetectCycle = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const { steps } = detectCycle()
    if (steps.length === 0) return
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateCycleDetection(svgRef.current, steps, anim)
    } catch (e) {
      handleAnimationError(e, t('linkedlist.detectCycle'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, dimensions, detectCycle, setIsAnimating, getAnimationContext, svgRef])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={isDoublyMode ? t('linkedlist.doublyTitle') : t('linkedlist.title')} subtitle={isDoublyMode ? t('linkedlist.doublySubtitle') : t('linkedlist.subtitle')}>
        <OperationButton
          variant={isDoublyMode ? 'primary' : 'outline'}
          onClick={() => setIsDoublyMode(!isDoublyMode)}
          disabled={isAnimating} isBusy={isAnimating}
        >
          {isDoublyMode ? t('linkedlist.switchToSingle') : t('linkedlist.switchToDoubly')}
        </OperationButton>
        <ExportImport dataType="linkedlist" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="linkedlist" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationInput type="number" placeholder={t('array.indexPlaceholder')} value={inputIndex} onChange={setInputIndex} className="w-20" />
        <OperationButton variant="primary" onClick={handleInsertHead} disabled={isAnimating} isBusy={isAnimating}>{t('linkedlist.pushFront')}</OperationButton>
        <OperationButton variant="primary" onClick={handleInsertTail} disabled={isAnimating} isBusy={isAnimating}>{t('linkedlist.pushBack')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating} isBusy={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationButton variant="warning" onClick={handleSearch} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('linkedlist.find')}</OperationButton>
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="primary" onClick={handleInsertAt} disabled={isAnimating} isBusy={isAnimating}>{t('linkedlist.insertAt')}</OperationButton>
          <OperationButton variant="secondary" onClick={handleReverse} disabled={isAnimating} isBusy={isAnimating}>{t('linkedlist.reverse')}</OperationButton>
          <OperationButton variant="primary" onClick={handleDetectCycle} disabled={isAnimating} isBusy={isAnimating}>{t('linkedlist.detectCycle')}</OperationButton>
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
        {isAnimating && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
        <OperationInfo>
          <ColorLegend items={[
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.head' },
            { color: getColors().nodeLeaf, labelKey: 'nodeLegend.tail' },
          ]} />
        </OperationInfo>
      </OperationBar>
      <ContentTier structureKey="linkedlist" />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer data={data} renderFn={renderLinkedList as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.linkedlistLabel")} overlay={<StatsOverlay stats={[{ label: 'LEN', value: length }]} />} />
          {data.length === 0 && (
            <EmptyState icon="●" titleKey="emptyState.emptyLinkedList" descriptionKey="emptyState.emptyLinkedListDesc" onFill={reset} />
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
