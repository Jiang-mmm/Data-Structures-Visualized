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
    <div className="absolute inset-0 flex items-center justify-center bg-paper/80 dark:bg-dark-paper/80 backdrop-blur-sm z-10 pointer-events-none animate-fade-in">
      <div className="text-center p-8 pointer-events-auto animate-pop">
        <div className="text-5xl mb-4 opacity-60">{icon}</div>
        <h3 className="text-lg font-bold text-ink dark:text-dark-ink mb-2">{displayTitle}</h3>
        <p className="text-sm text-ink-light dark:text-dark-ink-light mb-6">{displayDesc}</p>
        {onFill && (
          <OperationButton variant="primary" onClick={onFill} popAnimation>
            {label}
          </OperationButton>
        )}
      </div>
    </div>
  )
}
