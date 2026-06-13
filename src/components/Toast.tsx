import { useToast, dismissToast } from './toastStore'
import { tStatic } from '../i18n/useI18n'

interface Toast {
  id: number
  type: string
  message: string
}

const TYPE_ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  const typeStyles: Record<string, string> = {
    success: 'border-accent-emerald bg-gradient-to-r from-accent-emerald to-emerald-600',
    error: 'border-accent-rose bg-gradient-to-r from-accent-rose to-rose-600',
    warning: 'border-accent-amber bg-gradient-to-r from-accent-amber to-amber-600',
    info: 'border-accent-blue bg-gradient-to-r from-accent-blue to-blue-600',
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm" aria-live={toasts.some(t => t.type === 'error') ? 'assertive' : 'polite'}>
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3.5 text-sm font-bold animate-slide-up
            border-2 border-ink dark:border-dark-border
            shadow-[4px_4px_0px_#1a1a2e] dark:shadow-[4px_4px_0px_#334155]
            text-paper backdrop-blur-sm
            ${typeStyles[toast.type] || typeStyles.info}
          `}
        >
          <span className="w-5 h-5 flex items-center justify-center bg-paper/20 text-xs shrink-0">
            {TYPE_ICONS[toast.type] || TYPE_ICONS.info}
          </span>
          <span className="flex-1 text-[13px] leading-snug">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="w-6 h-6 flex items-center justify-center text-paper/60 hover:text-paper hover:bg-paper/10 transition-all -mr-1 shrink-0"
            aria-label={tStatic('toast.dismissLabel')}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}