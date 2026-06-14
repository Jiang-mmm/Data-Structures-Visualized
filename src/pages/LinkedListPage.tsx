import { useState, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import Timeline from '../components/Timeline'
import { renderLinkedList, animateInsertHead, animateInsertTail, animateDeleteNode, animateSearchNode, animateInsertAt, animateReverse, animateCycleDetection } from '../visualizers/linkedListVisualizer'
import { useLinkedListState } from '../hooks/useLinkedListState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import OperationGroup from '../components/OperationGroup'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { getValidationError, validateImportData } from '../utils/validate'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'

export default function LinkedListPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insertHead, insertTail, insertAt, deleteAt, search, reverse, detectCycle, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, length } = useLinkedListState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [inputIndex, setInputIndex] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('linkedlist')

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

  const timelineHistory = useMemo(() => logs.map(log => ({ type: log.type, description: log.message })), [logs])

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('linkedlist.title')} subtitle={t('linkedlist.subtitle')} icon="∞">
        <ExportImport dataType="linkedlist" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          const result = validateImportData(imported)
          if (result.valid && result.data) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="linkedlist" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationInput type="number" placeholder={t('array.indexPlaceholder')} value={inputIndex} onChange={setInputIndex} className="w-20" />
        <OperationButton variant="success" onClick={handleInsertHead} disabled={isAnimating}>{t('linkedlist.pushFront')}</OperationButton>
        <OperationButton variant="primary" onClick={handleInsertTail} disabled={isAnimating}>{t('linkedlist.pushBack')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationButton variant="purple" onClick={handleSearch} disabled={isAnimating} popAnimation>{t('linkedlist.find')}</OperationButton>
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="warning" onClick={handleInsertAt} disabled={isAnimating}>{t('linkedlist.insertAt')}</OperationButton>
          <OperationButton variant="teal" onClick={handleReverse} disabled={isAnimating}>{t('linkedlist.reverse')}</OperationButton>
          <OperationButton variant="accent" onClick={handleDetectCycle} disabled={isAnimating}>{t('linkedlist.detectCycle')}</OperationButton>
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
        {isAnimating && <OperationButton variant="danger" onClick={handleStop}>{t('common.stop')}</OperationButton>}
        <OperationInfo><span className="font-mono text-xs text-ink-light">LEN: {length}</span></OperationInfo>
      </OperationBar>
      <Visualizer data={data} renderFn={renderLinkedList} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.linkedlistLabel")} />
      {data.length === 0 && (
        <EmptyState icon="∞" titleKey="emptyState.emptyLinkedList" descriptionKey="emptyState.emptyLinkedListDesc" onFill={reset} />
      )}
      {logs.length > 0 && (
        <Timeline
          history={timelineHistory}
          currentIndex={logs.length - 1}
          onJump={undefined}
          maxHeight="h-24"
        />
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
