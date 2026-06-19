import { useState, useCallback, useEffect, useRef } from 'react'
import { showToast } from '../components/toastStore'
import { useHistory } from './useHistory'
import { tStatic } from '../i18n/useI18n'

const STORAGE_PREFIX = 'ds-visualizer-data-'
const MAX_LOGS = 100
const STORAGE_WRITE_DEBOUNCE_MS = 150

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

function isValidStoredData(data: unknown): boolean {
  if (data === null || data === undefined) return false
  if (Array.isArray(data)) {
    if (data.length === 0) return false
    return data.every(item => {
      if (typeof item === 'number') return Number.isFinite(item)
      if (typeof item === 'object' && item !== null) return true
      return false
    })
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) return false
    // Validate that object values are safe JSON-like primitives/objects/arrays
    return keys.every(k => {
      const v = obj[k]
      if (v === null || v === undefined || typeof v === 'boolean' || typeof v === 'string') return true
      if (typeof v === 'number') return Number.isFinite(v)
      if (typeof v === 'object') return true
      return false
    })
  }
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
        showToast({ type: 'warning', message: tStatic('errors.animationTimeout') })
      }, 15000)
    }
  }, [])

  // Debounced localStorage write to avoid excessive I/O
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    if (!storageKey || data === null) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveToStorage(storageKey, dataRef.current)
      saveTimerRef.current = null
    }, STORAGE_WRITE_DEBOUNCE_MS)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [storageKey, data])

  // Flush pending save before page unload to prevent data loss.
  // Only save when there is a pending debounced write; otherwise external
  // modifications to localStorage (e.g. test setup) could be overwritten by
  // stale in-memory data during reload/navigation.
  useEffect(() => {
    if (!storageKey) return
    const handleBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
        saveToStorage(storageKey, dataRef.current)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => { window.removeEventListener('beforeunload', handleBeforeUnload) }
  }, [storageKey])

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [])

  const addLog = useCallback((type: string, message: string) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false })
    setLogs(prev => {
      const newLogs = [...prev, { time, type, message }]
      return newLogs.length > MAX_LOGS ? newLogs.slice(-MAX_LOGS) : newLogs
    })
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
