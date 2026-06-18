import { memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface AnimationDelayIndicatorProps {
  message?: string
}

export default memo(function AnimationDelayIndicator({ message }: AnimationDelayIndicatorProps) {
  const { t } = useGlobalSettings()
  const text = message || t('tree.animationStarting')
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-paper/80 dark:bg-dark-paper/80 z-20 pointer-events-none animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 p-6">
        <div className="w-10 h-10 border-4 border-ink/20 dark:border-dark-border/30 border-t-accent-blue rounded-full animate-spin" />
        <p className="text-sm font-bold text-ink dark:text-dark-ink">{text}</p>
      </div>
    </div>
  )
})
