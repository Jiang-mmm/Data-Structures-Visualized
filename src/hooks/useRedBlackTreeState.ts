import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'
import {
  insertRedBlack,
  searchRedBlack,
  inorderRedBlack,
  countNodes,
  flattenRedBlack,
  buildInitialRedBlackTree,
} from '../algorithms/redBlackTree'
import type { RedBlackNode, RedBlackFlattened } from '../algorithms/redBlackTree'

export type {
  RedBlackNode,
  RedBlackFlattened,
  RedBlackFlattenedNode,
  RedBlackFlattenedEdge,
  Color,
} from '../algorithms/redBlackTree'

export function useRedBlackTreeState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<RedBlackNode | null>(buildInitialRedBlackTree(), { storageKey: 'red-black-tree' })

  const insert = useCallback((value: string | number): void => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return
    }
    const newData = insertRedBlack(data, safeValue)
    // 值已存在，不重复插入
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.redBlackTreeInsertDuplicate').replace('{value}', String(safeValue)) })
      addLog('oper', tStatic('hooks.redBlackTreeLogInsertDuplicate').replace('{value}', String(safeValue)))
      return
    }
    push(newData)
    const nodeCount = countNodes(newData)
    addLog('oper', tStatic('hooks.redBlackTreeLogInsert').replace('{value}', String(safeValue)).replace('{count}', String(nodeCount)), 'insert')
    addLog('code', `node = insert(root, value); root = fixInsert(root, node);`)
    showToast({ type: 'success', message: tStatic('hooks.redBlackTreeInsertSuccess').replace('{value}', String(safeValue)) })
  }, [data, push, addLog])

  const search = useCallback((value: number): { found: boolean; path: number[] } => {
    const result = searchRedBlack(data, value)
    if (result.found) {
      addLog('oper', tStatic('hooks.redBlackTreeLogSearchFound').replace('{value}', String(value)).replace('{depth}', String(result.path.length)), 'search')
    } else {
      addLog('oper', tStatic('hooks.redBlackTreeLogSearchNotFound').replace('{value}', String(value)), 'search')
    }
    return result
  }, [data, addLog])

  const inorder = useCallback((): number[] => {
    const result = inorderRedBlack(data)
    addLog('oper', tStatic('hooks.redBlackTreeLogInorder').replace('{data}', result.join(', ')), 'inorder')
    addLog('code', `inorder(node.left); visit(node); inorder(node.right);`)
    return result
  }, [data, addLog])

  const getFlattened = useCallback((): RedBlackFlattened => {
    return flattenRedBlack(data)
  }, [data])

  const nodeCount = countNodes(data)

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    search,
    inorder,
    getFlattened,
    nodeCount,
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
