import { useState, useEffect, useRef, memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

function NetworkStatus() {
  const { t } = useGlobalSettings()
  // 初始状态直接读取 navigator.onLine，避免在 effect 中调用 setState
  const [showOffline, setShowOffline] = useState<boolean>(() => typeof navigator !== 'undefined' && !navigator.onLine)
  const [showReconnected, setShowReconnected] = useState<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleOnline = (): void => {
      setShowOffline(false)
      setShowReconnected(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = (): void => {
      setShowOffline(true)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

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
}

export default memo(NetworkStatus)
