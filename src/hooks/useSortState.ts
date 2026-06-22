import { useState, useCallback, useRef, useEffect } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { yieldToMain } from '../utils/timeslicing'
import { getSortAlgorithm, type SortAnimationFns, type Animation } from '../algorithms/sorting'
import { tStatic } from '../i18n/useI18n'

const INITIAL_DATA: number[] = [38, 27, 43, 9, 82, 10, 55, 21]
const YIELD_INTERVAL = 5
const MODULE = () => tStatic('sort.title')

export interface SortStats {
  algorithm: string
  comparisons: number
  swaps: number
  steps: number
}

export function useSortState(abortAnimation?: () => void) {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset: baseReset, loadData,
    undo, redo, canUndo, canRedo, setUndoBlock,
    getUndoPreview, getRedoPreview,
  } = useDataStructureState<number[]>(INITIAL_DATA, { storageKey: 'sort', abortAnimation })

  const [stats, setStats] = useState<SortStats>({ algorithm: '', comparisons: 0, swaps: 0, steps: 0 })
  const [progress, setProgress] = useState<number>(0)
  const animRef = useRef<{ abort: () => void } | null>(null)

  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.abort()
        animRef.current = null
      }
    }
  }, [])

  const randomize = useCallback((): void => {
    const newData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 95) + 5)
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

  const runAlgorithm = useCallback(async (
    algorithmKey: string,
    animateFns: SortAnimationFns,
    svgRef: React.RefObject<SVGSVGElement | null>,
    dimensions: { width: number; height: number },
    anim?: { isAborted: () => boolean; abort: () => void },
  ): Promise<void> => {
    const algorithm = getSortAlgorithm(algorithmKey)
    if (!algorithm) {
      showToast({ type: 'error', message: tStatic('hooks.sortUnknownAlgorithm').replace('{key}', algorithmKey), module: MODULE(), operation: tStatic('common.run') })
      return
    }

    const arr = [...data]
    setStats({ algorithm: `${algorithm.name} ${algorithm.timeComplexity}`, comparisons: 0, swaps: 0, steps: 0 })
    setProgress(0)
    addLog('info', tStatic('hooks.sortLogStart').replace('{name}', algorithm.name))

    const animation = anim || { isAborted: () => false, abort: () => {} }
    animRef.current = animation

    // 排序过程中阻塞撤销/重做，避免破坏中间状态
    setUndoBlock(true)

    let lastStep = 0

    try {
      const result = await algorithm.execute(arr, animateFns, svgRef, dimensions, animation as unknown as Animation, {
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
        return
      }

      push([...arr])
      addLog('info', tStatic('hooks.sortLogComplete').replace('{name}', algorithm.name).replace('{comparisons}', String(result.comparisons)).replace('{swaps}', String(result.swaps)))
      showToast({ type: 'success', message: tStatic('hooks.sortComplete').replace('{name}', algorithm.name).replace('{comparisons}', String(result.comparisons)).replace('{swaps}', String(result.swaps)) })
    } finally {
      setIsAnimating(false)
      animRef.current = null
      setUndoBlock(false)
    }
  }, [data, push, addLog, setIsAnimating, setUndoBlock])

  const bubbleSort = useCallback((a: SortAnimationFns, b: React.RefObject<SVGSVGElement | null>, c: { width: number; height: number }, d?: { isAborted: () => boolean; abort: () => void }) => runAlgorithm('bubble', a, b, c, d), [runAlgorithm])
  const selectionSort = useCallback((a: SortAnimationFns, b: React.RefObject<SVGSVGElement | null>, c: { width: number; height: number }, d?: { isAborted: () => boolean; abort: () => void }) => runAlgorithm('selection', a, b, c, d), [runAlgorithm])
  const insertionSort = useCallback((a: SortAnimationFns, b: React.RefObject<SVGSVGElement | null>, c: { width: number; height: number }, d?: { isAborted: () => boolean; abort: () => void }) => runAlgorithm('insertion', a, b, c, d), [runAlgorithm])

  return {
    data, logs, isAnimating, setIsAnimating, stats, progress,
    randomize, reset, stop, loadData,
    bubbleSort, selectionSort, insertionSort, runAlgorithm,
    undo, redo, canUndo, canRedo,
    getUndoPreview, getRedoPreview,
  }
}
