import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [10, 20, 30, 40]

export function useLinkedListState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'linkedlist' })

  const insertHead = useCallback((value: string | number): void => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return
    }
    const newData = [safeValue, ...data]
    push(newData)
    addLog('oper', tStatic('hooks.llLogInsertHead').replace('{value}', String(safeValue)).replace('{head}', String(safeValue)).replace('{length}', String(newData.length)))
    addLog('code', `node.next = head; head = node;`)
    showToast({ type: 'success', message: tStatic('hooks.llInsertHeadSuccess').replace('{value}', String(safeValue)) })
  }, [data, push, addLog])

  const insertTail = useCallback((value: string | number): void => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return
    }
    const newData = [...data, safeValue]
    push(newData)
    addLog('oper', tStatic('hooks.llLogInsertTail').replace('{value}', String(safeValue)).replace('{tail}', String(safeValue)).replace('{length}', String(newData.length)))
    addLog('code', `tail.next = node; tail = node;`)
    showToast({ type: 'success', message: tStatic('hooks.llInsertTailSuccess').replace('{value}', String(safeValue)) })
  }, [data, push, addLog])

  const deleteAt = useCallback((index: number): number | null => {
    if (index < 0 || index >= data.length) {
      showToast({ type: 'error', message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length - 1}`) })
      addLog('error', tStatic('hooks.llLogDeleteError').replace('{index}', String(index)))
      return null
    }

    const value = data[index]
    const newData = data.filter((_, i) => i !== index)
    push(newData)
    addLog('oper', tStatic('hooks.llLogDelete').replace('{index}', String(index)).replace('{value}', String(value)).replace('{length}', String(newData.length)))
    addLog('code', `prev.next = node.next;`)
    showToast({ type: 'success', message: tStatic('hooks.llDeleteSuccess').replace('{index}', String(index)).replace('{value}', String(value)) })
    return value
  }, [data, push, addLog])

  const search = useCallback((value: number): number => {
    const index = data.indexOf(value)
    if (index !== -1) {
      addLog('oper', tStatic('hooks.llLogSearchFound').replace('{value}', String(value)).replace('{index}', String(index)))
      showToast({ type: 'success', message: tStatic('hooks.llSearchFound').replace('{value}', String(value)).replace('{index}', String(index)) })
    } else {
      addLog('oper', tStatic('hooks.llLogSearchNotFound').replace('{value}', String(value)))
      showToast({ type: 'warning', message: tStatic('hooks.llSearchNotFound').replace('{value}', String(value)) })
    }
    return index
  }, [data, addLog])

  const insertAt = useCallback((index: number, value: string | number): boolean => {
    if (index < 0 || index > data.length) {
      showToast({ type: 'error', message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length}`) })
      addLog('error', tStatic('hooks.llLogInsertAtError').replace('{index}', String(index)).replace('{value}', String(value)))
      return false
    }
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return false
    }
    const newData = [...data]
    newData.splice(index, 0, safeValue)
    push(newData)
    addLog('oper', tStatic('hooks.llLogInsertAt').replace('{index}', String(index)).replace('{value}', String(safeValue)).replace('{length}', String(newData.length)))
    addLog('code', `node.next = current.next; current.next = node;`)
    showToast({ type: 'success', message: tStatic('hooks.llInsertAtSuccess').replace('{index}', String(index)).replace('{value}', String(safeValue)) })
    return true
  }, [data, push, addLog])

  const reverse = useCallback((): number[] => {
    if (data.length <= 1) {
      addLog('info', tStatic('hooks.llLogReverseTooShort').replace('{length}', String(data.length)))
      return data
    }
    const reversed = [...data].reverse()
    push(reversed)
    addLog('oper', tStatic('hooks.llLogReverseDone').replace('{data}', reversed.join(', ')))
    addLog('code', `prev = null; while(curr) { next = curr.next; curr.next = prev; prev = curr; curr = next; }`)
    showToast({ type: 'success', message: tStatic('hooks.llReversed') })
    return reversed
  }, [data, push, addLog])

  const detectCycle = useCallback((): { hasCycle: boolean; steps: { slow: number; fast: number }[] } => {
    if (data.length === 0) {
      addLog('info', tStatic('hooks.llLogCycleEmpty'))
      return { hasCycle: false, steps: [] }
    }
    const steps: { slow: number; fast: number }[] = []
    const NULL = -1 // 代表 null（尾节点之后）
    let slow = 0
    let fast = 0
    let hasCycle = false

    for (let i = 0; i < data.length * 2; i++) {
      // slow 走 1 步：当前索引 i → 下一个索引 i+1，尾部之后为 null
      slow = slow === NULL ? NULL : (slow + 1 < data.length ? slow + 1 : NULL)
      // fast 走 2 步
      let next = fast === NULL ? NULL : (fast + 1 < data.length ? fast + 1 : NULL)
      fast = next === NULL ? NULL : (next + 1 < data.length ? next + 1 : NULL)
      steps.push({ slow, fast })

      if (slow === NULL || fast === NULL) break
      if (slow === fast) {
        hasCycle = true
        break
      }
    }

    if (hasCycle) {
      addLog('oper', tStatic('hooks.llLogCycleDetected'))
      showToast({ type: 'warning', message: tStatic('hooks.llCycleDetected') })
    } else {
      addLog('oper', tStatic('hooks.llLogNoCycle'))
      showToast({ type: 'info', message: tStatic('hooks.llNoCycle') })
    }

    return { hasCycle, steps }
  }, [data, addLog])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insertHead,
    insertTail,
    insertAt,
    deleteAt,
    search,
    reverse,
    detectCycle,
    reset,
    loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
    length: data.length,
  }
}
