import { useState, useCallback, useEffect, useRef, memo } from 'react'
import { showToast } from './toastStore'
import { encodeData } from '../utils/shareUtils'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface ShareButtonProps {
  data: unknown
  dataType: string
  disabled?: boolean
}

export default memo(function ShareButton({ data, dataType, disabled = false }: ShareButtonProps) {
  const { t } = useGlobalSettings()
  const [showTooltip, setShowTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleShare = useCallback(async () => {
    if (disabled || !data) return

    const encoded = encodeData(data)
    if (!encoded) {
      showToast({ type: 'error', message: t('share.generateFailed') })
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set('data', encoded)
    url.searchParams.set('type', dataType)

    try {
      await navigator.clipboard.writeText(url.toString())
      showToast({ type: 'success', message: t('share.copied') })
      setShowTooltip(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowTooltip(false), 2000)
    } catch {
      showToast({ type: 'warning', message: t('share.copyManually') })
      setShowTooltip(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowTooltip(false), 5000)
    }
  }, [data, dataType, disabled])

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        disabled={disabled}
        title={t('share.generateLink')}
        aria-label={t('share.generateLink')}
        className={`
          px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold
          border-2 border-ink dark:border-dark-border
          bg-white dark:bg-slate text-ink dark:text-dark-ink
          shadow-button dark:shadow-button-dark
          transition-all duration-200
          hover:bg-paper-warm dark:hover:bg-slate-light hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
          active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-sm">⛓</span>
          <span className="hidden sm:inline">{t('share.label')}</span>
        </span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper px-3 py-2 border-2 border-ink dark:border-dark-border shadow-button-hover dark:shadow-button-dark-hover text-xs font-mono font-bold whitespace-nowrap">
            {t('share.linkCopied')}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-ink dark:border-t-dark-ink" />
        </div>
      )}
    </div>
  )
})