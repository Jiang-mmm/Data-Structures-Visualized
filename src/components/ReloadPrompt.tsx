import { memo } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

/**
 * ReloadPrompt: PWA 新版本可用时的提示卡片。
 * 当 Service Worker 检测到新版本时，在右下角显示提示，
 * 用户可选择刷新（应用新版本）或关闭（稍后再说）。
 */
function ReloadPrompt() {
  const { t } = useGlobalSettings()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  // 无需刷新时隐藏
  if (!needRefresh) return null

  const handleClose = () => setNeedRefresh(false)
  const handleReload = () => updateServiceWorker(true)

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      role="status"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-2 px-4 py-3 bg-paper dark:bg-dark-paper border-2 border-ink dark:border-dark-border shadow-button-hover dark:shadow-button-dark-hover">
        <span className="text-sm font-mono font-bold text-ink dark:text-dark-ink">
          {t('pwa.updateAvailable')}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReload}
            aria-label={t('pwa.reload')}
            className="px-3 py-1 bg-accent-blue text-paper border-2 border-ink dark:border-dark-border shadow-button dark:shadow-button-dark text-xs font-mono font-bold hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {t('pwa.reload')}
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('pwa.close')}
            className="px-3 py-1 bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink border-2 border-ink dark:border-dark-border shadow-button dark:shadow-button-dark text-xs font-mono font-bold hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            {t('pwa.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ReloadPrompt)
