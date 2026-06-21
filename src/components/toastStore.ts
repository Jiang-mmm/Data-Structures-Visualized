import { useCallback, useSyncExternalStore } from 'react'

export type ToastType = 'error' | 'success' | 'warning' | 'info'

export interface ToastOptions {
  type: ToastType
  message: string
  duration?: number
  /** 错误来源模块（如模块标题），仅在 type='error' 时用于前缀 */
  module?: string
  /** 错误来源操作（如操作按钮文本），仅在 type='error' 时用于前缀 */
  operation?: string
}

export interface Toast extends ToastOptions {
  id: number
}

interface ToastCleanup {
  id: number
  cleanup: () => void
}

type Listener = () => void

let toastId = 0
const MAX_TOASTS = 5

let toasts: Toast[] = []
const listeners = new Set<Listener>()

function emitChange() {
  listeners.forEach(listener => listener())
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function getSnapshot(): Toast[] {
  return toasts
}

export function formatErrorMessage(message: string, module?: string, operation?: string): string {
  if (!module && !operation) return message
  const parts: string[] = []
  if (module) parts.push(module)
  if (operation) parts.push(operation)
  return `[${parts.join(' / ')}] ${message}`
}

export function showToast(options: ToastOptions): ToastCleanup {
  const id = ++toastId
  const duration = options.duration || 3000
  const message = options.type === 'error'
    ? formatErrorMessage(options.message, options.module, options.operation)
    : options.message
  toasts = [...toasts, { ...options, message, id }]
  while (toasts.length > MAX_TOASTS) {
    toasts = toasts.slice(1)
  }
  emitChange()
  const timerId = setTimeout(() => dismissToast(id), duration)
  return { id, cleanup: () => { clearTimeout(timerId); dismissToast(id) } }
}

export function dismissToast(id: number): void {
  toasts = toasts.filter(t => t.id !== id)
  emitChange()
}

export function useToast() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot)

  const toast = useCallback((options: ToastOptions): ToastCleanup => {
    return showToast(options)
  }, [])

  return { toasts: currentToasts, toast }
}
