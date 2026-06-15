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
    success: 'border-accent-emerald bg-accent-emerald',
    error: 'border-accent-rose bg-accent-rose',
    warning: 'border-accent-amber bg-accent-amber',
    info: 'border-accent-blue bg-accent-blue',
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm" role={toasts.some(t => t.type === 'error') ? 'alert' : 'status'} aria-live={toasts.some(t => t.type === 'error') ? 'assertive' : 'polite'}>
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3.5 text-sm font-bold animate-slide-up
            border-2 border-ink dark:border-dark-border
            shadow-card dark:shadow-card-dark
            text-paper
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