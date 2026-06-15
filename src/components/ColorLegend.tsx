import { memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

export interface LegendItem {
  color: string
  labelKey: string
}

interface ColorLegendProps {
  items: LegendItem[]
  className?: string
}

function ColorLegend({ items, className = '' }: ColorLegendProps) {
  const { t } = useGlobalSettings()

  if (items.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {items.map(item => (
        <div key={item.labelKey} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-sm border border-black/15 dark:border-white/15 shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-ink-light/70 dark:text-dark-ink-light/70 font-mono text-[10px] whitespace-nowrap">
            {t(item.labelKey)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default memo(ColorLegend)
