import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import { renderTrie, animateInsertTrie, animateSearchTrie, animateDeleteTrie } from '../visualizers/trieVisualizer'
import { useTrieState } from '../hooks/useTrieState'
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
import LearningModeToggle from '../components/LearningModeToggle'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { usePageTracker } from '../hooks/usePageTracker'

export default function TriePage() {
  const { t } = useGlobalSettings()
  const { logs, isAnimating, setIsAnimating, insert, remove, search, searchPrefix, getFlattened, wordCount, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useTrieState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('trie')
  useSharedData({ dataType: 'trie', loadData, validator: (d): d is unknown => !!(d && typeof d === 'object' && !Array.isArray(d)) })
  usePageTracker('trie')

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
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterWord') })
      return
    }
    const word = inputValue.trim().toLowerCase()
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateInsertTrie(svgRef.current, word, anim)
      insert(word)
    } catch (e) {
      handleAnimationError(e, t('trie.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, insert, setIsAnimating, getAnimationContext, svgRef])

  const handleDelete = useCallback(async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterDeleteWord') })
      return
    }
    const word = inputValue.trim().toLowerCase()
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      if (svgRef.current) await animateDeleteTrie(svgRef.current, word, anim)
      remove(word)
    } catch (e) {
      handleAnimationError(e, t('trie.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }, [isAnimating, inputValue, remove, setIsAnimating, getAnimationContext, svgRef])

  const handleSearch = useCallback(async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterSearchWord') })
      return
    }
    const word = inputValue.trim().toLowerCase()
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const result = search(word)
      if (svgRef.current) await animateSearchTrie(svgRef.current, result.found, word, anim)
    } catch (e) {
      handleAnimationError(e, t('trie.search'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, inputValue, search, setIsAnimating, getAnimationContext, svgRef])

  const handlePrefixSearch = useCallback(async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterPrefix') })
      return
    }
    const prefix = inputValue.trim().toLowerCase()
    setIsAnimating(true)
    const anim = getAnimationContext()
    try {
      const result = searchPrefix(prefix)
      if (result.found && result.words.length > 0) {
        showToast({ type: 'success', message: `${t('errors.prefixMatch')}: ${result.words.join(', ')}` })
      } else {
        showToast({ type: 'info', message: t('errors.noPrefixMatch') })
      }
      if (svgRef.current) await animateSearchTrie(svgRef.current, result.words.length > 0, prefix, anim)
    } catch (e) {
      handleAnimationError(e, t('trie.prefixSearch'))
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, inputValue, searchPrefix, setIsAnimating, getAnimationContext, svgRef])

  const flatData = getFlattened()
  const count = wordCount()

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('trie.title')} subtitle={t('trie.subtitle')}>
        <ExportImport dataType="trie" data={flatData} disabled={isAnimating} onImport={({ data: imported }) => {
          if (imported && typeof imported === 'object' && 'children' in (imported as object)) {
            const node = imported as Record<string, unknown>
            if (typeof node.children === 'object' && node.children !== null && typeof node.isEndOfWord === 'boolean') {
              loadData(imported as Parameters<typeof loadData>[0])
            } else {
              showToast({ type: 'error', message: t('errors.importFailed') })
            }
          } else {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={flatData} dataType="trie" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={reset}>{t('common.reset')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput type="text" placeholder={t('trie.inputPlaceholder')} value={inputValue} onChange={setInputValue} />
        <OperationButton variant="primary" onClick={handleInsert} disabled={isAnimating}>{t('trie.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('trie.delete')}</OperationButton>
        <OperationButton variant="amber" onClick={handleSearch} disabled={isAnimating}>{t('trie.search')}</OperationButton>
        <OperationButton variant="amber" onClick={handlePrefixSearch} disabled={isAnimating}>{t('trie.prefixSearch')}</OperationButton>
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
            { color: getColors().nodeRoot, labelKey: 'nodeLegend.root' },
            { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
            { color: getColors().nodeLeaf, labelKey: 'nodeLegend.endOfWord' },
          ]} />
          <span className="font-mono text-xs text-ink-light">WORDS: {count}</span>
        </OperationInfo>
      </OperationBar>

      <Visualizer data={flatData} renderFn={renderTrie} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.trieLabel")} />
      {flatData.nodes.length === 0 && (
        <EmptyState icon="◈" titleKey="emptyState.emptyTrie" descriptionKey="emptyState.emptyTrieDesc" onFill={reset} />
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