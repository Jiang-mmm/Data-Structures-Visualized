import { useState, useCallback } from 'react'
import { handleAnimationError } from '../utils/errorHandler'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import { renderArray, animateInsert, animateDelete, animateSearch } from '../visualizers/arrayVisualizer'
import { useArrayState } from '../hooks/useArrayState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import { showToast } from '../components/toastStore'
import { getValidationError, validateImportData } from '../utils/validate'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { getColors, detectDarkMode } from '../utils/themeColors'
import ColorLegend from '../components/ColorLegend'
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'

export default function ArrayPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insert, remove, search, randomize, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useArrayState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [inputIndex, setInputIndex] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('array')

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
    } catch (e) {
      handleAnimationError(e, t('array.insert'))
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
    } catch (e) {
      handleAnimationError(e, t('common.delete'))
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
    } catch (e) {
      handleAnimationError(e, t('common.search'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, validateInputs, inputValue, setIsAnimating, getAnimationContext, search, svgRef, data, dimensions, setInputValue])

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('array.title')} subtitle={t('array.subtitle')} icon="▦">
        <ExportImport dataType="array" data={data} disabled={isAnimating} onImport={({ data: imported }: { data: unknown }) => {
          const result = validateImportData(imported)
          if (result.valid) {
            loadData(result.data)
          } else {
            showToast({ type: 'error', message: `${t('errors.importFailed')}: ${result.error}` })
          }
        }} />
        <ShareButton data={data} dataType="array" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
        <OperationButton variant="primary" onClick={randomize}>{t('common.randomize')}</OperationButton>
      </PageHeader>
      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('array.valuePlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationInput type="number" placeholder={t('array.indexPlaceholder')} value={inputIndex} onChange={setInputIndex} className="w-20" />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating}>{t('array.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('common.delete')}</OperationButton>
        <OperationButton variant="amber" onClick={handleSearch} disabled={isAnimating} popAnimation>{t('common.search')}</OperationButton>
        {isAnimating && <OperationButton variant="danger" onClick={handleStop}>{t('common.stop')}</OperationButton>}
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
            { color: getColors().nodeActive, labelKey: 'nodeLegend.active' },
          ]} />
          <span className="font-mono text-xs text-ink-light">SIZE: {data.length} / 20</span>
        </OperationInfo>
      </OperationBar>
      <div className="relative flex flex-col flex-1 min-h-0">
        <Visualizer data={data} renderFn={renderArray} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.arrayLabel")} />
        {data.length === 0 && (
          <EmptyState icon="▦" titleKey="emptyState.emptyArray" descriptionKey="emptyState.emptyArrayDesc" onFill={randomize} />
        )}
      </div>
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
