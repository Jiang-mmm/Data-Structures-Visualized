import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [8, 3, 12, 5, 9]
const MAX_SIZE = 20
const MODULE = () => tStatic('array.title')

export function useArrayState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'array', abortAnimation })

  const insert = useCallback((rawValue: string | number, index: number): boolean => {
    if (data.length >= MAX_SIZE) {
      showToast({ type: 'error', message: tStatic('hooks.arrayFull').replace('{max}', String(MAX_SIZE)), module: MODULE(), operation: tStatic('array.insert') })
      addLog('error', tStatic('hooks.arrayLogFull'))
      return false
    }
    if (index < 0 || index > data.length) {
      showToast({ type: 'error', message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length}`), module: MODULE(), operation: tStatic('array.insert') })
      addLog('error', `insert(${rawValue}, ${index}) - index out of range`)
      return false
    }
    const { valid, value: safeValue } = validateNumericInput(rawValue)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid'), module: MODULE(), operation: tStatic('array.insert') })
      addLog('error', tStatic('hooks.arrayLogInsertError').replace('{value}', String(rawValue)))
      return false
    }
    const newData = [...data]
    newData.splice(index, 0, safeValue)
    push(newData)
    addLog('oper', tStatic('hooks.arrayLogInsertSuccess').replace('{value}', String(safeValue)).replace('{index}', String(index)).replace('{length}', String(newData.length)), 'insert')
    showToast({ type: 'success', message: tStatic('hooks.arrayInsertSuccess').replace('{value}', String(safeValue)).replace('{index}', String(index)) })
    return true
  }, [data, push, addLog])

  const remove = useCallback((index: number): number | null => {
    if (index < 0 || index >= data.length) {
      showToast({ type: 'error', message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length - 1}`), module: MODULE(), operation: tStatic('common.delete') })
      addLog('error', tStatic('hooks.arrayLogDeleteError').replace('{index}', String(index)))
      return null
    }
    const value = data[index]
    const newData = [...data]
    newData.splice(index, 1)
    push(newData)
    addLog('oper', tStatic('hooks.arrayLogDeleteSuccess').replace('{index}', String(index)).replace('{value}', String(value)).replace('{length}', String(newData.length)), 'delete')
    showToast({ type: 'success', message: tStatic('hooks.arrayDeleteSuccess').replace('{index}', String(index)).replace('{value}', String(value)) })
    return value
  }, [data, push, addLog])

  const search = useCallback((value: number): number => {
    const index = data.indexOf(value)
    if (index !== -1) {
      addLog('oper', tStatic('hooks.arrayLogSearchFound').replace('{value}', String(value)).replace('{index}', String(index)), 'search')
      showToast({ type: 'success', message: tStatic('hooks.arraySearchFound').replace('{value}', String(value)).replace('{index}', String(index)) })
    } else {
      addLog('oper', tStatic('hooks.arrayLogSearchNotFound').replace('{value}', String(value)), 'search')
      showToast({ type: 'warning', message: tStatic('hooks.arraySearchNotFound').replace('{value}', String(value)) })
    }
    return index
  }, [data, addLog])

  const searchAll = useCallback((value: number): number[] => {
    const indices: number[] = []
    for (let i = 0; i < data.length; i++) {
      if (data[i] === value) indices.push(i)
    }
    if (indices.length > 0) {
      addLog('oper', tStatic('hooks.arrayLogSearchAllFound').replace('{value}', String(value)).replace('{count}', String(indices.length)).replace('{indices}', indices.join(', ')), 'searchAll')
      showToast({ type: 'success', message: tStatic('hooks.arraySearchAllFound').replace('{count}', String(indices.length)).replace('{value}', String(value)).replace('{indices}', indices.join(', ')) })
    } else {
      addLog('oper', tStatic('hooks.arrayLogSearchAllNotFound').replace('{value}', String(value)), 'searchAll')
      showToast({ type: 'warning', message: tStatic('hooks.arraySearchAllNotFound').replace('{value}', String(value)) })
    }
    return indices
  }, [data, addLog])

  const binarySearch = useCallback((value: number): number => {
    // 二分查找前提：数组必须有序（升序）
    const isSorted = data.every((v, i) => i === 0 || data[i - 1] <= v)
    if (!isSorted) {
      showToast({ type: 'warning', message: tStatic('hooks.arrayBinarySearchUnsorted') })
      addLog('error', tStatic('hooks.arrayLogBinarySearchUnsorted'))
      return -1
    }
    let lo = 0
    let hi = data.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (data[mid] === value) {
        addLog('oper', tStatic('hooks.arrayLogBinarySearchFound').replace('{value}', String(value)).replace('{index}', String(mid)), 'binarySearch')
        showToast({ type: 'success', message: tStatic('hooks.arrayBinarySearchFound').replace('{value}', String(value)).replace('{index}', String(mid)) })
        return mid
      } else if (data[mid] < value) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    addLog('oper', tStatic('hooks.arrayLogBinarySearchNotFound').replace('{value}', String(value)), 'binarySearch')
    showToast({ type: 'warning', message: tStatic('hooks.arrayBinarySearchNotFound').replace('{value}', String(value)) })
    return -1
  }, [data, addLog])

  const randomize = useCallback((): void => {
    const newData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 99) + 1)
    push(newData)
    addLog('info', tStatic('hooks.arrayLogRandom').replace('{data}', newData.join(', ')))
    showToast({ type: 'info', message: tStatic('hooks.randomArray') })
  }, [push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    insert, remove, search, searchAll, binarySearch, randomize, reset, loadData,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  }
}
