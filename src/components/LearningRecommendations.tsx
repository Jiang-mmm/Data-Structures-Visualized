import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useLearningProgress } from '../hooks/useLearningProgress'
import { LEARNING_PATH, CATEGORY_COLORS, DIFFICULTY_LABELS } from '../configs/learningPath'
import { getRecommendations, getPersonalizedAdvice, type LearningProgressData } from '../utils/learningRecommender'

function SparklesIcon({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={ariaHidden}
      focusable="false"
    >
      <path d="M10 2c.28 0 .53.17.64.43l1.28 3.25 3.25 1.28a.72.72 0 010 1.28l-3.25 1.28-1.28 3.25a.72.72 0 01-1.28 0L8.08 9.52 4.83 8.24a.72.72 0 010-1.28l3.25-1.28L9.36 2.43A.72.72 0 0110 2z" />
      <path d="M15.5 11.5c.22 0 .42.13.51.34l.84 2.16 2.16.84a.57.57 0 010 1.02l-2.16.84-.84 2.16a.57.57 0 01-1.02 0l-.84-2.16-2.16-.84a.57.57 0 010-1.02l2.16-.84.84-2.16c.09-.21.29-.34.51-.34z" />
    </svg>
  )
}

function LearningRecommendations() {
  const { t } = useGlobalSettings()
  const { isVisited, isCompleted } = useLearningProgress()

  const progress: LearningProgressData = useMemo(() => {
    const visited = LEARNING_PATH.filter(n => isVisited(n.id)).map(n => n.id)
    const completed = LEARNING_PATH.filter(n => isCompleted(n.id)).map(n => n.id)
    let startedAt = new Date().toISOString()
    try {
      const stored = localStorage.getItem('ds-visualizer-learning-progress')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.startedAt) startedAt = parsed.startedAt
      }
    } catch { /* ignore */ }
    return { visited, completed, startedAt }
  }, [isVisited, isCompleted])

  const recommendations = useMemo(() => getRecommendations(progress), [progress])
  const advice = useMemo(() => getPersonalizedAdvice(progress), [progress])

  const adviceText = useMemo(() => {
    let text = t(advice.key)
    if (advice.params) {
      for (const [k, v] of Object.entries(advice.params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }, [advice, t])

  const actionLabel = (action: string) => {
    if (action === 'start') return t('recommendations.startLearning')
    if (action === 'continue') return t('recommendations.continueLearning')
    return t('recommendations.review')
  }

  return (
    <section className="mb-8 animate-slide-up" style={{ animationDelay: '180ms', animationFillMode: 'both' }}>
      <div className="border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-accent-amber flex items-center justify-center text-paper text-sm font-bold shadow-button dark:shadow-button-dark">
            ★
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-dark-ink">{t('recommendations.title')}</h2>
        </div>

        {/* Personalized Advice */}
        <div className="border-2 border-accent-amber/40 bg-accent-amber/5 dark:bg-accent-amber/10 p-3 mb-5">
          <div className="flex items-start gap-2">
            <SparklesIcon className="w-5 h-5 text-accent-amber flex-shrink-0" aria-hidden={true} />
            <div>
              <div className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light mb-1 uppercase tracking-widest">
                {t('recommendations.personalizedAdvice')}
              </div>
              <p className="text-sm text-ink dark:text-dark-ink leading-relaxed">{adviceText}</p>
            </div>
          </div>
        </div>

        {/* Recommended Modules */}
        {recommendations.length > 0 ? (
          <div>
            <div className="text-[10px] font-mono text-ink-light dark:text-dark-ink-light mb-3 uppercase tracking-widest">
              {t('recommendations.recommendedModules')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendations.map((rec, idx) => {
                const color = CATEGORY_COLORS[rec.node.category]
                const diffKey = DIFFICULTY_LABELS[rec.node.difficulty]
                return (
                  <Link
                    key={rec.node.id}
                    to={rec.node.path}
                    className="group block border-2 border-ink/20 dark:border-dark-border bg-paper dark:bg-dark-paper p-3 transition-all duration-200 hover:border-ink dark:hover:border-dark-border hover:-translate-y-0.5 hover:shadow-button dark:hover:shadow-button-dark"
                  >
                    {/* Rank badge + category dot */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-ink/5 dark:bg-dark-ink/10 text-ink-light dark:text-dark-ink-light">
                        #{idx + 1}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>

                    {/* Module name */}
                    <h3 className="text-sm font-bold text-ink dark:text-dark-ink mb-1 group-hover:text-accent-amber transition-colors">
                      {t(rec.node.nameKey)}
                    </h3>

                    {/* Reason */}
                    <p className="text-[11px] text-ink-light dark:text-dark-ink-light mb-2 leading-relaxed">
                      {t(rec.reasonKey)}
                    </p>

                    {/* Footer: difficulty + action */}
                    <div className="flex items-center justify-between pt-2 border-t border-ink/10 dark:border-dark-border/30">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-ink-light/60 dark:text-dark-ink-light/60">
                          {t('recommendations.difficulty')}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-ink-light dark:text-dark-ink-light">
                          {t(diffKey)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-accent-amber group-hover:translate-x-0.5 transition-transform">
                        {actionLabel(rec.action)} →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-ink-light dark:text-dark-ink-light">
            {t('recommendations.noRecommendations')}
          </div>
        )}
      </div>
    </section>
  )
}

export default memo(LearningRecommendations)
