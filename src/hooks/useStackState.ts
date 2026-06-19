import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [8, 17, 42]
const MAX_SIZE = 10

export function useStackState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'stack' })

  const pushValue = useCallback((value: string | number): boolean => {
    if (data.length >= MAX_SIZE) {
      showToast({ type: 'error', message: tStatic('hooks.stackFull').replace('{max}', String(MAX_SIZE)) })
      return false
    }
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return false
    }
    const newData = [...data, safeValue]
    push(newData)
    addLog('oper', tStatic('hooks.stackLogPush').replace('{value}', String(safeValue)).replace('{top}', String(safeValue)).replace('{size}', String(newData.length)), 'push')
    showToast({ type: 'success', message: tStatic('hooks.stackPushSuccess').replace('{value}', String(safeValue)) })
    return true
  }, [data, push, addLog])

  const pop = useCallback((): number | null => {
    if (data.length === 0) {
      showToast({ type: 'error', message: tStatic('hooks.stackEmpty') })
      return null
    }
    const newData = data.slice(0, -1)
    push(newData)
    addLog('oper', tStatic('hooks.stackLogPop').replace('{value}', String(data[data.length - 1])).replace('{size}', String(newData.length)), 'pop')
    showToast({ type: 'success', message: tStatic('hooks.stackPopSuccess').replace('{value}', String(data[data.length - 1])) })
    return data[data.length - 1]
  }, [data, push, addLog])

  const peek = useCallback((): number | null => {
    if (data.length === 0) {
      showToast({ type: 'warning', message: tStatic('hooks.stackEmpty') })
      return null
    }
    addLog('oper', tStatic('hooks.stackLogPeek').replace('{value}', String(data[data.length - 1])), 'peek')
    showToast({ type: 'info', message: tStatic('hooks.stackPeek').replace('{value}', String(data[data.length - 1])) })
    return data[data.length - 1]
  }, [data, addLog])

  const clear = useCallback((): void => {
    push([])
    addLog('oper', tStatic('hooks.stackLogClear'), 'clear')
    showToast({ type: 'info', message: tStatic('hooks.stackCleared') })
  }, [push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    push: pushValue, pop, peek, clear, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
    size: data.length,
  }
}
