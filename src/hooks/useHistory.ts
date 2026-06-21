import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY = 20

/**
 * 提供基于 useRef 的撤销/重做历史栈（最多保留 20 步）
 * @example
 * ```ts
 * const { state, push, undo, redo, canUndo, canRedo } = useHistory([1, 2, 3])
 * push([1, 2, 3, 4]) // 记录新状态
 * undo()              // 回到 [1, 2, 3]
 * redo()              // 恢复 [1, 2, 3, 4]
 * ```
 */
export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState)
  const historyRef = useRef<T[]>([initialState])
  const indexRef = useRef<number>(0)
  const canUndoRef = useRef<boolean>(false)
  const canRedoRef = useRef<boolean>(false)

  const push = useCallback((newState: T) => {
    const nextIndex = indexRef.current + 1
    historyRef.current = historyRef.current.slice(0, nextIndex)
    historyRef.current.push(newState)

    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    }
    indexRef.current = historyRef.current.length - 1

    setState(newState)
    canUndoRef.current = indexRef.current > 0
    canRedoRef.current = false
  }, [])

  const undo = useCallback((): T | null => {
    if (indexRef.current <= 0) return null
    indexRef.current -= 1
    const prevState = historyRef.current[indexRef.current]
    setState(prevState)
    canUndoRef.current = indexRef.current > 0
    canRedoRef.current = true
    return prevState
  }, [])

  const redo = useCallback((): T | null => {
    if (indexRef.current >= historyRef.current.length - 1) return null
    indexRef.current += 1
    const nextState = historyRef.current[indexRef.current]
    setState(nextState)
    canUndoRef.current = true
    canRedoRef.current = indexRef.current < historyRef.current.length - 1
    return nextState
  }, [])

  const reset = useCallback((newInitial: T) => {
    historyRef.current = [newInitial]
    indexRef.current = 0
    setState(newInitial)
    canUndoRef.current = false
    canRedoRef.current = false
  }, [])

  const getHistory = useCallback((): T[] => historyRef.current, [])
  const getCurrentIndex = useCallback((): number => indexRef.current, [])

  const getUndoPreview = useCallback((): T | null => {
    if (indexRef.current <= 0) return null
    return historyRef.current[indexRef.current - 1]
  }, [])

  const getRedoPreview = useCallback((): T | null => {
    if (indexRef.current >= historyRef.current.length - 1) return null
    return historyRef.current[indexRef.current + 1]
  }, [])

  const canUndo = useCallback((): boolean => canUndoRef.current, [])
  const canRedo = useCallback((): boolean => canRedoRef.current, [])

  return {
    state,
    setState,
    push,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    getHistory,
    getCurrentIndex,
    getUndoPreview,
    getRedoPreview,
  }
}
