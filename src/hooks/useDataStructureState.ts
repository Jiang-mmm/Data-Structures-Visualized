import { useState, useCallback, useEffect, useRef } from 'react'
import { showToast } from '../components/toastStore'
import { useHistory } from './useHistory'
import { tStatic } from '../i18n/useI18n'

const STORAGE_PREFIX = 'ds-visualizer-data-'

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

function isValidStoredData(data: unknown): boolean {
  if (data === null || data === undefined) return false
  if (Array.isArray(data)) return true
  if (typeof data === 'object') return true
  return false
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(getStorageKey(key))
    if (stored) {
      const parsed = JSON.parse(stored) as T
      if (isValidStoredData(parsed)) return parsed
    }
  } catch {
    return null
  }
  return null
}

function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data))
  } catch {
    /* storage full or unavailable */
  }
}

function clearFromStorage(key: string): void {
  try {
    localStorage.removeItem(getStorageKey(key))
  } catch {
    /* ignore */
  }
}

export interface LogEntry {
  time: string
  type: string
  message: string
}

export interface DataStructureStateOptions {
  storageKey?: string
}

export function useDataStructureState<T>(initialData: T, options: DataStructureStateOptions = {}) {
  const { storageKey } = options

  const [effectiveInitial] = useState<T>(() => {
    const storedData = storageKey ? loadFromStorage<T>(storageKey) : null
    return storedData !== null ? storedData : initialData
  })

  const { state: data, push: basePush, undo, redo, reset: resetHistory, canUndo, canRedo, getHistory, getCurrentIndex, getUndoPreview, getRedoPreview } = useHistory<T>(effectiveInitial)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isAnimating, setIsAnimatingRaw] = useState<boolean>(false)
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setIsAnimating = useCallback((value: boolean) => {
    setIsAnimatingRaw(value)
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current)
      animTimeoutRef.current = null
    }
    if (value) {
      animTimeoutRef.current = setTimeout(() => {
        setIsAnimatingRaw(false)
        animTimeoutRef.current = null
      }, 15000)
    }
  }, [])

  useEffect(() => {
    if (storageKey && data !== null) {
      saveToStorage(storageKey, data)
    }
  }, [storageKey, data])

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [])

  const addLog = useCallback((type: string, message: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setLogs(prev => [...prev, { time, type, message }])
  }, [])

  const push = useCallback((newState: T) => {
    basePush(newState)
  }, [basePush])

  const reset = useCallback(() => {
    setIsAnimatingRaw(false)
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current)
      animTimeoutRef.current = null
    }
    resetHistory(initialData)
    setLogs([])
    if (storageKey) clearFromStorage(storageKey)
    showToast({ type: 'info', message: tStatic('toast.reset') })
  }, [resetHistory, initialData, storageKey])

  const handleUndo = useCallback(() => {
    if (isAnimating || !canUndo()) return
    undo()
    addLog('info', tStatic('shortcuts.undo'))
    showToast({ type: 'info', message: tStatic('toast.undo') })
  }, [undo, canUndo, isAnimating, addLog])

  const handleRedo = useCallback(() => {
    if (isAnimating || !canRedo()) return
    redo()
    addLog('info', tStatic('shortcuts.redo'))
    showToast({ type: 'info', message: tStatic('toast.redo') })
  }, [redo, canRedo, isAnimating, addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const loadData = useCallback((newData: T) => {
    resetHistory(newData)
    setLogs([])
    showToast({ type: 'info', message: tStatic('toast.dataImported') })
  }, [resetHistory])

  const clearPersist = useCallback(() => {
    if (storageKey) {
      clearFromStorage(storageKey)
      showToast({ type: 'info', message: tStatic('toast.persistenceCleared') })
    }
  }, [storageKey])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    push,
    addLog,
    reset,
    clearLogs,
    loadData,
    clearPersist,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
    getHistory,
    getCurrentIndex,
    getUndoPreview,
    getRedoPreview,
  }
}
