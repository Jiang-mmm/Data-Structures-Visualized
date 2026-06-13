import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { validateNumericInput } from '../utils/validate'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [50, 30, 70, 20, 40, 60, 80]

function trimTrailingZeros(arr: number[]): number[] {
  let end = arr.length
  while (end > 0 && arr[end - 1] === 0) end--
  return end === arr.length ? arr : arr.slice(0, end)
}

function findInorderSuccessorIndex(data: number[], startIndex: number): number {
  let idx = 2 * startIndex + 2
  while (2 * idx + 1 < data.length && data[2 * idx + 1] !== 0) {
    idx = 2 * idx + 1
  }
  return idx
}

export function useTreeState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'tree' })

  const insert = useCallback((value: string | number): void => {
    const { valid, value: safeValue } = validateNumericInput(value)
    if (!valid) {
      showToast({ type: 'error', message: tStatic('hooks.inputInvalid') })
      return
    }
    const newData = [...data]
    if (newData.length === 0) {
      newData.push(safeValue)
    } else {
      let index = 0
      while (true) {
        if (safeValue < newData[index]) {
          const left = 2 * index + 1
          if (left >= newData.length || newData[left] === 0) {
            while (newData.length <= left) newData.push(0)
            newData[left] = safeValue
            break
          }
          index = left
        } else {
          const right = 2 * index + 2
          if (right >= newData.length || newData[right] === 0) {
            while (newData.length <= right) newData.push(0)
            newData[right] = safeValue
            break
          }
          index = right
        }
      }
    }
    const trimmed = trimTrailingZeros(newData)
    push(trimmed)
    const nodeCount = trimmed.filter(v => v !== 0).length
    addLog('oper', tStatic('hooks.treeLogInsert').replace('{value}', String(safeValue)).replace('{count}', String(nodeCount)))
    addLog('code', `if (value < node.val) node.left = insert(node.left, val);`)
    showToast({ type: 'success', message: tStatic('hooks.treeInsertSuccess').replace('{value}', String(safeValue)) })
  }, [data, push, addLog])

  const preorder = useCallback((): number[] => {
    const result: number[] = []
    const traverse = (index: number): void => {
      if (index >= data.length || data[index] === 0) return
      result.push(index)
      traverse(2 * index + 1)
      traverse(2 * index + 2)
    }
    traverse(0)
    addLog('oper', tStatic('hooks.treeLogPreorder').replace('{data}', result.map(i => data[i]).join(', ')))
    addLog('code', `visit(node); preorder(node.left); preorder(node.right);`)
    return result
  }, [data, addLog])

  const inorder = useCallback((): number[] => {
    const result: number[] = []
    const traverse = (index: number): void => {
      if (index >= data.length || data[index] === 0) return
      traverse(2 * index + 1)
      result.push(index)
      traverse(2 * index + 2)
    }
    traverse(0)
    addLog('oper', tStatic('hooks.treeLogInorder').replace('{data}', result.map(i => data[i]).join(', ')))
    addLog('code', `inorder(node.left); visit(node); inorder(node.right);`)
    return result
  }, [data, addLog])

  const postorder = useCallback((): number[] => {
    const result: number[] = []
    const traverse = (index: number): void => {
      if (index >= data.length || data[index] === 0) return
      traverse(2 * index + 1)
      traverse(2 * index + 2)
      result.push(index)
    }
    traverse(0)
    addLog('oper', tStatic('hooks.treeLogPostorder').replace('{data}', result.map(i => data[i]).join(', ')))
    addLog('code', `postorder(node.left); postorder(node.right); visit(node);`)
    return result
  }, [data, addLog])

  const levelorder = useCallback((): number[] => {
    const result: number[] = []
    const queue: number[] = [0]
    while (queue.length > 0) {
      const index = queue.shift()!
      if (index >= data.length || data[index] === 0) continue
      result.push(index)
      queue.push(2 * index + 1, 2 * index + 2)
    }
    addLog('oper', tStatic('hooks.treeLogLevelorder').replace('{data}', result.map(i => data[i]).join(', ')))
    addLog('code', `queue.push(root); while(queue) { visit(queue.shift()); push(children); }`)
    return result
  }, [data, addLog])

  const search = useCallback((value: number): { found: number; path: number[] } => {
    const path: number[] = []
    let index = 0
    while (index < data.length && data[index] !== 0) {
      path.push(index)
      if (value === data[index]) {
        addLog('oper', tStatic('hooks.treeLogSearchFound').replace('{value}', String(value)).replace('{index}', String(index)).replace('{depth}', String(path.length)))
        return { found: index, path }
      }
      index = value < data[index] ? 2 * index + 1 : 2 * index + 2
    }
    addLog('oper', tStatic('hooks.treeLogSearchNotFound').replace('{value}', String(value)))
    return { found: -1, path }
  }, [data, addLog])

  const deleteNode = useCallback((value: number): number | null => {
    let targetIndex = -1
    let index = 0
    while (index < data.length && data[index] !== 0) {
      if (value === data[index]) { targetIndex = index; break }
      index = value < data[index] ? 2 * index + 1 : 2 * index + 2
    }

    if (targetIndex === -1) {
      showToast({ type: 'warning', message: tStatic('hooks.treeDeleteNotFound').replace('{value}', String(value)) })
      addLog('oper', tStatic('hooks.treeLogDeleteNotFound').replace('{value}', String(value)))
      return null
    }

    const newData = [...data]

    const deleteAt = (idx: number): void => {
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      const hasLeft = left < newData.length && newData[left] !== 0
      const hasRight = right < newData.length && newData[right] !== 0

      if (!hasLeft && !hasRight) {
        newData[idx] = 0
      } else if (hasLeft && !hasRight) {
        newData[idx] = newData[left]
        deleteAt(left)
      } else if (!hasLeft && hasRight) {
        newData[idx] = newData[right]
        deleteAt(right)
      } else {
        const succIdx = findInorderSuccessorIndex(newData, idx)
        newData[idx] = newData[succIdx]
        deleteAt(succIdx)
      }
    }

    deleteAt(targetIndex)
    const trimmed = trimTrailingZeros(newData)
    push(trimmed)
    const nodeCount = trimmed.filter(v => v !== 0).length
    addLog('oper', tStatic('hooks.treeLogDeleteSuccess').replace('{value}', String(value)).replace('{count}', String(nodeCount)))
    showToast({ type: 'success', message: tStatic('hooks.treeDeleteSuccess').replace('{value}', String(value)) })
    return targetIndex
  }, [data, push, addLog])

  const nodeCount = data.filter(v => v !== 0).length

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    preorder,
    inorder,
    postorder,
    levelorder,
    search,
    deleteNode,
    reset,
    loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
    nodeCount,
  }
}
