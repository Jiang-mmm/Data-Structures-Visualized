import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { showToast } from './toastStore'

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
  name: string
}

const SHORTCUT_MAP: Record<string, Shortcut> = {
  undo: { key: 'Ctrl + Z', descKey: 'shortcuts.undo', name: 'undo' },
  redo: { key: 'Ctrl + Shift + Z', descKey: 'shortcuts.redo', name: 'redo' },
  reset: { key: 'R', descKey: 'shortcuts.reset', name: 'reset' },
  pause: { key: 'Space', descKey: 'shortcuts.pause', name: 'pause' },
  help: { key: '?', descKey: 'shortcuts.toggleHelp', name: 'help' },
}

// 所有快捷键（搜索时使用）
const ALL_SHORTCUT_NAMES = Object.keys(SHORTCUT_MAP)

export default function KeyboardHelp() {
  const [visible, setVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useGlobalSettings()
  const location = useLocation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const currentPageShortcuts = useMemo(() => {
    const pageKeys = PAGE_SHORTCUTS[location.pathname] || ['reset', 'help']
    return pageKeys.map(k => SHORTCUT_MAP[k])
  }, [location.pathname])

  // 搜索结果：在所有快捷键中模糊匹配
  const displayedShortcuts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return currentPageShortcuts

    return ALL_SHORTCUT_NAMES
      .map(name => SHORTCUT_MAP[name])
      .filter(s => {
        // 匹配快捷键名称（如 "undo"）、按键（如 "Ctrl + Z"）、描述文案
        const desc = t(s.descKey).toLowerCase()
        return (
          s.name.toLowerCase().includes(query) ||
          s.key.toLowerCase().includes(query) ||
          desc.includes(query)
        )
      })
  }, [searchQuery, currentPageShortcuts, t])

  const isSearching = searchQuery.trim().length > 0

  // First-visit hint for keyboard shortcuts
  useEffect(() => {
    if (location.pathname === '/') return
    const hintKey = 'ds-keyboard-hint-shown'
    try {
      if (!localStorage.getItem(hintKey)) {
        const timer = setTimeout(() => {
          showToast({ type: 'info', message: `${t('shortcuts.title')}：按 ? 键查看` })
          localStorage.setItem(hintKey, '1')
        }, 3000)
        return () => clearTimeout(timer)
      }
    } catch {}
  }, [location.pathname, t])

  const close = useCallback(() => {
    setVisible(false)
    setSearchQuery('')
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

  // 面板打开时自动聚焦搜索框
  useEffect(() => {
    if (visible && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [visible])

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

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 dark:bg-dark-ink/60 backdrop-blur-sm animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={t('shortcuts.title')}
    >
      <div ref={dialogRef} className="bg-surface dark:bg-dark-surface border-2 border-ink dark:border-dark-border shadow-card dark:shadow-card-dark p-7 max-w-sm w-full mx-4 animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-ink dark:text-dark-ink flex items-center gap-2">
            <span className="w-8 h-8 bg-accent-blue flex items-center justify-center text-paper text-sm shadow-button dark:shadow-button-dark">⌨</span>
            {t('shortcuts.title')}
          </h3>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center border-2 border-ink/20 dark:border-dark-border text-ink-light dark:text-dark-ink-light hover:bg-accent-blue hover:text-paper hover:border-accent-blue transition-all duration-200"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('shortcuts.searchPlaceholder')}
            className="w-full px-3 py-2 text-sm border-2 border-ink/20 dark:border-dark-border bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink placeholder:text-ink-light/50 dark:placeholder:text-dark-ink-light/50 focus:outline-none focus:border-accent-blue transition-colors"
            aria-label={t('shortcuts.searchPlaceholder')}
          />
        </div>
        <div className="text-xs text-ink-light/70 dark:text-dark-ink-light/70 mb-2 px-1">
          {isSearching ? t('shortcuts.allShortcuts') : t('shortcuts.currentPage')}
        </div>
        {displayedShortcuts.length === 0 ? (
          <div className="py-6 text-center text-sm text-ink-light dark:text-dark-ink-light">
            {t('shortcuts.noResults')}
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedShortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-2.5 px-3 border border-border/50 dark:border-dark-border/50 hover:bg-muted/50 dark:hover:bg-dark-muted/30 transition-colors">
                <kbd className="px-2.5 py-1 bg-surface dark:bg-dark-surface border-2 border-ink/20 dark:border-dark-border text-xs font-mono font-bold text-ink dark:text-dark-ink shadow-[1px_1px_0px_rgba(26,26,46,0.1)]">{s.key}</kbd>
                <span className="text-sm text-ink-light dark:text-dark-ink-light">{t(s.descKey)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-5 text-xs text-ink-light/50 dark:text-dark-ink-light/50 text-center">{t('shortcuts.close')}</p>
      </div>
    </div>
  )
}
