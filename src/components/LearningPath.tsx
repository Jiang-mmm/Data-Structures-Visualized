import { Link } from 'react-router-dom'
import { memo, useCallback } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useLearningProgress } from '../hooks/useLearningProgress'
import { LEARNING_PATH, CATEGORY_COLORS, CATEGORY_LABELS, DIFFICULTY_LABELS } from '../configs/learningPath'

function LearningPath() {
  const { t } = useGlobalSettings()
  const { isCompleted, isUnlocked, markVisited, getProgress, resetProgress } = useLearningProgress()
  const { total, completed, percentage } = getProgress()

  const handleNodeClick = useCallback((id: string) => {
    markVisited(id)
  }, [markVisited])

  return (
    <section className="mb-12 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <div className="border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-blue flex items-center justify-center text-paper text-sm font-bold shadow-button dark:shadow-button-dark">
              ◇
            </div>
            <h2 className="text-lg font-bold text-ink dark:text-dark-ink">{t('learningPath.title')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">
              {completed}/{total} · {percentage}%
            </span>
            {completed > 0 && (
              <button
                onClick={resetProgress}
                className="text-[10px] font-mono text-ink-light/50 dark:text-dark-ink-light/50 hover:text-accent-rose transition-colors"
                title={t('learningPath.reset')}
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border mb-5">
          <div
            className="h-full bg-accent-blue transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Path nodes */}
        <div className="flex flex-wrap gap-2">
          {LEARNING_PATH.map((node) => {
            const done = isCompleted(node.id)
            const unlocked = isUnlocked(node.id)
            const color = CATEGORY_COLORS[node.category]
            const diffKey = DIFFICULTY_LABELS[node.difficulty]

            return (
              <Link
                key={node.id}
                to={unlocked ? node.path : '#'}
                onClick={() => unlocked && handleNodeClick(node.id)}
                className={`
                  group relative flex items-center gap-2 px-3 py-2 border-2 transition-all duration-200
                  ${done
                    ? 'border-accent-blue/50 bg-accent-blue/5 dark:bg-accent-blue/10'
                    : unlocked
                      ? 'border-ink/20 dark:border-dark-border bg-paper dark:bg-dark-paper hover:border-ink dark:hover:border-dark-border hover:-translate-y-0.5 hover:shadow-button dark:hover:shadow-button-dark'
                      : 'border-ink/5 dark:border-dark-border/30 bg-paper/50 dark:bg-dark-paper/30 opacity-40 cursor-not-allowed pointer-events-none'
                  }
                `}
              >
                {/* Category dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: done ? 'var(--color-accent-blue)' : color }}
                />

                {/* Name */}
                <span className={`text-sm font-medium ${done ? 'text-accent-blue line-through' : 'text-ink dark:text-dark-ink'}`}>
                  {t(node.nameKey)}
                </span>

                {/* Difficulty badge */}
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-ink/5 dark:bg-dark-ink/10 text-ink-light dark:text-dark-ink-light">
                  {t(diffKey)}
                </span>

                {/* Completion checkmark */}
                {done && (
                  <span className="text-accent-blue text-xs font-bold">✓</span>
                )}

                {/* Tooltip on hover */}
                {unlocked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    <div className="learning-path-tooltip w-56 px-3 py-2.5 bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper border-2 border-ink dark:border-dark-border shadow-button-hover dark:shadow-button-dark-hover">
                      {/* Title */}
                      <div className="lp-tooltip-title text-sm font-bold leading-tight mb-1.5 pb-1.5 border-b border-paper/20 dark:border-dark-paper/20">
                        {t(node.nameKey)}
                      </div>
                      {/* Description */}
                      <p className="lp-tooltip-desc text-xs leading-relaxed mb-2 text-paper/90 dark:text-dark-paper/90">
                        {t(node.descriptionKey)}
                      </p>
                      {/* Progress: status + category + difficulty */}
                      <div className="lp-tooltip-progress flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className={`px-1.5 py-0.5 font-bold ${
                          done
                            ? 'bg-accent-blue text-paper'
                            : 'bg-paper/15 text-paper dark:bg-dark-paper/15 dark:text-dark-paper'
                        }`}>
                          {done ? t('learningPath.completed') : t('learningPath.startLearning')}
                        </span>
                        <span className="flex items-center gap-1 text-paper/60 dark:text-dark-paper/60">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          {t(CATEGORY_LABELS[node.category])}
                        </span>
                        <span className="text-paper/30 dark:text-dark-paper/30">·</span>
                        <span className="text-paper/60 dark:text-dark-paper/60">{t(diffKey)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Completion message */}
        {percentage === 100 && (
          <div className="mt-4 text-center text-sm font-bold text-accent-blue">
            {t('learningPath.allCompleted')}
          </div>
        )}
      </div>
    </section>
  )
}

export default memo(LearningPath)
