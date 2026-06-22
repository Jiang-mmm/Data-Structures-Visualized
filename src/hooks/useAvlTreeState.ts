import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'
import {
  insertAvl,
  deleteAvl,
  searchAvl,
  preorderAvl,
  inorderAvl,
  postorderAvl,
  levelorderAvl,
  countNodes,
  flattenAvl,
} from '../algorithms/avlTree'
import type { AvlNode, AvlFlattened } from '../types/hooks'

const MODULE = () => tStatic('avlTree.title')

/** 初始 AVL 树：插入 50, 30, 70, 20, 40, 60, 80 后自动平衡 */
function buildInitialTree(): AvlNode | null {
  const values = [50, 30, 70, 20, 40, 60, 80]
  let root: AvlNode | null = null
  for (const v of values) {
    root = insertAvl(root, v)
  }
  return root
}

export function useAvlTreeState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<AvlNode | null>(buildInitialTree(), { storageKey: 'avl-tree', abortAnimation })

  const insert = useCallback((value: string | number): void => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid'), module: MODULE(), operation: tStatic('avlTree.insert') })
      return
    }
    const newData = insertAvl(data, safeValue)
    // 值已存在，不重复插入
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.avlInsertDuplicate').replace('{value}', String(safeValue)) })
      addLog('oper', tStatic('hooks.avlLogInsertDuplicate').replace('{value}', String(safeValue)))
      return
    }
    push(newData)
    const nodeCount = countNodes(newData)
    addLog('oper', tStatic('hooks.avlLogInsert').replace('{value}', String(safeValue)).replace('{count}', String(nodeCount)))
    addLog('code', `node = insert(node, value); node = rebalance(node);`)
    showToast({ type: 'success', message: tStatic('hooks.avlInsertSuccess').replace('{value}', String(safeValue)) })
  }, [data, push, addLog])

  const deleteNode = useCallback((value: number): number | null => {
    // 先查找确认节点存在
    const searchResult = searchAvl(data, value)
    if (!searchResult.found) {
      showToast({ type: 'warning', message: tStatic('hooks.avlDeleteNotFound').replace('{value}', String(value)) })
      addLog('oper', tStatic('hooks.avlLogDeleteNotFound').replace('{value}', String(value)))
      return null
    }
    const newData = deleteAvl(data, value)
    push(newData)
    const nodeCount = countNodes(newData)
    addLog('oper', tStatic('hooks.avlLogDeleteSuccess').replace('{value}', String(value)).replace('{count}', String(nodeCount)))
    addLog('code', `node = delete(node, value); node = rebalance(node);`)
    showToast({ type: 'success', message: tStatic('hooks.avlDeleteSuccess').replace('{value}', String(value)) })
    return value
  }, [data, push, addLog])

  const search = useCallback((value: number): { found: boolean; path: number[] } => {
    const result = searchAvl(data, value)
    if (result.found) {
      addLog('oper', tStatic('hooks.avlLogSearchFound').replace('{value}', String(value)).replace('{depth}', String(result.path.length)))
    } else {
      addLog('oper', tStatic('hooks.avlLogSearchNotFound').replace('{value}', String(value)))
    }
    return result
  }, [data, addLog])

  const preorder = useCallback((): number[] => {
    const result = preorderAvl(data)
    addLog('oper', tStatic('hooks.avlLogPreorder').replace('{data}', result.join(', ')))
    addLog('code', `visit(node); preorder(node.left); preorder(node.right);`)
    return result
  }, [data, addLog])

  const inorder = useCallback((): number[] => {
    const result = inorderAvl(data)
    addLog('oper', tStatic('hooks.avlLogInorder').replace('{data}', result.join(', ')))
    addLog('code', `inorder(node.left); visit(node); inorder(node.right);`)
    return result
  }, [data, addLog])

  const postorder = useCallback((): number[] => {
    const result = postorderAvl(data)
    addLog('oper', tStatic('hooks.avlLogPostorder').replace('{data}', result.join(', ')))
    addLog('code', `postorder(node.left); postorder(node.right); visit(node);`)
    return result
  }, [data, addLog])

  const levelorder = useCallback((): number[] => {
    const result = levelorderAvl(data)
    addLog('oper', tStatic('hooks.avlLogLevelorder').replace('{data}', result.join(', ')))
    addLog('code', `queue.push(root); while(queue) { visit(queue.shift()); push(children); }`)
    return result
  }, [data, addLog])

  const getFlattened = useCallback((): AvlFlattened => {
    return flattenAvl(data)
  }, [data])

  const nodeCount = countNodes(data)

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    deleteNode,
    search,
    preorder,
    inorder,
    postorder,
    levelorder,
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
