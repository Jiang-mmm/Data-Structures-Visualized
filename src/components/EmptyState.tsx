import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { OperationButton } from './OperationBar'

interface EmptyStateProps {
  icon?: string
  titleKey?: string
  title?: string
  descriptionKey?: string
  description?: string
  onFill?: () => void
  fillKey?: string
}

export default function EmptyState({ icon = '📭', titleKey = 'emptyState.defaultTitle', title, descriptionKey = 'emptyState.defaultDesc', description, onFill, fillKey = 'emptyState.fill' }: EmptyStateProps) {
  const { t } = useGlobalSettings()
  const displayTitle = title || t(titleKey)
  const displayDesc = description || t(descriptionKey)
  const label = t(fillKey)

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-paper/70 dark:bg-dark-paper/70 backdrop-blur-md z-10 pointer-events-none animate-fade-in">
      <div className="text-center p-10 pointer-events-auto animate-pop max-w-sm">
        <div className="relative inline-block mb-6">
          <div className="text-6xl opacity-50 animate-float" aria-hidden="true">{icon}</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-ink/10 dark:bg-dark-ink/10 rounded-full blur-sm" />
        </div>
        <h3 className="text-xl font-bold text-ink dark:text-dark-ink mb-3">{displayTitle}</h3>
        <p className="text-sm text-ink-light dark:text-dark-ink-light mb-8 leading-relaxed">{displayDesc}</p>
        {onFill && (
          <OperationButton variant="primary" onClick={onFill} popAnimation>
            {label}
          </OperationButton>
        )}
      </div>
    </div>
  )
}
