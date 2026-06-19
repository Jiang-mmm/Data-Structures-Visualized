import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

const INITIAL_HEAP: number[] = [95, 80, 70, 60, 50, 40, 30]

function siftDown(arr: number[], index: number): number[] {
  const newArr = [...arr]
  const n = newArr.length
  let i = index
  while (true) {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < n && newArr[left] > newArr[largest]) {
      largest = left
    }
    if (right < n && newArr[right] > newArr[largest]) {
      largest = right
    }
    if (largest === i) break
    ;[newArr[i], newArr[largest]] = [newArr[largest], newArr[i]]
    i = largest
  }
  return newArr
}

function siftUp(arr: number[], index: number): number[] {
  let i = index
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2)
    if (arr[parent] >= arr[i]) break
    ;[arr[parent], arr[i]] = [arr[i], arr[parent]]
    i = parent
  }
  return arr
}

export function useHeapState() {
  const { data, logs, isAnimating, setIsAnimating, push, addLog, reset, loadData, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } =
    useDataStructureState<number[]>(INITIAL_HEAP, { storageKey: 'heap' })

  const insert = useCallback((value: string | number): boolean => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('errors.invalidRange').replace('{min}', '1').replace('{max}', '99') })
      addLog('error', tStatic('hooks.inputInvalid'))
      return false
    }

    const newData = siftUp([...data, safeValue], data.length)
    push(newData)
    addLog('oper', tStatic('hooks.heapLogInsert').replace('{value}', String(safeValue)).replace('{size}', String(newData.length)), 'insert')
    addLog('code', `heap.push(value); siftUp(heap.length - 1)`)
    showToast({ type: 'success', message: tStatic('hooks.heapInsertSuccess').replace('{value}', String(safeValue)) })
    return true
  }, [data, push, addLog])

  const extractMax = useCallback((): number | null => {
    if (data.length === 0) {
      showToast({ type: 'warning', message: tStatic('hooks.heapEmpty') })
      addLog('oper', tStatic('hooks.heapLogExtractEmpty'), 'extract')
      return null
    }

    const max = data[0]
    let newData: number[]
    if (data.length === 1) {
      newData = []
    } else {
      newData = [...data]
      newData[0] = newData[newData.length - 1]
      newData.pop()
      newData = siftDown(newData, 0)
    }
    push(newData)
    addLog('oper', tStatic('hooks.heapLogExtract').replace('{value}', String(max)).replace('{size}', String(newData.length)), 'extract')
    addLog('code', `max = heap[0]; heap[0] = heap.pop(); siftDown(0)`)
    showToast({ type: 'success', message: tStatic('hooks.heapExtractSuccess').replace('{value}', String(max)) })
    return max
  }, [data, push, addLog])

  const peek = useCallback((): number | null => {
    if (data.length === 0) {
      addLog('oper', tStatic('hooks.heapLogPeekEmpty'), 'peek')
      return null
    }
    addLog('oper', `peek() → ${data[0]}`, 'peek')
    return data[0]
  }, [data, addLog])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    extractMax,
    peek,
    reset,
    loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
    heapSize: data.length,
  }
}
