import { useState, useCallback, useRef } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { yieldToMain } from '../utils/timeslicing'
import { getSortAlgorithm } from '../algorithms/sorting'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [38, 27, 43, 3, 9, 82, 10, 55, 21, 67, 15, 94, 50, 71, 33]
const YIELD_INTERVAL = 5

export interface SortStats {
  algorithm: string
  comparisons: number
  swaps: number
  steps: number
}

export function useSortState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset: baseReset, loadData,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'sort' })

  const [stats, setStats] = useState<SortStats>({ algorithm: '', comparisons: 0, swaps: 0, steps: 0 })
  const [progress, setProgress] = useState<number>(0)
  const animRef = useRef<{ abort: () => void } | null>(null)

  const randomize = useCallback((): void => {
    const newData = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5)
    push(newData)
    setStats({ algorithm: '', comparisons: 0, swaps: 0, steps: 0 })
    setProgress(0)
    addLog('info', tStatic('hooks.sortRandomData').replace('{data}', newData.join(', ')))
    showToast({ type: 'info', message: tStatic('toast.randomized') })
  }, [push, addLog])

  const reset = useCallback((): void => {
    baseReset()
    setStats({ algorithm: '', comparisons: 0, swaps: 0, steps: 0 })
    setProgress(0)
  }, [baseReset])

  const stop = useCallback((): void => {
    if (animRef.current) {
      animRef.current.abort()
      animRef.current = null
    }
    setIsAnimating(false)
    showToast({ type: 'warning', message: tStatic('page.stopped') })
  }, [setIsAnimating])

  const runAlgorithm = useCallback(async (algorithmKey: string, animateFns: any, svgRef: any, dimensions: any, anim?: any): Promise<void> => {
    const algorithm = getSortAlgorithm(algorithmKey)
    if (!algorithm) {
      showToast({ type: 'error', message: tStatic('hooks.sortUnknownAlgorithm').replace('{key}', algorithmKey) })
      return
    }

    const arr = [...data]
    setStats({ algorithm: `${algorithm.name} ${algorithm.timeComplexity}`, comparisons: 0, swaps: 0, steps: 0 })
    setProgress(0)
    addLog('info', tStatic('hooks.sortLogStart').replace('{name}', algorithm.name))

    const animation = anim || { isAborted: () => false, signal: undefined, abort: () => {} }
    animRef.current = animation

    let lastStep = 0

    const result = await algorithm.execute(arr, animateFns, svgRef, dimensions, animation, {
      onStep: async () => {
        if (lastStep % YIELD_INTERVAL === 0) await yieldToMain()
        lastStep++
      },
      onCompare: (count: number, pct: number) => {
        setStats(s => ({ ...s, comparisons: count }))
        setProgress(pct)
      },
      onSwap: (swaps: number, steps: number) => {
        setStats(s => ({ ...s, swaps, steps }))
      },
    })

    if (result?.aborted) {
      addLog('info', tStatic('hooks.sortLogStopped'))
      setIsAnimating(false)
      animRef.current = null
      return
    }

    push([...arr])
    addLog('info', tStatic('hooks.sortLogComplete').replace('{name}', algorithm.name).replace('{comparisons}', String(result.comparisons)).replace('{swaps}', String(result.swaps)))
    showToast({ type: 'success', message: tStatic('hooks.sortComplete').replace('{name}', algorithm.name).replace('{comparisons}', String(result.comparisons)).replace('{swaps}', String(result.swaps)) })
    setIsAnimating(false)
    animRef.current = null
  }, [data, push, addLog])

  const bubbleSort = useCallback((a: any, b: any, c: any, d: any) => runAlgorithm('bubble', a, b, c, d), [runAlgorithm])
  const selectionSort = useCallback((a: any, b: any, c: any, d: any) => runAlgorithm('selection', a, b, c, d), [runAlgorithm])
  const insertionSort = useCallback((a: any, b: any, c: any, d: any) => runAlgorithm('insertion', a, b, c, d), [runAlgorithm])

  return {
    data, logs, isAnimating, setIsAnimating, stats, progress,
    randomize, reset, stop, loadData,
    bubbleSort, selectionSort, insertionSort, runAlgorithm,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  }
}
