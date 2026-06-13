import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [8, 3, 12, 5, 9]
const MAX_SIZE = 20

export function useArrayState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'array' })

  const insert = useCallback((rawValue: string | number, index: number): boolean => {
    if (data.length >= MAX_SIZE) {
      showToast({ type: 'error', message: tStatic('hooks.arrayFull').replace('{max}', String(MAX_SIZE)) })
      addLog('error', tStatic('hooks.arrayLogFull'))
      return false
    }
    if (index < 0 || index > data.length) {
      showToast({ type: 'error', message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length}`) })
      addLog('error', `insert(${rawValue}, ${index}) - index out of range`)
      return false
    }
    const { valid, value: safeValue } = validateNumericInput(rawValue)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      addLog('error', tStatic('hooks.arrayLogInsertError').replace('{value}', String(rawValue)))
      return false
    }
    const newData = [...data]
    newData.splice(index, 0, safeValue)
    push(newData)
    addLog('oper', tStatic('hooks.arrayLogInsertSuccess').replace('{value}', String(safeValue)).replace('{index}', String(index)).replace('{length}', String(newData.length)))
    showToast({ type: 'success', message: tStatic('hooks.arrayInsertSuccess').replace('{value}', String(safeValue)).replace('{index}', String(index)) })
    return true
  }, [data, push, addLog])

  const remove = useCallback((index: number): number | null => {
    if (index < 0 || index >= data.length) {
      showToast({ type: 'error', message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length - 1}`) })
      addLog('error', tStatic('hooks.arrayLogDeleteError').replace('{index}', String(index)))
      return null
    }
    const value = data[index]
    const newData = [...data]
    newData.splice(index, 1)
    push(newData)
    addLog('oper', tStatic('hooks.arrayLogDeleteSuccess').replace('{index}', String(index)).replace('{value}', String(value)).replace('{length}', String(newData.length)))
    showToast({ type: 'success', message: tStatic('hooks.arrayDeleteSuccess').replace('{index}', String(index)).replace('{value}', String(value)) })
    return value
  }, [data, push, addLog])

  const search = useCallback((value: number): number => {
    const index = data.indexOf(value)
    if (index !== -1) {
      addLog('oper', tStatic('hooks.arrayLogSearchFound').replace('{value}', String(value)).replace('{index}', String(index)))
      showToast({ type: 'success', message: tStatic('hooks.arraySearchFound').replace('{value}', String(value)).replace('{index}', String(index)) })
    } else {
      addLog('oper', tStatic('hooks.arrayLogSearchNotFound').replace('{value}', String(value)))
      showToast({ type: 'warning', message: tStatic('hooks.arraySearchNotFound').replace('{value}', String(value)) })
    }
    return index
  }, [data, addLog])

  const randomize = useCallback((): void => {
    const newData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 99) + 1)
    push(newData)
    addLog('info', tStatic('hooks.arrayLogRandom').replace('{data}', newData.join(', ')))
    showToast({ type: 'info', message: tStatic('hooks.randomArray') })
  }, [push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    insert, remove, search, randomize, reset, loadData,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  }
}
