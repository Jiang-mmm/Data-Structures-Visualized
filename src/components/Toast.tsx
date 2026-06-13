import { useToast, dismissToast } from './toastStore'
import { tStatic } from '../i18n/useI18n'

interface Toast {
  id: number
  type: string
  message: string
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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" aria-live={toasts.some(t => t.type === 'error') ? 'assertive' : 'polite'}>
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 text-sm font-bold animate-pop
            border-2 border-ink dark:border-dark-border
            shadow-[3px_3px_0px_#1a1a2e] dark:shadow-[3px_3px_0px_#334155]
            text-paper
            ${typeStyles[toast.type] || typeStyles.info}
          `}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="w-5 h-5 flex items-center justify-center text-paper/70 hover:text-paper transition-colors -mr-1"
            aria-label={tStatic('toast.dismissLabel')}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}