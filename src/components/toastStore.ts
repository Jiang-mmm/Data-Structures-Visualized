import { useState, useEffect, useCallback } from 'react'

export type ToastType = 'error' | 'success' | 'warning' | 'info'

export interface ToastOptions {
  type: ToastType
  message: string
  duration?: number
}

export interface Toast extends ToastOptions {
  id: number
}

interface ToastCleanup {
  id: number
  cleanup: () => void
}

type Listener = (toasts: Toast[]) => void

let toastId = 0
const MAX_TOASTS = 5

const toastStore = {
  listeners: new Set<Listener>(),
  toasts: [] as Toast[],
  add(toast: ToastOptions): ToastCleanup {
    const id = ++toastId
    const duration = toast.duration || 3000
    this.toasts.push({ ...toast, id })
    while (this.toasts.length > MAX_TOASTS) {
      const oldest = this.toasts[0]
      this.toasts.shift()
    }
    this.notify()
    const timerId = setTimeout(() => this.remove(id), duration)
    return { id, cleanup: () => { clearTimeout(timerId); this.remove(id) } }
  },
  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  },
  notify(): void {
    this.listeners.forEach(listener => listener([...this.toasts]))
  },
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])

  const toast = useCallback((options: ToastOptions): ToastCleanup => {
    return toastStore.add(options)
  }, [])

  return { toasts, toast }
}

export function showToast(options: ToastOptions): ToastCleanup {
  return toastStore.add(options)
}

export function dismissToast(id: number): void {
  toastStore.remove(id)
}
