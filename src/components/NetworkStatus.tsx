import { useState, useEffect, useRef, memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

export default memo(function NetworkStatus() {
  const { t } = useGlobalSettings()
  const [showOffline, setShowOffline] = useState<boolean>(false)
  const [showReconnected, setShowReconnected] = useState<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setShowOffline(false)
      setShowReconnected(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setShowOffline(true)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!navigator.onLine) {
      setShowOffline(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!showOffline && !showReconnected) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-slide-up" role="status" aria-live="polite">
      {showOffline && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-rose text-paper border-2 border-ink dark:border-dark-border shadow-button-hover dark:shadow-button-dark-hover text-xs font-mono font-bold">
          <span className="w-2 h-2 bg-paper animate-pulse" />
          <span>{t('network.offline')} · {t('network.offlineMode')}</span>
        </div>
      )}
      {showReconnected && (
        <div className="flex items-center gap-2 px-3 py-2 bg-accent-emerald text-paper border-2 border-ink dark:border-dark-border shadow-button-hover dark:shadow-button-dark-hover text-xs font-mono font-bold">
          <span className="w-2 h-2 bg-paper" />
          <span>{t('network.reconnected')}</span>
        </div>
      )}
    </div>
  )
})
