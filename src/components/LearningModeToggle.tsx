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
    goToStep: (index: number) => void
    reset: () => void
  }
  isAnimating: boolean
  children?: ReactNode
}

function LearningModeToggle({ showLearning, setShowLearning, learningMode, isAnimating, children }: LearningModeToggleProps) {
  const { t } = useGlobalSettings()

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-expanded={showLearning}
        onClick={() => setShowLearning(!showLearning)}
        className={`fixed bottom-16 right-4 z-40 px-3 py-2 text-sm font-bold border-2 transition-all duration-200
          shadow-soft active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-sm
          ${showLearning
            ? 'bg-accent-blue/90 text-paper border-accent-blue backdrop-blur-sm'
            : 'bg-white/90 dark:bg-slate/90 backdrop-blur-sm border-ink/20 dark:border-dark-border/40 hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover'
          }`}
      >
        {showLearning ? t('learning.close') : t('learning.open')}
      </button>

      {/* Side panel overlay */}
      {showLearning && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity"
            onClick={() => setShowLearning(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[420px] max-w-[90vw] z-50 bg-white dark:bg-dark-paper border-l-2 border-ink dark:border-dark-border shadow-2xl overflow-y-auto transition-transform animate-slide-in-right">
            <div className="sticky top-0 bg-white dark:bg-dark-paper border-b-2 border-ink dark:border-dark-border px-4 py-3 flex items-center justify-between z-10">
              <span className="font-bold text-ink dark:text-dark-ink">{t('learning.title')}</span>
              <button
                onClick={() => setShowLearning(false)}
                className="w-8 h-8 flex items-center justify-center border-2 border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper transition-colors font-bold"
                aria-label={t('learning.close')}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {children}
              <StepExplainer
                step={learningMode.currentStep}
                currentStepIndex={learningMode.currentStepIndex}
                totalSteps={learningMode.totalSteps}
                progress={learningMode.progress}
                onNext={learningMode.nextStep}
                onPrev={learningMode.prevStep}
                onGoToStep={learningMode.goToStep}
                onReset={learningMode.reset}
                isAnimating={isAnimating}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default memo(LearningModeToggle)
