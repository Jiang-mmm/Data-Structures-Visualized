import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [10, 20, 30]
const MAX_SIZE = 10

export function useQueueState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'queue' })

  const enqueue = useCallback((value: string | number): boolean => {
    if (data.length >= MAX_SIZE) {
      showToast({ type: 'error', message: tStatic('hooks.queueFull').replace('{max}', String(MAX_SIZE)) })
      return false
    }
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return false
    }
    const newData = [...data, safeValue]
    push(newData)
    addLog('oper', tStatic('hooks.queueLogEnqueue').replace('{value}', String(safeValue)).replace('{tail}', String(safeValue)).replace('{size}', String(newData.length)))
    showToast({ type: 'success', message: tStatic('hooks.queueEnqueueSuccess').replace('{value}', String(safeValue)) })
    return true
  }, [data, push, addLog])

  const dequeue = useCallback((): number | null => {
    if (data.length === 0) {
      showToast({ type: 'error', message: tStatic('hooks.queueEmpty') })
      return null
    }
    const newData = data.slice(1)
    push(newData)
    addLog('oper', tStatic('hooks.queueLogDequeue').replace('{value}', String(data[0])).replace('{size}', String(newData.length)))
    showToast({ type: 'success', message: tStatic('hooks.queueDequeueSuccess').replace('{value}', String(data[0])) })
    return data[0]
  }, [data, push, addLog])

  const front = useCallback((): number | null => {
    if (data.length === 0) {
      showToast({ type: 'warning', message: tStatic('hooks.queueEmpty') })
      return null
    }
    addLog('oper', tStatic('hooks.queueLogFront').replace('{value}', String(data[0])))
    showToast({ type: 'info', message: tStatic('hooks.queueFront').replace('{value}', String(data[0])) })
    return data[0]
  }, [data, addLog])

  const clear = useCallback((): void => {
    push([])
    addLog('oper', tStatic('hooks.queueLogClear'))
    showToast({ type: 'info', message: tStatic('hooks.queueCleared') })
  }, [push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    enqueue, dequeue, front, clear, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
    size: data.length,
  }
}
