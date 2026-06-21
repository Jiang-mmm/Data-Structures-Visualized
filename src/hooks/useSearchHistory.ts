import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'ds-visualizer:search-history'
const MAX_HISTORY = 10

/**
 * 读取本地持久化的搜索历史
 */
function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_HISTORY)
  } catch {
    return []
  }
}

/**
 * 保存搜索历史到 localStorage
 */
function saveHistory(history: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  } catch {}
}

/**
 * 全局搜索历史 Hook
 *
 * 提供搜索历史的读取、添加、删除、清空，并自动持久化到 localStorage。
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => loadHistory())

  // 持久化
  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addHistory = useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    setHistory(prev => {
      const next = [trimmed, ...prev.filter(item => item !== trimmed)]
      return next.slice(0, MAX_HISTORY)
    })
  }, [])

  const removeHistory = useCallback((query: string) => {
    setHistory(prev => prev.filter(item => item !== query))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
  }
}
