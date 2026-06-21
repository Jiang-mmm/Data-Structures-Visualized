import { useEffect, useCallback, useRef } from 'react'

type ShortcutMap = Record<string, () => void>

export function useKeyboard(shortcuts: ShortcutMap, enabled: boolean = true): void {
  const shortcutsRef = useRef<ShortcutMap>(shortcuts)
  const enabledRef = useRef<boolean>(enabled)

  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabledRef.current) return

    const tag = (e.target as HTMLElement).tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || (e.target as HTMLElement).isContentEditable
    const key = e.key.toLowerCase()
    const isCtrl = e.ctrlKey || e.metaKey
    const isShift = e.shiftKey

    for (const [combo, action] of Object.entries(shortcutsRef.current)) {
      const parts = combo.split('+')
      const comboKey = parts[parts.length - 1].toLowerCase()
      const needsCtrl = parts.includes('ctrl') || parts.includes('cmd')
      const needsShift = parts.includes('shift')

      // 输入框聚焦时跳过非 Ctrl 快捷键；Ctrl+Z/Y 等撤销/重做快捷键也跳过，避免与浏览器原生行为冲突
      if (isInput && !needsCtrl) continue
      if (isInput && needsCtrl && (key === 'z' || key === 'y')) continue

      if (key === comboKey && isCtrl === needsCtrl && isShift === needsShift) {
        e.preventDefault()
        action()
        return
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const DEFAULT_SHORTCUTS: Record<string, Record<string, string>> = {
  array: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  stack: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  queue: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  linkedlist: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  tree: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  graph: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  hash: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  heap: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  trie: { undo: 'ctrl+z', redo: 'ctrl+shift+z', reset: 'r', help: '?' },
  sort: { pause: ' ', reset: 'r', help: '?' },
  compare: { pause: ' ', reset: 'r', help: '?' },
}
