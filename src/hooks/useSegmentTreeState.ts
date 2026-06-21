import { useCallback } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { tStatic } from '../i18n/useI18n'
import {
  buildSegmentTree,
  querySegmentTreeWithPath,
  updateSegmentTreeWithPath,
  segmentTreeToFlattened,
  countSegmentTreeNodes,
  DEFAULT_ARRAY,
} from '../algorithms/segmentTree'
import type { SegmentTreeFlattened } from '../algorithms/segmentTree'

const MODULE = () => tStatic('segmentTree.title')

export function useSegmentTreeState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>([...DEFAULT_ARRAY], { storageKey: 'segment-tree', abortAnimation })

  /** 从数组构建线段树 */
  const build = useCallback((arr: number[]): void => {
    if (!Array.isArray(arr) || arr.length === 0) {
      showToast({ type: 'error', message: tStatic('hooks.segmentTreeBuildEmpty'), module: MODULE(), operation: tStatic('segmentTree.build') })
      return
    }
    push([...arr])
    const tree = buildSegmentTree(arr)
    const nodeCount = countSegmentTreeNodes(tree)
    addLog('oper', tStatic('hooks.segmentTreeLogBuild').replace('{data}', arr.join(', ')).replace('{count}', String(nodeCount)))
    addLog('code', `build([${arr.join(', ')}]); // O(n) 构建线段树`)
    showToast({ type: 'success', message: tStatic('hooks.segmentTreeBuildSuccess') })
  }, [push, addLog])

  /** 区间查询（不修改状态，仅返回结果与路径） */
  const query = useCallback((start: number, end: number): { sum: number; path: { start: number; end: number; sum: number }[] } => {
    const tree = buildSegmentTree(data)
    const result = querySegmentTreeWithPath(tree, start, end)
    addLog('oper', tStatic('hooks.segmentTreeLogQuery').replace('{start}', String(start)).replace('{end}', String(end)).replace('{sum}', String(result.sum)))
    addLog('code', `query(${start}, ${end}); // O(log n) 区间求和 = ${result.sum}`)
    if (result.sum === 0 && start > end) {
      showToast({ type: 'warning', message: tStatic('hooks.segmentTreeQueryInvalid') })
    } else {
      showToast({ type: 'success', message: tStatic('hooks.segmentTreeQuerySuccess').replace('{sum}', String(result.sum)) })
    }
    return result
  }, [data, addLog])

  /** 单点更新 */
  const update = useCallback((index: number, value: number): void => {
    if (index < 0 || index >= data.length) {
      showToast({ type: 'error', message: tStatic('hooks.segmentTreeUpdateOutOfRange'), module: MODULE(), operation: tStatic('segmentTree.update') })
      return
    }
    const tree = buildSegmentTree(data)
    const { root: newTree, path } = updateSegmentTreeWithPath(tree, index, value)
    // 更新数组
    const newArr = [...data]
    newArr[index] = value
    push(newArr)
    const nodeCount = countSegmentTreeNodes(newTree)
    addLog('oper', tStatic('hooks.segmentTreeLogUpdate').replace('{index}', String(index)).replace('{value}', String(value)).replace('{count}', String(nodeCount)))
    addLog('code', `update(${index}, ${value}); // O(log n) 单点更新，路径长度 ${path.length}`)
    showToast({ type: 'success', message: tStatic('hooks.segmentTreeUpdateSuccess').replace('{index}', String(index)).replace('{value}', String(value)) })
  }, [data, push, addLog])

  /** 获取扁平化结构（供可视化器） */
  const getFlattened = useCallback((): SegmentTreeFlattened => {
    const tree = buildSegmentTree(data)
    return segmentTreeToFlattened(tree, data)
  }, [data])

  /** 节点总数 */
  const nodeCount = countSegmentTreeNodes(buildSegmentTree(data))

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    build,
    query,
    update,
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
