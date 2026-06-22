import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { showToast } from './toastStore'
import { fuzzyMatchAny } from '../utils/fuzzySearch'
import Icon from './Icon'

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

// 页面路径到页面名称 i18n key 的映射（用于搜索结果中标识所属页面）
const PAGE_NAMES: Record<string, string> = {
  '/array': 'array.title',
  '/stack': 'stack.title',
  '/queue': 'queue.title',
  '/linkedlist': 'linkedlist.title',
  '/tree': 'tree.title',
  '/graph': 'graph.title',
  '/hash': 'hash.title',
  '/heap': 'heap.title',
  '/trie': 'trie.title',
  '/sort': 'sort.title',
  '/compare': 'compare.title',
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
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useGlobalSettings()
  const location = useLocation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const shortcuts = useMemo(() => {
    const pageKeys = PAGE_SHORTCUTS[location.pathname] || ['reset', 'help']
    return pageKeys.map(k => SHORTCUT_MAP[k])
  }, [location.pathname])

  // 构建全部页面快捷键的扁平列表（用于跨页面搜索）
  const allShortcuts = useMemo(() => {
    const list: { page: string; shortcut: Shortcut }[] = []
    for (const [page, keys] of Object.entries(PAGE_SHORTCUTS)) {
      for (const k of keys) {
        const shortcut = SHORTCUT_MAP[k]
        if (shortcut) list.push({ page, shortcut })
      }
    }
    return list
  }, [])

  // 搜索过滤：对快捷键、描述、页面名做模糊匹配，按分数降序排列
  // 返回 null 表示搜索为空（展示当前页面快捷键），返回空数组表示无匹配
  const searchResults = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return null
    const results: { page: string; shortcut: Shortcut; score: number }[] = []
    for (const item of allShortcuts) {
      const pageName = PAGE_NAMES[item.page] ? t(PAGE_NAMES[item.page]) : item.page
      const { matched, score } = fuzzyMatchAny(query, [
        item.shortcut.key,
        t(item.shortcut.descKey),
        pageName,
      ])
      if (matched) {
        results.push({ page: item.page, shortcut: item.shortcut, score })
      }
    }
    results.sort((a, b) => b.score - a.score)
    return results
  }, [searchQuery, allShortcuts, t])

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
            <span className="w-8 h-8 bg-accent-blue flex items-center justify-center text-paper text-sm shadow-button dark:shadow-button-dark"><Icon name="keyboard" size={14} /></span>
            {t('shortcuts.title')}
          </h3>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center border-2 border-ink/20 dark:border-dark-border text-ink-light dark:text-dark-ink-light hover:bg-accent-blue hover:text-paper hover:border-accent-blue transition-all duration-200"
            aria-label={t('common.close')}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
        {/* 搜索框 */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('shortcuts.searchPlaceholder')}
            aria-label={t('shortcuts.searchPlaceholder')}
            className="w-full px-3 py-2 pr-8 border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface text-sm text-ink dark:text-dark-ink placeholder:text-ink-light/50 dark:placeholder:text-dark-ink-light/50 focus:outline-none focus:border-accent-blue shadow-[2px_2px_0px_rgba(26,26,46,0.15)] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.1)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-xs text-ink-light dark:text-dark-ink-light hover:text-ink dark:hover:text-dark-ink"
              aria-label={t('common.clear')}
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
        {searchResults === null ? (
          /* 搜索为空：展示当前页面快捷键（保持原有行为） */
          <div className="space-y-2.5">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-2.5 px-3 border border-border/50 dark:border-dark-border/50 hover:bg-muted/50 dark:hover:bg-dark-muted/30 transition-colors">
                <kbd className="px-2.5 py-1 bg-surface dark:bg-dark-surface border-2 border-ink/20 dark:border-dark-border text-xs font-mono font-bold text-ink dark:text-dark-ink shadow-[1px_1px_0px_rgba(26,26,46,0.1)]">{s.key}</kbd>
                <span className="text-sm text-ink-light dark:text-dark-ink-light">{t(s.descKey)}</span>
              </div>
            ))}
          </div>
        ) : searchResults.length === 0 ? (
          /* 无匹配结果 */
          <p className="text-sm text-ink-light dark:text-dark-ink-light text-center py-4">{t('shortcuts.searchNoResults')}</p>
        ) : (
          /* 搜索结果：跨全部页面，带页面名标识 */
          <div className="space-y-2.5">
            <p className="text-xs text-ink-light/70 dark:text-dark-ink-light/70 mb-1">{t('shortcuts.allShortcuts')}</p>
            {searchResults.map(({ page, shortcut }) => (
              <div key={`${page}-${shortcut.key}`} className="flex items-center justify-between py-2.5 px-3 border border-border/50 dark:border-dark-border/50 hover:bg-muted/50 dark:hover:bg-dark-muted/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <kbd className="kbd">{shortcut.key}</kbd>
                  <span className="text-xs px-1.5 py-0.5 border border-ink/20 dark:border-dark-border/50 text-ink-light dark:text-dark-ink-light whitespace-nowrap">{PAGE_NAMES[page] ? t(PAGE_NAMES[page]) : page}</span>
                </div>
                <span className="text-sm text-ink-light dark:text-dark-ink-light text-right">{t(shortcut.descKey)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-5 text-xs text-ink-light/50 dark:text-dark-ink-light/50 text-center">{t('shortcuts.close')}</p>
      </div>
    </div>
  )
}