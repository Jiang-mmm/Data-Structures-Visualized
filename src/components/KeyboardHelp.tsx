import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

const PAGE_SHORTCUTS: Record<string, string[]> = {
  '/array': ['undo', 'redo', 'reset', 'help'],
  '/stack': ['undo', 'redo', 'reset', 'help'],
  '/queue': ['undo', 'redo', 'reset', 'help'],
  '/linkedlist': ['undo', 'redo', 'reset', 'help'],
  '/tree': ['undo', 'redo', 'reset', 'help'],
  '/graph': ['undo', 'redo', 'reset', 'help'],
  '/hash': ['undo', 'redo', 'reset', 'help'],
  '/heap': ['undo', 'redo', 'reset', 'help'],
  '/trie': ['undo', 'redo', 'reset', 'help'],
  '/sort': ['pause', 'reset', 'help'],
  '/compare': ['pause', 'reset', 'help'],
}

interface Shortcut {
  key: string
  descKey: string
}

const SHORTCUT_MAP: Record<string, Shortcut> = {
  undo: { key: 'Ctrl + Z', descKey: 'shortcuts.undo' },
  redo: { key: 'Ctrl + Shift + Z', descKey: 'shortcuts.redo' },
  reset: { key: 'R', descKey: 'shortcuts.reset' },
  pause: { key: 'Space', descKey: 'shortcuts.pause' },
  help: { key: '?', descKey: 'shortcuts.toggleHelp' },
}

export default function KeyboardHelp() {
  const [visible, setVisible] = useState(false)
  const { t } = useGlobalSettings()
  const location = useLocation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const shortcuts = useMemo(() => {
    const pageKeys = PAGE_SHORTCUTS[location.pathname] || ['reset', 'help']
    return pageKeys.map(k => SHORTCUT_MAP[k])
  }, [location.pathname])

  const close = useCallback(() => {
    setVisible(false)
    previousFocusRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable
      if (isInput) return

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        setVisible((v) => {
          if (!v) previousFocusRef.current = document.activeElement as HTMLElement
          return !v
        })
      }
      if (e.key === 'Escape') {
        close()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [close])

  useEffect(() => {
    if (!visible || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length > 0) focusable[0].focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 dark:bg-dark-ink/50 animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={t('shortcuts.title')}
    >
      <div ref={dialogRef} className="bg-paper dark:bg-slate border-2 border-ink dark:border-dark-border shadow-[4px_4px_0px_#1a1a2e] dark:shadow-[4px_4px_0px_#334155] p-6 max-w-sm w-full mx-4 animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink dark:text-dark-ink">{t('shortcuts.title')}</h3>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center border-2 border-ink/30 dark:border-dark-border text-ink-light dark:text-dark-ink-light hover:bg-accent-rose hover:text-paper hover:border-accent-rose transition-all duration-200"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2 border-b border-border dark:border-dark-border">
              <kbd className="px-2 py-1 bg-white dark:bg-slate border border-ink dark:border-dark-border text-xs font-mono font-bold text-ink dark:text-dark-ink">{s.key}</kbd>
              <span className="text-sm text-ink-light dark:text-dark-ink-light">{t(s.descKey)}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-light dark:text-dark-ink-light text-center">{t('shortcuts.close')}</p>
      </div>
    </div>
  )
}