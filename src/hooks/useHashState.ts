import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

interface HashEntry {
  key: number
  value: string
}

const BUCKET_COUNT = 7
const INITIAL_DATA: HashEntry[] = [
  { key: 12, value: 'Alice' },
  { key: 25, value: 'Bob' },
  { key: 42, value: 'Charlie' },
  { key: 19, value: 'Diana' },
]

function hashFn(key: number): number {
  return key % BUCKET_COUNT
}

export function useHashState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<HashEntry[]>(INITIAL_DATA, { storageKey: 'hash' })

  const insert = useCallback((key: string | number, value: string): boolean => {
    const { valid, value: safeKey } = validateNumericInput(key)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('errors.invalidRange').replace('{min}', '1').replace('{max}', '99') })
      addLog('error', tStatic('hooks.hashKeyInvalid'))
      return false
    }

    const existing = data.find(entry => entry.key === safeKey)
    if (existing) {
      const newData = data.map(e => e.key === safeKey ? { ...e, value } : e)
      push(newData)
      addLog('oper', tStatic('hooks.hashLogInsertUpdate').replace('{key}', String(safeKey)).replace('{value}', value).replace('{hash}', String(hashFn(safeKey))), 'insert')
      showToast({ type: 'info', message: tStatic('hooks.hashKeyUpdated').replace('{key}', String(safeKey)) })
      return true
    }

    const newData = [...data, { key: safeKey, value }]
    push(newData)
    addLog('oper', tStatic('hooks.hashLogInsertSuccess').replace('{key}', String(safeKey)).replace('{value}', value).replace('{hash}', String(hashFn(safeKey))), 'insert')
    addLog('code', `index = key % ${BUCKET_COUNT}; table[index].push({key, value})`)
    showToast({ type: 'success', message: tStatic('hooks.hashInsertSuccess').replace('{bucket}', String(hashFn(safeKey))) })
    return true
  }, [data, push, addLog])

  const remove = useCallback((key: string | number): boolean => {
    const { valid, value: safeKey } = validateNumericInput(key)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('errors.invalidRange').replace('{min}', '1').replace('{max}', '99') })
      return false
    }

    const idx = data.findIndex(entry => entry.key === safeKey)
    if (idx === -1) {
      showToast({ type: 'warning', message: tStatic('hooks.hashKeyNotFound').replace('{key}', String(safeKey)) })
      addLog('oper', tStatic('hooks.hashLogDeleteNotFound').replace('{key}', String(safeKey)), 'remove')
      return false
    }

    const newData = [...data]
    newData.splice(idx, 1)
    push(newData)
    addLog('oper', tStatic('hooks.hashLogDeleteSuccess').replace('{key}', String(safeKey)).replace('{hash}', String(hashFn(safeKey))), 'remove')
    showToast({ type: 'success', message: tStatic('hooks.hashDeleteSuccess').replace('{key}', String(safeKey)) })
    return true
  }, [data, push, addLog])

  const search = useCallback((key: string | number): HashEntry | null => {
    const { valid, value: safeKey } = validateNumericInput(key)
    if (!valid) return null

    const entry = data.find(e => e.key === safeKey)
    if (entry) {
      addLog('oper', tStatic('hooks.hashLogSearchFound').replace('{key}', String(safeKey)).replace('{value}', entry.value).replace('{bucket}', String(hashFn(safeKey))), 'search')
      showToast({ type: 'success', message: `${safeKey} → "${entry.value}"` })
    } else {
      addLog('oper', tStatic('hooks.hashLogSearchNotFound').replace('{key}', String(safeKey)), 'search')
      showToast({ type: 'warning', message: tStatic('hooks.hashKeyNotFound').replace('{key}', String(safeKey)) })
    }
    return entry || null
  }, [data, addLog])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    remove,
    search,
    reset,
    loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
    bucketCount: BUCKET_COUNT,
    entryCount: data.length,
    hashFn,
  }
}
