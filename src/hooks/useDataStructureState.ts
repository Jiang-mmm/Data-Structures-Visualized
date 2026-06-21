import { useState, useCallback, useEffect, useRef } from 'react'
import { showToast } from '../components/toastStore'
import { useHistory } from './useHistory'
import { tStatic } from '../i18n/useI18n'
import { validateStoredData } from '../utils/schema'

const STORAGE_PREFIX = 'ds-visualizer-data-'
const MAX_LOGS = 100
const STORAGE_WRITE_DEBOUNCE_MS = 150

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

function loadFromStorage<T>(key: string): T | null {
  const fullKey = getStorageKey(key)
  try {
    const stored = localStorage.getItem(fullKey)
    if (stored) {
      const parsed = JSON.parse(stored) as T
      if (validateStoredData(parsed).valid) return parsed
      // 数据无效或过期，清除本地副本以避免重复失败
      localStorage.removeItem(fullKey)
    }
  } catch {
    localStorage.removeItem(fullKey)
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
  codeStepId?: string
}

export interface DataStructureStateOptions {
  storageKey?: string
  abortAnimation?: () => void
}

export function useDataStructureState<T>(initialData: T, options: DataStructureStateOptions = {}) {
  const { storageKey, abortAnimation } = options

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

  // 防抖 localStorage 写入以避免过多 I/O
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef(data)

  useEffect(() => {
    dataRef.current = data
  }, [data])

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

  // 页面卸载前刷新待保存数据以防止数据丢失。
  // 仅在有待处理的防抖写入时保存；否则外部
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

  const addLog = useCallback((type: string, message: string, codeStepId?: string) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false })
    setLogs(prev => {
      const newLogs = [...prev, { time, type, message, codeStepId }]
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
    if (!canUndo()) return
    if (isAnimating) {
      abortAnimation?.()
      setIsAnimatingRaw(false)
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current)
        animTimeoutRef.current = null
      }
    }
    undo()
    addLog('info', tStatic('shortcuts.undo'))
    showToast({ type: 'info', message: tStatic('toast.undo') })
  }, [undo, canUndo, isAnimating, abortAnimation, addLog])

  const handleRedo = useCallback(() => {
    if (!canRedo()) return
    if (isAnimating) {
      abortAnimation?.()
      setIsAnimatingRaw(false)
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current)
        animTimeoutRef.current = null
      }
    }
    redo()
    addLog('info', tStatic('shortcuts.redo'))
    showToast({ type: 'info', message: tStatic('toast.redo') })
  }, [redo, canRedo, isAnimating, abortAnimation, addLog])

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
