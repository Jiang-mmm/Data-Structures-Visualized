import { memo, useState, useCallback } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useLearningProgress } from '../hooks/useLearningProgress'

function ProgressOverview() {
  const { t } = useGlobalSettings()
  const {
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules,
    overallCompletionRate,
    goal,
    setGoal,
    clearGoal,
    goalProgress,
  } = useLearningProgress()

  const [targetSteps, setTargetSteps] = useState<string>(goal?.targetSteps.toString() || '')
  const [targetDate, setTargetDate] = useState<string>(goal?.targetDate || '')

  const handleSetGoal = useCallback(() => {
    const steps = parseInt(targetSteps, 10)
    if (!Number.isFinite(steps) || steps <= 0) return
    setGoal(steps, targetDate)
  }, [targetSteps, targetDate, setGoal])

  const handleClearGoal = useCallback(() => {
    clearGoal()
    setTargetSteps('')
    setTargetDate('')
  }, [clearGoal])

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (overallCompletionRate / 100) * circumference

  return (
    <section className="mb-8 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
      <div className="border-2 border-ink dark:border-dark-border bg-white dark:bg-slate p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-accent-emerald flex items-center justify-center text-paper text-sm font-bold shadow-button dark:shadow-button-dark">
            ○
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-dark-ink">{t('learningPath.overviewTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Progress ring + stats */}
          <div className="flex flex-col items-center md:flex-row gap-5">
            {/* Progress ring */}
            <div className="relative flex-shrink-0">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                role="img"
                aria-label={`${t('learningPath.overallCompletionRate')}: ${overallCompletionRate}%`}
              >
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-ink/10 dark:text-dark-ink/10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-ink dark:text-dark-ink">{overallCompletionRate}%</span>
                <span className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light">
                  {t('learningPath.overallCompletionRate')}
                </span>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-2 flex-1 w-full">
              <div className="border-2 border-accent-emerald/40 bg-accent-emerald/5 dark:bg-accent-emerald/10 p-2 text-center">
                <div className="text-xl font-black text-accent-emerald">{completedModules}</div>
                <div className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light">
                  {t('learningPath.completedModules')}
                </div>
              </div>
              <div className="border-2 border-accent-amber/40 bg-accent-amber/5 dark:bg-accent-amber/10 p-2 text-center">
                <div className="text-xl font-black text-accent-amber">{inProgressModules}</div>
                <div className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light">
                  {t('learningPath.inProgressModules')}
                </div>
              </div>
              <div className="border-2 border-ink/20 dark:border-dark-border bg-paper dark:bg-dark-paper p-2 text-center">
                <div className="text-xl font-black text-ink-light dark:text-dark-ink-light">{notStartedModules}</div>
                <div className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light">
                  {t('learningPath.notStartedModules')}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Goal setting */}
          <div className="border-2 border-ink/10 dark:border-dark-border/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-ink dark:text-dark-ink">{t('learningPath.learningGoal')}</h3>
              {goal && (
                <button
                  onClick={handleClearGoal}
                  className="text-[10px] font-mono text-ink-light/50 dark:text-dark-ink-light/50 hover:text-accent-rose transition-colors"
                  title={t('learningPath.clearGoal')}
                  aria-label={t('learningPath.clearGoal')}
                >
                  ✕
                </button>
              )}
            </div>

            {goal ? (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-mono text-ink-light dark:text-dark-ink-light">
                    {completedModules} / {goal.targetSteps}
                  </span>
                  <span className="text-xs font-mono text-ink-light dark:text-dark-ink-light">
                    {goal.targetDate}
                  </span>
                </div>
                <div className="w-full h-2 bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border mb-2">
                  <div
                    className="h-full bg-accent-violet transition-all duration-500"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light">
                  {t('learningPath.goalProgress')}: {goalProgress}%
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-mono text-ink-light dark:text-dark-ink-light mb-1">
                    {t('learningPath.targetSteps')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalModules}
                    value={targetSteps}
                    onChange={(e) => setTargetSteps(e.target.value)}
                    className="w-full px-2 py-1 border-2 border-ink/20 dark:border-dark-border bg-paper dark:bg-dark-paper text-sm text-ink dark:text-dark-ink focus:outline-none focus:border-accent-violet"
                    placeholder={`${totalModules}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-ink-light dark:text-dark-ink-light mb-1">
                    {t('learningPath.targetDate')}
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-2 py-1 border-2 border-ink/20 dark:border-dark-border bg-paper dark:bg-dark-paper text-sm text-ink dark:text-dark-ink focus:outline-none focus:border-accent-violet"
                  />
                </div>
                <button
                  onClick={handleSetGoal}
                  className="w-full py-1.5 border-2 border-ink dark:border-dark-border bg-accent-violet text-paper text-xs font-bold shadow-button dark:shadow-button-dark hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover transition-all"
                >
                  {t('learningPath.setGoal')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(ProgressOverview)
