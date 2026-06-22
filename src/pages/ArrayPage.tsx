import { useState, useCallback } from 'react'
import { handleAnimationError } from '../utils/errorHandler'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import PerformanceIndicator from '../components/PerformanceIndicator'
import { renderArray, animateInsert, animateDelete, animateSearch, animateSearchAll, animateBinarySearch } from '../visualizers/arrayVisualizer'
import { useArrayState } from '../hooks/useArrayState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import { showToast } from '../components/toastStore'
import { getValidationError, validateImportData } from '../utils/validate'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { getColors } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import StatsOverlay from '../components/StatsOverlay'
import ContentTier from '../components/ContentTier'
import { useLearningMode } from '../hooks/useLearningMode'
import { learningConfigs } from '../configs/learning'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function ArrayPage() {
  const { t } = useGlobalSettings()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const { data, logs, isAnimating, setIsAnimating, insert, remove, search, searchAll, binarySearch, randomize, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useArrayState(abortAnimation)
  const [inputValue, setInputValue] = useState<string>('')
  const [inputIndex, setInputIndex] = useState<string>('')
  const learningMode = useLearningMode('array')
  useSharedData({ dataType: 'array', loadData, validator: Array.isArray })
  usePageTracker('array')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const validateInputs = useCallback((): boolean => {
    const valueError = getValidationError(inputValue)
    if (valueError) {
      showToast({ type: 'error', message: valueError })
      return false
    }
    return true
  }, [inputValue])

  const validateIndexInput = useCallback((allowEqualLength = false): number | null => {
    const index = parseInt(inputIndex, 10)
    if (isNaN(index)) {
      showToast({ type: 'error', message: t('errors.invalidIndex') })
      return null
    }
    const maxIndex = allowEqualLength ? data.length : data.length - 1
    if (index < 0 || index > maxIndex) {
      showToast({ type: 'error', message: t('errors.indexOutOfRange').replace('{range}', `0~${maxIndex}`) })
      return null
    }
    return index
  }, [inputIndex, data.length])

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

  const handleInsert = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    if (!validateInputs()) return
    const index = validateIndexInput(true)
    if (index === null) return
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current && data.length > 0) {
        await animateInsert(svgRef.current, index, value, data, dimensions, anim)
      }
      insert(value, index)
    } catch (error) {
      handleAnimationError(error, t('array.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
    setInputIndex('')
  }, [isAnimating, validateInputs, validateIndexInput, inputValue, setIsAnimating, getAnimationContext, svgRef, data, dimensions, insert, setInputValue, setInputIndex])

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const index = validateIndexInput(false)
    if (index === null) return

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateDelete(svgRef.current, index, data, dimensions, anim)
      remove(index)
    } catch (error) {
      handleAnimationError(error, t('common.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputIndex('')
  }, [isAnimating, validateIndexInput, setIsAnimating, getAnimationContext, svgRef, data, dimensions, remove, setInputIndex])

  const handleSearch = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    if (!validateInputs()) return
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const idx = search(value)
      if (svgRef.current) await animateSearch(svgRef.current, idx, data, dimensions, anim)
    } catch (error) {
      handleAnimationError(error, t('common.search'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, validateInputs, inputValue, setIsAnimating, getAnimationContext, search, svgRef, data, dimensions, setInputValue])

  const handleSearchAll = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    if (!validateInputs()) return
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const indices = searchAll(value)
      if (svgRef.current) await animateSearchAll(svgRef.current, indices, data, dimensions, anim)
    } catch (error) {
      handleAnimationError(error, t('common.search'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, validateInputs, inputValue, setIsAnimating, getAnimationContext, searchAll, svgRef, data, dimensions, setInputValue])

  const handleBinarySearch = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    if (!validateInputs()) return
    const value = parseInt(inputValue, 10)

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const idx = binarySearch(value)
      // 数组未排序时 hook 返回 -1 并已提示，不运行动画
      if (idx === -1) {
        const isSorted = data.every((v, i) => i === 0 || data[i - 1] <= v)
        if (!isSorted) return
      }
      if (svgRef.current) await animateBinarySearch(svgRef.current, value, data, dimensions, anim)
    } catch (error) {
      handleAnimationError(error, t('common.search'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, validateInputs, inputValue, setIsAnimating, getAnimationContext, binarySearch, svgRef, data, dimensions, setInputValue])

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('array.title')} subtitle={t('array.subtitle')}>
        <ExportImport dataType="array" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid) {
            loadData(result.data ?? [])
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="array" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={reset}>{t('common.reset')}</OperationButton>
        <OperationButton variant="primary" onClick={randomize}>{t('common.randomize')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationInput type="number" placeholder={t('array.indexPlaceholder')} value={inputIndex} onChange={setInputIndex} className="w-20" />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating} isBusy={isAnimating} disabledReason={t('page.animating')}>{t('array.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating} isBusy={isAnimating} disabledReason={t('page.animating')}>{t('common.delete')}</OperationButton>
        <OperationButton variant="warning" onClick={handleSearch} disabled={isAnimating} isBusy={isAnimating} popAnimation disabledReason={t('page.animating')}>{t('common.search')}</OperationButton>
        <OperationButton variant="warning" onClick={handleSearchAll} disabled={isAnimating} isBusy={isAnimating}>{t('array.searchAll')}</OperationButton>
        <OperationButton variant="warning" onClick={handleBinarySearch} disabled={isAnimating} isBusy={isAnimating}>{t('array.binarySearch')}</OperationButton>
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
            { color: getColors().nodeActive, labelKey: 'nodeLegend.active' },
          ]} />
        </OperationInfo>
      </OperationBar>
      <ContentTier structureKey="array" />
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <div className="absolute top-2 right-2 z-20">
            <PerformanceIndicator visualizerKey="array" dataLength={data.length} />
          </div>
          <Visualizer data={data} renderFn={renderArray as any} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.arrayLabel")} overlay={<StatsOverlay stats={[{ label: 'SIZE', value: `${data.length} / 20` }]} />} />
          {data.length === 0 && (
            <EmptyState icon="▦" titleKey="emptyState.emptyArray" descriptionKey="emptyState.emptyArrayDesc" onFill={randomize} />
          )}
        </div>
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
          onJumpToStep={handleJumpToStep}
          algorithmKey="array"
          quizQuestions={learningConfigs.array.quiz}
        />
      </div>
    </div>
  )
}
