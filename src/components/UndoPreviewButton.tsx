import { useState, memo, useCallback, ReactNode } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface UndoPreviewButtonProps {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'success' | 'danger' | 'outline'
  previewData?: any
  previewLabel?: string
  children: ReactNode
  className?: string
}

function formatPreviewData(data: any, t: (key: string) => string): string {
  if (data === null || data === undefined) return t('undoPreview.noData')
  if (Array.isArray(data)) {
    if (data.length === 0) return t('undoPreview.emptyArray')
    const preview = data.slice(0, 8).map(item => {
      if (typeof item === 'object' && item !== null) {
        return item.value ?? item.key ?? JSON.stringify(item).slice(0, 10)
      }
      return String(item)
    }).join(', ')
    return data.length > 8 ? `[${preview}, ...]` : `[${preview}]`
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (keys.length === 0) return t('undoPreview.emptyObject')
    return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''}}`
  }
  return String(data).slice(0, 30)
}

export default memo(function UndoPreviewButton({
  onClick,
  disabled,
  variant = 'outline',
  previewData,
  previewLabel,
  children,
  className = '',
}: UndoPreviewButtonProps) {
  const { t } = useGlobalSettings()
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const resolvedLabel = previewLabel ?? t('undoPreview.defaultLabel')

  const handleMouseEnter = useCallback(() => {
    if (!disabled && previewData !== undefined) {
      setShowPreview(true)
    }
  }, [disabled, previewData])

  const handleMouseLeave = useCallback(() => {
    setShowPreview(false)
  }, [])

  const variants = {
    primary: 'bg-accent-blue border-accent-blue text-paper hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    success: 'bg-accent-emerald border-accent-emerald text-paper hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    danger: 'bg-accent-rose border-accent-rose text-paper hover:bg-rose-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    outline: 'bg-white dark:bg-slate border-ink dark:border-dark-border text-ink dark:text-dark-ink hover:bg-paper-warm dark:hover:bg-slate-light hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold
          border-2
          shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
          transition-all duration-200
          active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0px_#1a1a2e] dark:disabled:active:shadow-[2px_2px_0px_#334155]
          ${variants[variant] || variants.outline}
          ${className}
        `}
      >
        {children}
      </button>

      {showPreview && previewData !== null && previewData !== undefined && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper px-3 py-2 border-2 border-ink dark:border-dark-border shadow-card dark:shadow-[4px_4px_0px_#334155] min-w-[160px] max-w-[240px]">
            <div className="text-[10px] font-mono text-paper/60 dark:text-dark-paper/60 mb-1">
              {resolvedLabel}
            </div>
            <div className="text-xs font-mono font-bold truncate">
              {formatPreviewData(previewData, t)}
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-ink dark:border-t-dark-ink" />
        </div>
      )}
    </div>
  )
})
