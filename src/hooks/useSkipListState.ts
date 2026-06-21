import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'
import {
  buildInitialSkipList,
  insertSkipList,
  searchSkipList,
  deleteSkipList,
  countNodes,
  getValues,
  type SkipListData,
  type SkipListSearchResult,
} from '../algorithms/skipList'

export type {
  SkipListData,
  SkipListNode,
  SkipListEdge,
  SkipListSearchResult,
  SkipListSearchStep,
} from '../algorithms/skipList'

const MODULE = () => tStatic('skipList.title')

export function useSkipListState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<SkipListData>(buildInitialSkipList(), { storageKey: 'skip-list', abortAnimation })

  const insert = useCallback((value: number): void => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      showToast({ type: 'error', message: tStatic('errors.inputRequired'), module: MODULE(), operation: tStatic('skipList.insert') })
      addLog('error', tStatic('hooks.skipListInputRequired'))
      return
    }
    const num = Math.floor(value)
    if (num < 1 || num > 99) {
      showToast({ type: 'error', message: tStatic('errors.invalidRange'), module: MODULE(), operation: tStatic('skipList.insert') })
      addLog('error', tStatic('hooks.skipListLogInsertError').replace('{value}', String(num)))
      return
    }
    const exists = data.nodes.some(n => n.value === num)
    if (exists) {
      showToast({ type: 'warning', message: tStatic('hooks.skipListInsertDuplicate').replace('{value}', String(num)) })
      addLog('oper', tStatic('hooks.skipListLogInsertDuplicate').replace('{value}', String(num)), 'insert')
      return
    }
    const newData = insertSkipList(data, num)
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.skipListInsertDuplicate').replace('{value}', String(num)) })
      return
    }
    push(newData)
    addLog('oper', tStatic('hooks.skipListLogInsert').replace('{value}', String(num)).replace('{level}', String(newData.maxLevel)), 'insert')
    addLog('code', `level = randomLevel(); for (i = 0; i < level; i++) { update[i] = search(value, i); splice(update[i], newNode, i); }`)
    showToast({ type: 'success', message: tStatic('hooks.skipListInsertSuccess').replace('{value}', String(num)) })
  }, [data, push, addLog])

  const remove = useCallback((value: number): void => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      showToast({ type: 'error', message: tStatic('errors.inputRequired'), module: MODULE(), operation: tStatic('skipList.delete') })
      return
    }
    const num = Math.floor(value)
    const exists = data.nodes.some(n => n.value === num)
    if (!exists) {
      showToast({ type: 'warning', message: tStatic('hooks.skipListDeleteNotFound').replace('{value}', String(num)) })
      addLog('oper', tStatic('hooks.skipListLogDeleteNotFound').replace('{value}', String(num)), 'delete')
      return
    }
    const newData = deleteSkipList(data, num)
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.skipListDeleteNotFound').replace('{value}', String(num)) })
      return
    }
    push(newData)
    addLog('oper', tStatic('hooks.skipListLogDeleteSuccess').replace('{value}', String(num)), 'delete')
    addLog('code', `for (i = 0; i < node.level; i++) { update[i] = search(value, i); unlink(update[i], node, i); }`)
    showToast({ type: 'success', message: tStatic('hooks.skipListDeleteSuccess').replace('{value}', String(num)) })
  }, [data, push, addLog])

  const search = useCallback((value: number): SkipListSearchResult => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { found: false, path: [] }
    }
    const num = Math.floor(value)
    const result = searchSkipList(data, num)
    if (result.found) {
      addLog('oper', tStatic('hooks.skipListLogSearchFound').replace('{value}', String(num)), 'search')
    } else {
      addLog('oper', tStatic('hooks.skipListLogSearchNotFound').replace('{value}', String(num)), 'search')
    }
    return result
  }, [data, addLog])

  const size = useCallback((): number => {
    return countNodes(data)
  }, [data])

  const values = useCallback((): number[] => {
    return getValues(data)
  }, [data])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    remove,
    search,
    size,
    values,
    reset,
    loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
  }
}
