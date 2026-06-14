import { memo } from 'react'
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
  isAnimating: boolean
}

function StepExplainer({
  step,
  currentStepIndex,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onReset,
  isAnimating,
}: StepExplainerProps) {
  const { t } = useGlobalSettings()

  if (!step) {
    return (
      <div className="bg-white dark:bg-slate border-2 border-ink dark:border-dark-border p-4">
        <div className="text-center text-ink-light dark:text-dark-ink-light">
          {t('stepExplainer.selectAlgorithm')}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate border-2 border-ink dark:border-dark-border p-4">
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
            {line}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={currentStepIndex === 0 || isAnimating}
          className="flex-1 px-3 py-2 text-sm font-bold border-2 border-ink dark:border-dark-border
            shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200"
        >
          {t('stepExplainer.prev')}
        </button>
        <button
          onClick={onReset}
          disabled={isAnimating}
          className="px-3 py-2 text-sm font-bold border-2 border-ink dark:border-dark-border
            shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200"
        >
          {t('stepExplainer.reset')}
        </button>
        <button
          onClick={onNext}
          disabled={currentStepIndex === totalSteps - 1 || isAnimating}
          className="flex-1 px-3 py-2 text-sm font-bold bg-accent-blue text-paper border-2 border-accent-blue
            shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]
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
