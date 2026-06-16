import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import { renderHash, animateInsertHash, animateSearchHash, animateDeleteHash } from '../visualizers/hashVisualizer'
import { useHashState } from '../hooks/useHashState'
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
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function HashPage() {
  const { t } = useGlobalSettings()
  const { data, logs, isAnimating, setIsAnimating, insert, remove, search, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, entryCount, bucketCount, hashFn } = useHashState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [keyValue, setKeyValue] = useState<string>('')
  const [valueInput, setValueInput] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('hash')
  useSharedData({ dataType: 'hash', loadData, validator: (d) => Array.isArray(d) })
  usePageTracker('hash')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleInsert = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const keyError = getValidationError(keyValue)
    if (keyError) { showToast({ type: 'error', message: keyError }); return }
    if (!valueInput.trim()) { showToast({ type: 'error', message: t('errors.inputRequired').replace('{item}', t('hash.valuePlaceholder')) }); return }

    const key = parseInt(keyValue, 10)
    const value = valueInput.trim()

    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateInsertHash(svgRef.current, key, value, { hashFn }, anim)
      insert(key, value)
    } catch (e) {
      handleAnimationError(e, t('hash.insert'))
    } finally {
      setIsAnimating(false)
    }
    setKeyValue('')
    setValueInput('')
  }, [isAnimating, keyValue, valueInput, insert, setIsAnimating, getAnimationContext, svgRef, hashFn])

  const handleSearch = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const keyError = getValidationError(keyValue)
    if (keyError) { showToast({ type: 'error', message: keyError }); return }

    const key = parseInt(keyValue, 10)
    setIsAnimating(true)
    const anim = getAnimationContext()
    const found = search(key)
    try { if (svgRef.current) await animateSearchHash(svgRef.current, key, !!found, data, { hashFn }, anim) }
    catch (e) { handleAnimationError(e, t('hash.search')) }
    finally { setIsAnimating(false) }
  }, [isAnimating, keyValue, search, data, setIsAnimating, getAnimationContext, svgRef, hashFn])

  const handleDelete = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    const keyError = getValidationError(keyValue)
    if (keyError) { showToast({ type: 'error', message: keyError }); return }

    const key = parseInt(keyValue, 10)
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateDeleteHash(svgRef.current, key, data, { hashFn }, anim)
      remove(key)
    } catch (e) {
      handleAnimationError(e, t('hash.remove'))
    } finally {
      setIsAnimating(false)
    }
    setKeyValue('')
    setValueInput('')
  }, [isAnimating, keyValue, data, remove, setIsAnimating, getAnimationContext, svgRef, hashFn])

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('hash.title')} subtitle={t('hash.subtitle')} icon="#">
        <ExportImport dataType="hash" data={data} disabled={isAnimating} onImport={({ data: imported }) => {
          if (Array.isArray(imported) && imported.length > 0 && imported.length <= 200 && imported.every(item =>
            typeof item === 'object' && item !== null &&
            typeof item.key === 'number' && Number.isFinite(item.key) &&
            typeof item.value === 'string' && item.value.length <= 100
          )) {
            loadData(imported)
          } else {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={data} dataType="hash" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="number" placeholder={t('hash.keyPlaceholder')} value={keyValue} onChange={setKeyValue} />
        <OperationInput type="text" placeholder={t('hash.valuePlaceholder')} value={valueInput} onChange={setValueInput} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating}>{t('hash.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('hash.remove')}</OperationButton>
        <OperationButton variant="amber" onClick={handleSearch} disabled={isAnimating} popAnimation>{t('hash.search')}</OperationButton>
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
          <span className="font-mono text-xs text-ink-light">BUCKETS: {bucketCount} · ENTRIES: {entryCount}</span>
        </OperationInfo>
      </OperationBar>

      <Visualizer
        data={data}
        renderFn={(svg: SVGSVGElement, d: unknown, dims: { width: number; height: number }) => renderHash(svg, d as Parameters<typeof renderHash>[1], { ...dims, hashFn })}
        svgRef={svgRef}
        dimensions={dimensions}
        containerRef={containerRef}
        ariaLabel={t("visualizer.hashLabel")}
      />
      {data.length === 0 && (
        <EmptyState icon="#" titleKey="emptyState.emptyHash" descriptionKey="emptyState.emptyHashDesc" onFill={reset} />
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
