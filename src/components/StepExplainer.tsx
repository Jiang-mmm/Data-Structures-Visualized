import { memo, useState, useEffect, useRef, useCallback } from 'react'
import type { LearningStep } from '../configs/learning'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface StepExplainerProps {
  step: LearningStep | null
  currentStepIndex: number
  totalSteps: number
  progress: number
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  onGoToStep?: (index: number) => void
  isAnimating: boolean
}

function highlightCode(line: string, terms: string[], _isHighlighted: boolean): React.ReactNode {
  if (!terms.length || !line.trim()) return line

  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'g')
  const parts = line.split(regex)

  return parts.map((part, i) => {
    const isTerm = terms.some(t => part === t)
    if (isTerm) {
      return (
        <span key={i} className="bg-accent-amber/20 text-accent-amber font-bold px-0.5">
          {part}
        </span>
      )
    }
    return part
  })
}

function StepExplainer({
  step,
  currentStepIndex,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onReset,
  onGoToStep,
  isAnimating,
}: StepExplainerProps) {
  const { t } = useGlobalSettings()
  const [autoPlay, setAutoPlay] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(3000)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopAutoPlay = useCallback(() => {
    setAutoPlay(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!autoPlay || isAnimating) {
      stopAutoPlay()
      return
    }
    if (currentStepIndex >= totalSteps - 1) {
      stopAutoPlay()
      return
    }
    timerRef.current = setTimeout(() => {
      onNext()
    }, playSpeed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [autoPlay, currentStepIndex, totalSteps, isAnimating, playSpeed, onNext, stopAutoPlay])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!step) {
    return (
      <div className="bg-surface dark:bg-dark-surface border-2 border-ink dark:border-dark-border p-4">
        <div className="text-center text-ink-light dark:text-dark-ink-light">
          {t('stepExplainer.selectAlgorithm')}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface dark:bg-dark-surface border-2 border-ink dark:border-dark-border p-4">
      {/* Step dots navigation */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {Array.from({ length: totalSteps }, (_, i) => (
          <button
            key={i}
            onClick={() => onGoToStep?.(i)}
            disabled={isAnimating}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 border
              ${i === currentStepIndex
                ? 'bg-accent-blue border-accent-blue scale-125'
                : i < currentStepIndex
                  ? 'bg-accent-emerald/60 border-accent-emerald/60'
                  : 'bg-ink/10 dark:bg-dark-ink/20 border-ink/20 dark:border-dark-border hover:bg-ink/30'
              }
              disabled:cursor-not-allowed`}
            aria-label={`${t('stepExplainer.step')} ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-mono text-ink-light dark:text-dark-ink-light">
          {t('stepExplainer.step')} {currentStepIndex + 1} / {totalSteps}
        </div>
        <div className="w-32 h-2 bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border">
          <div
            className="h-full bg-accent-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h3 className="text-lg font-bold text-ink dark:text-dark-ink mb-2">
        {step.title}
      </h3>

      <p className="text-sm text-ink-light dark:text-dark-ink-light mb-4">
        {step.description}
      </p>

      {/* Code snippet with keyword highlighting */}
      <div className="bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border p-3 mb-4 font-mono text-xs max-h-48 overflow-y-auto scrollbar-thin">
        {step.codeSnippet.split('\n').map((line, index) => (
          <div
            key={index}
            className={`py-0.5 ${
              index === step.highlightedLine - 1
                ? 'bg-accent-blue/10 text-accent-blue'
                : 'text-ink dark:text-dark-ink'
            }`}
          >
            <span className="inline-block w-6 text-right mr-2 text-ink-light dark:text-dark-ink-light">
              {index + 1}
            </span>
            {highlightCode(line, step.highlightTerms, index === step.highlightedLine - 1)}
          </div>
        ))}
      </div>

      {/* Complexity badge */}
      {step.complexity && (
        <div className="flex flex-wrap gap-2 mb-3">
          {step.complexity.time && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
              T: {step.complexity.time}
            </span>
          )}
          {step.complexity.space && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
              S: {step.complexity.space}
            </span>
          )}
        </div>
      )}

      {/* Tips */}
      {step.tips && step.tips.length > 0 && (
        <div className="mb-3 space-y-1">
          {step.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-ink-light dark:text-dark-ink-light bg-accent-violet/5 dark:bg-accent-violet/10 border border-accent-violet/20 px-2.5 py-1.5">
              <span className="text-accent-violet font-bold flex-shrink-0 mt-px">!</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Auto-play controls */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          disabled={isAnimating || currentStepIndex >= totalSteps - 1}
          className={`px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${autoPlay
              ? 'bg-accent-amber text-paper border-accent-amber'
              : 'hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper'
            }`}
        >
          {autoPlay ? t('stepExplainer.pause') : t('stepExplainer.autoPlay')}
        </button>
        <div className="flex items-center gap-1 text-xs text-ink-light dark:text-dark-ink-light">
          <span>{t('stepExplainer.speed')}:</span>
          {[1000, 2000, 3000, 5000].map(ms => (
            <button
              key={ms}
              onClick={() => setPlaySpeed(ms)}
              className={`px-1.5 py-0.5 border text-[10px] font-mono transition-colors
                ${playSpeed === ms
                  ? 'bg-ink text-paper dark:bg-dark-ink dark:text-dark-paper border-ink dark:border-dark-border'
                  : 'border-ink/20 dark:border-dark-border hover:bg-ink/10'
                }`}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0 || isAnimating}
          className="flex-1 px-3 py-2 text-sm font-bold border-2 border-ink dark:border-dark-border
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200"
        >
          {t('stepExplainer.prev')}
        </button>
        <button
          onClick={() => { onReset(); stopAutoPlay() }}
          disabled={isAnimating}
          className="px-3 py-2 text-sm font-bold border-2 border-ink dark:border-dark-border
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200"
        >
          {t('stepExplainer.reset')}
        </button>
        <button
          onClick={onNext}
          disabled={currentStepIndex === totalSteps - 1 || isAnimating}
          className="flex-1 px-3 py-2 text-sm font-bold bg-accent-blue text-paper border-2 border-accent-blue
            shadow-button dark:shadow-button-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200"
        >
          {t('stepExplainer.next')}
        </button>
      </div>
    </div>
  )
}

export default memo(StepExplainer)
