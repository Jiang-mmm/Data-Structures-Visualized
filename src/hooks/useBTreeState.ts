import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'
import {
  insertBTree,
  searchBTree,
  inorderBTree,
  countBTreeNodes,
  countBTreeKeys,
  bTreeToFlattened,
  DEFAULT_ORDER,
} from '../algorithms/bTree'
import type { BTreeNode, BTreeFlattened } from '../algorithms/bTree'

const MODULE = () => tStatic('bTree.title')

/** 初始 B 树：插入 10, 20, 5, 6, 12, 30, 7, 17 后自动分裂 */
function buildInitialTree(): BTreeNode | null {
  let root: BTreeNode | null = null
  const values = [10, 20, 5, 6, 12, 30, 7, 17]
  for (const v of values) {
    root = insertBTree(root, v, DEFAULT_ORDER)
  }
  return root
}

export function useBTreeState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<BTreeNode | null>(buildInitialTree(), { storageKey: 'b-tree', abortAnimation })

  const insert = useCallback((value: string | number): void => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid'), module: MODULE(), operation: tStatic('bTree.insert') })
      return
    }
    // 先检查是否已存在
    const searchResult = searchBTree(data, safeValue)
    if (searchResult.found) {
      showToast({ type: 'warning', message: tStatic('hooks.bTreeInsertDuplicate').replace('{value}', String(safeValue)) })
      addLog('oper', tStatic('hooks.bTreeLogInsertDuplicate').replace('{value}', String(safeValue)))
      return
    }
    const newData = insertBTree(data, safeValue, DEFAULT_ORDER)
    push(newData)
    const nodeCount = countBTreeNodes(newData)
    addLog('oper', tStatic('hooks.bTreeLogInsert').replace('{value}', String(safeValue)).replace('{count}', String(nodeCount)))
    addLog('code', `insert(root, ${safeValue}); // 插入并按需分裂`)
    showToast({ type: 'success', message: tStatic('hooks.bTreeInsertSuccess').replace('{value}', String(safeValue)) })
  }, [data, push, addLog])

  const search = useCallback((value: number): { found: boolean; path: number[][] } => {
    const result = searchBTree(data, value)
    if (result.found) {
      addLog('oper', tStatic('hooks.bTreeLogSearchFound').replace('{value}', String(value)).replace('{depth}', String(result.path.length)))
    } else {
      addLog('oper', tStatic('hooks.bTreeLogSearchNotFound').replace('{value}', String(value)))
    }
    return result
  }, [data, addLog])

  const inorder = useCallback((): number[] => {
    const result = inorderBTree(data)
    addLog('oper', tStatic('hooks.bTreeLogInorder').replace('{data}', result.join(', ')))
    addLog('code', `inorder(node); // 中序遍历，结果有序`)
    return result
  }, [data, addLog])

  const getFlattened = useCallback((): BTreeFlattened => {
    return bTreeToFlattened(data)
  }, [data])

  const nodeCount = countBTreeNodes(data)
  const keyCount = countBTreeKeys(data)

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
    keyCount,
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
