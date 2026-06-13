interface ProgressBarProps {
  progress: number
  label?: string
  height?: string
}

export default function ProgressBar({ progress, label, height = 'h-2' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress))

  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`${height} flex-1 bg-ink/10 dark:bg-dark-ink/10 rounded-full overflow-hidden border border-ink/20 dark:border-dark-border/30`}
      >
        <div
          className={`${height} bg-accent-blue rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {label && <span className="text-xs text-ink-light dark:text-dark-ink-light whitespace-nowrap font-mono tabular-nums">{label}</span>}
    </div>
  )
}