import { useState } from 'react'
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
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { showToast } from '../components/toastStore'
import { handleAnimationError } from '../utils/errorHandler'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import StepExplainer from '../components/StepExplainer'
import { useLearningMode } from '../hooks/useLearningMode'

export default function TriePage() {
  const { t } = useGlobalSettings()
  const { logs, isAnimating, setIsAnimating, insert, remove, search, searchPrefix, getFlattened, wordCount, reset, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } = useTrieState()
  const { containerRef, svgRef, dimensions } = useVisualizer()
  const [inputValue, setInputValue] = useState<string>('')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('trie')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  const handleInsert = async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterWord') })
      return
    }
    setIsAnimating(true)
    try {
      if (svgRef.current) await animateInsertTrie(svgRef.current)
      insert(inputValue.trim().toLowerCase())
    } catch (e) {
      handleAnimationError(e, t('trie.insert'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }

  const handleDelete = async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterDeleteWord') })
      return
    }
    setIsAnimating(true)
    try {
      if (svgRef.current) await animateDeleteTrie(svgRef.current)
      remove(inputValue.trim().toLowerCase())
    } catch (e) {
      handleAnimationError(e, t('trie.delete'))
    } finally {
      setIsAnimating(false)
    }
    setInputValue('')
  }

  const handleSearch = async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterSearchWord') })
      return
    }
    setIsAnimating(true)
    try {
      const result = search(inputValue.trim().toLowerCase())
      if (svgRef.current) await animateSearchTrie(svgRef.current, result.found)
    } catch (e) {
      handleAnimationError(e, t('trie.search'))
    } finally {
      setIsAnimating(false)
    }
  }

  const handlePrefixSearch = async () => {
    if (isAnimating) return
    if (!inputValue || inputValue.trim().length === 0) {
      showToast({ type: 'error', message: t('errors.enterPrefix') })
      return
    }
    setIsAnimating(true)
    try {
      const result = searchPrefix(inputValue.trim().toLowerCase())
      if (result.found && result.words.length > 0) {
        showToast({ type: 'success', message: `${t('errors.prefixMatch')}: ${result.words.join(', ')}` })
      } else {
        showToast({ type: 'info', message: t('errors.noPrefixMatch') })
      }
      if (svgRef.current) await animateSearchTrie(svgRef.current, result.words.length > 0)
    } catch (e) {
      handleAnimationError(e, t('trie.prefixSearch'))
    } finally {
      setIsAnimating(false)
    }
  }

  const flatData = getFlattened()
  const count = wordCount()

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={t('trie.title') + ' Trie'} subtitle={t('trie.subtitle')} icon="🌳">
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

      <Visualizer data={flatData} renderFn={renderTrie} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel="字典树可视化" />
      {flatData.nodes.length === 0 && (
        <EmptyState icon="🌳" titleKey="emptyState.emptyTrie" descriptionKey="emptyState.emptyTrieDesc" onFill={reset} />
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