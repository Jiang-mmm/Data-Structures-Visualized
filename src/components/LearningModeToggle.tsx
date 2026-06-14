import { memo, ReactNode } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import StepExplainer from './StepExplainer'

interface LearningModeToggleProps {
  showLearning: boolean
  setShowLearning: (show: boolean) => void
  learningMode: {
    currentStep: any
    currentStepIndex: number
    totalSteps: number
    progress: number
    nextStep: () => void
    prevStep: () => void
    reset: () => void
  }
  isAnimating: boolean
  children?: ReactNode
}

function LearningModeToggle({ showLearning, setShowLearning, learningMode, isAnimating, children }: LearningModeToggleProps) {
  const { t } = useGlobalSettings()

  return (
    <>
      <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
        <button
          aria-expanded={showLearning}
          onClick={() => setShowLearning(!showLearning)}
          className={`px-3 py-1.5 text-sm font-bold border-2 transition-all duration-200
            shadow-button dark:shadow-button-dark
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            ${showLearning
              ? 'bg-accent-blue text-paper border-accent-blue'
              : 'border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover'
            }`}
        >
          {showLearning ? t('learning.close') : t('learning.open')}
        </button>
      </div>

      {showLearning && (
        <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
          {children}
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
    </>
  )
}

export default memo(LearningModeToggle)
