import { memo } from 'react'

interface StatItem {
  label: string
  value: string | number
  color?: string
}

interface StatsOverlayProps {
  stats: StatItem[]
  className?: string
}

function StatsOverlay({ stats, className = '' }: StatsOverlayProps) {
  if (stats.length === 0) return null

  return (
    <div className={`absolute top-3 left-3 z-10 flex items-center gap-2 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-1.5 px-2 py-1 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-sm border-2 border-ink/20 dark:border-dark-border/40 shadow-hard-sm dark:shadow-button-dark"
        >
          <span className="font-mono text-[10px] text-ink-light/60 dark:text-dark-ink-light/60 uppercase tracking-wider">
            {stat.label}
          </span>
          <span
            className="font-mono text-sm font-bold text-accent-blue"
            style={stat.color ? { color: stat.color } : undefined}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default memo(StatsOverlay)

export type { StatItem }
