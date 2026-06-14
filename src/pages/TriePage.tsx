import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import Timeline from '../components/Timeline'
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
import StepExplainer from '../components/StepExplainer'
import { useLearningMode } from '../hooks/useLearningMode'

export default function TriePage() {
  const { t } = useGlobalSettings()
  const { logs, isAnimating, setIsAnimating, insert, remove, search, searchPrefix, getFlattened, wordCount, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useTrieState()
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('trie')

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
    <div className="flex flex-col h-screen">
      <PageHeader title={t('trie.title')} subtitle={t('trie.subtitle')} icon="⊾">
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
        <OperationButton variant="success" onClick={handleInsert} disabled={isAnimating}>{t('trie.insert')}</OperationButton>
        <OperationButton variant="danger" onClick={handleDelete} disabled={isAnimating}>{t('trie.delete')}</OperationButton>
        <OperationButton variant="blue" onClick={handleSearch} disabled={isAnimating}>{t('trie.search')}</OperationButton>
        <OperationButton variant="purple" onClick={handlePrefixSearch} disabled={isAnimating}>{t('trie.prefixSearch')}</OperationButton>
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
        <OperationInfo><span className="font-mono text-xs text-ink-light">WORDS: {count}</span></OperationInfo>
      </OperationBar>

      <Visualizer data={flatData} renderFn={renderTrie} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.trieLabel")} />
      {flatData.nodes.length === 0 && (
        <EmptyState icon="⊾" titleKey="emptyState.emptyTrie" descriptionKey="emptyState.emptyTrieDesc" onFill={reset} />
      )}
      {logs.length > 0 && (
        <Timeline
          history={logs.map(log => ({ type: log.type, description: log.message }))}
          currentIndex={logs.length - 1}
          onJump={undefined}
          maxHeight="h-24"
        />
      )}
      <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
        <button
          aria-expanded={showLearning}
          onClick={() => setShowLearning(!showLearning)}
          className={`px-3 py-1.5 text-sm font-bold border-2 transition-all duration-200
            shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            ${showLearning
              ? 'bg-accent-blue text-paper border-accent-blue'
              : 'border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]'
            }`}
        >
          {showLearning ? t('learning.close') : t('learning.open')}
        </button>
      </div>

      {showLearning && (
        <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
          <StepExplainer
            step={learningMode.currentStep}
            currentStepIndex={learningMode.currentStepIndex}
            totalSteps={learningMode.totalSteps}
            progress={learningMode.progress}
            onNext={learningMode.nextStep}
            onPrev={learningMode.prevStep}
            onReset={learningMode.reset}
            isAnimating={isAnimating}
          />
        </div>
      )}
      <LogPanel logs={logs} />
    </div>
  )
}