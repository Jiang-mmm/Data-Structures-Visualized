import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'
import {
  buildInitialUnionFind,
  find as ufFind,
  union as ufUnion,
  connected as ufConnected,
  addNode as ufAddNode,
  removeNode as ufRemoveNode,
  getComponents as ufGetComponents,
  getValues as ufGetValues,
  countNodes as ufCountNodes,
  findIdByValue,
  type UnionFindData,
  type UnionFindFindResult,
} from '../algorithms/unionFind'

export type {
  UnionFindData,
  UnionFindNode,
  UnionFindEdge,
  UnionFindFindResult,
} from '../algorithms/unionFind'

const MODULE = () => tStatic('unionFind.title')

export function useUnionFindState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<UnionFindData>(buildInitialUnionFind(), { storageKey: 'union-find', abortAnimation })

  const insert = useCallback((value: number): void => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      showToast({ type: 'error', message: tStatic('errors.inputRequired'), module: MODULE(), operation: tStatic('unionFind.insert') })
      addLog('error', tStatic('hooks.unionFindInputRequired'))
      return
    }
    const num = Math.floor(value)
    if (num < 1 || num > 99) {
      showToast({ type: 'error', message: tStatic('errors.invalidRange'), module: MODULE(), operation: tStatic('unionFind.insert') })
      addLog('error', tStatic('hooks.unionFindLogInsertError').replace('{value}', String(num)))
      return
    }
    const exists = data.nodes.some(n => n.value === num)
    if (exists) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindInsertDuplicate').replace('{value}', String(num)) })
      addLog('oper', tStatic('hooks.unionFindLogInsertDuplicate').replace('{value}', String(num)), 'insert')
      return
    }
    const newData = ufAddNode(data, num)
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindInsertDuplicate').replace('{value}', String(num)) })
      return
    }
    push(newData)
    addLog('oper', tStatic('hooks.unionFindLogInsert').replace('{value}', String(num)), 'insert')
    addLog('code', `parent[n${num}] = n${num}; rank[n${num}] = 0;  // makeSet`)
    showToast({ type: 'success', message: tStatic('hooks.unionFindInsertSuccess').replace('{value}', String(num)) })
  }, [data, push, addLog])

  const remove = useCallback((value: number): void => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      showToast({ type: 'error', message: tStatic('errors.inputRequired'), module: MODULE(), operation: tStatic('unionFind.remove') })
      return
    }
    const num = Math.floor(value)
    const exists = data.nodes.some(n => n.value === num)
    if (!exists) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindDeleteNotFound').replace('{value}', String(num)) })
      addLog('oper', tStatic('hooks.unionFindLogDeleteNotFound').replace('{value}', String(num)), 'delete')
      return
    }
    const newData = ufRemoveNode(data, num)
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindDeleteNotFound').replace('{value}', String(num)) })
      return
    }
    push(newData)
    addLog('oper', tStatic('hooks.unionFindLogDeleteSuccess').replace('{value}', String(num)), 'delete')
    addLog('code', `remove(n${num});  // re-parent children`)
    showToast({ type: 'success', message: tStatic('hooks.unionFindDeleteSuccess').replace('{value}', String(num)) })
  }, [data, push, addLog])

  const find = useCallback((value: number): UnionFindFindResult => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { data, rootId: '', path: [] }
    }
    const num = Math.floor(value)
    const id = findIdByValue(data, num)
    if (!id) {
      addLog('oper', tStatic('hooks.unionFindLogFindNotFound').replace('{value}', String(num)), 'find')
      return { data, rootId: '', path: [] }
    }
    const result = ufFind(data, id)
    if (result.data !== data) {
      push(result.data)
    }
    const rootValue = data.nodes.find(n => n.id === result.rootId)?.value
    addLog('oper', tStatic('hooks.unionFindLogFind').replace('{value}', String(num)).replace('{root}', String(rootValue)), 'find')
    addLog('code', `find(n${num}) → root = n${rootValue};  // path compression`)
    return result
  }, [data, push, addLog])

  const union = useCallback((valueA: number, valueB: number): void => {
    if (typeof valueA !== 'number' || !Number.isFinite(valueA) ||
        typeof valueB !== 'number' || !Number.isFinite(valueB)) {
      showToast({ type: 'error', message: tStatic('errors.inputRequired'), module: MODULE(), operation: tStatic('unionFind.union') })
      return
    }
    const numA = Math.floor(valueA)
    const numB = Math.floor(valueB)
    const idA = findIdByValue(data, numA)
    const idB = findIdByValue(data, numB)
    if (!idA || !idB) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindNodeNotFound') })
      addLog('oper', tStatic('hooks.unionFindLogNodeNotFound'), 'union')
      return
    }
    if (ufConnected(data, idA, idB)) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindAlreadyConnected').replace('{a}', String(numA)).replace('{b}', String(numB)) })
      addLog('oper', tStatic('hooks.unionFindLogAlreadyConnected').replace('{a}', String(numA)).replace('{b}', String(numB)), 'union')
      return
    }
    const newData = ufUnion(data, idA, idB)
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.unionFindAlreadyConnected').replace('{a}', String(numA)).replace('{b}', String(numB)) })
      return
    }
    push(newData)
    addLog('oper', tStatic('hooks.unionFindLogUnion').replace('{a}', String(numA)).replace('{b}', String(numB)), 'union')
    addLog('code', `union(n${numA}, n${numB});  // union by rank`)
    showToast({ type: 'success', message: tStatic('hooks.unionFindUnionSuccess').replace('{a}', String(numA)).replace('{b}', String(numB)) })
  }, [data, push, addLog])

  const checkConnected = useCallback((valueA: number, valueB: number): boolean => {
    if (typeof valueA !== 'number' || !Number.isFinite(valueA) ||
        typeof valueB !== 'number' || !Number.isFinite(valueB)) {
      return false
    }
    const numA = Math.floor(valueA)
    const numB = Math.floor(valueB)
    const idA = findIdByValue(data, numA)
    const idB = findIdByValue(data, numB)
    if (!idA || !idB) {
      addLog('oper', tStatic('hooks.unionFindLogNodeNotFound'), 'connected')
      return false
    }
    const result = ufConnected(data, idA, idB)
    if (result) {
      addLog('oper', tStatic('hooks.unionFindLogConnected').replace('{a}', String(numA)).replace('{b}', String(numB)), 'connected')
    } else {
      addLog('oper', tStatic('hooks.unionFindLogNotConnected').replace('{a}', String(numA)).replace('{b}', String(numB)), 'connected')
    }
    return result
  }, [data, addLog])

  const size = useCallback((): number => {
    return ufCountNodes(data)
  }, [data])

  const values = useCallback((): number[] => {
    return ufGetValues(data)
  }, [data])

  const components = useCallback((): number => {
    return ufGetComponents(data)
  }, [data])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    remove,
    find,
    union,
    checkConnected,
    size,
    values,
    components,
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
