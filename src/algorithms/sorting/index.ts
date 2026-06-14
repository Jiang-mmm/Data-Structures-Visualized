import type { Animation } from '../../utils/animationEngine'
export type { Animation } from '../../utils/animationEngine'

export interface SortCallbacks {
  onStep?: () => void
  onCompare?: (comparisons: number, percent: number) => void
  onSwap?: (swaps: number, steps: number) => void
}

export interface SortResult {
  comparisons: number
  swaps: number
  steps: number
  aborted?: boolean
}

export interface SortAnimationFns {
  animateCompare: (svg: SVGSVGElement | null, i: number, j: number, data: number[], dimensions: { width: number; height: number }, anim?: Animation) => Promise<void>
  animateSwap: (svg: SVGSVGElement | null, i: number, j: number, data: number[], dimensions: { width: number; height: number }, anim?: Animation) => Promise<void>
  animateSorted: (svg: SVGSVGElement | null, data: number[], options: { width: number; height: number }, anim?: Animation) => Promise<void>
  renderSortBars: (svg: SVGSVGElement, data: number[], dimensions: { width: number; height: number }) => void
}

export interface SortAlgorithm {
  name: string
  nameKey?: string
  timeComplexity: string
  spaceComplexity: string
  icon: string
  color: string
  variant: string
  execute: (
    arr: number[],
    animationFns: SortAnimationFns,
    svgRef: React.RefObject<SVGSVGElement | null>,
    dimensions: { width: number; height: number },
    anim: Animation | undefined,
    callbacks: SortCallbacks,
  ) => Promise<SortResult>
}

const registry = new Map<string, SortAlgorithm>()

export function registerSortAlgorithm(key: string, algorithm: SortAlgorithm): void {
  registry.set(key, algorithm)
}

export function getSortAlgorithm(key: string): SortAlgorithm | undefined {
  return registry.get(key)
}

export function getAllSortAlgorithms(): Map<string, SortAlgorithm> {
  return registry
}

function bubbleMaxComparisons(n: number): number {
  return n * (n - 1) / 2
}

registerSortAlgorithm('bubble', {
  name: '冒泡排序',
  nameKey: 'sort.bubble',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  icon: '🫧',
  color: 'bg-accent-blue',
  variant: 'primary',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = bubbleMaxComparisons(n)
    let comparisons = 0, swaps = 0, stepCount = 0

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

        callbacks.onStep?.()
        await animateCompare(svgRef.current, j, j + 1, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

        if (arr[j] > arr[j + 1]) {
          await animateSwap(svgRef.current, j, j + 1, arr, dimensions, anim)
          const temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp
          swaps++; stepCount++
          callbacks.onSwap?.(swaps, stepCount)
          if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
        }
      }
      stepCount++
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

registerSortAlgorithm('radix', {
  name: '基数排序',
  nameKey: 'sort.radix',
  timeComplexity: 'O(d·n)',
  spaceComplexity: 'O(n+k)',
  icon: '🔟',
  color: 'bg-accent-cyan',
  variant: 'teal',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    let comparisons = 0, swaps = 0, stepCount = 0

    const max = Math.max(...arr)
    let exp = 1

    while (Math.floor(max / exp) > 0) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

      const output = new Array(n).fill(0)
      const count = new Array(10).fill(0)

      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10
        count[digit]++
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1]
      }

      for (let i = n - 1; i >= 0; i--) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
        const digit = Math.floor(arr[i] / exp) % 10
        output[count[digit] - 1] = arr[i]
        count[digit]--
      }

      for (let i = 0; i < n; i++) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
        callbacks.onStep?.()
        await animateCompare(svgRef.current, i, i, arr, dimensions, anim)
        comparisons++
        stepCount++

        arr[i] = output[i]
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      exp *= 10
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

registerSortAlgorithm('bucket', {
  name: '桶排序',
  nameKey: 'sort.bucket',
  timeComplexity: 'O(n+k)',
  spaceComplexity: 'O(n+k)',
  icon: '🪣',
  color: 'bg-accent-indigo',
  variant: 'primary',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    let comparisons = 0, swaps = 0, stepCount = 0

    const max = Math.max(...arr)
    const min = Math.min(...arr)
    const bucketCount = Math.floor(Math.sqrt(n)) + 1
    const bucketRange = (max - min + 1) / bucketCount

    const buckets: number[][] = Array.from({ length: bucketCount }, () => [])

    for (let i = 0; i < n; i++) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      const bucketIdx = Math.min(Math.floor((arr[i] - min) / bucketRange), bucketCount - 1)
      buckets[bucketIdx].push(arr[i])
    }

    let idx = 0
    for (let b = 0; b < bucketCount; b++) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

      buckets[b].sort((a, c) => {
        comparisons++
        return a - c
      })

      for (let j = 0; j < buckets[b].length; j++) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
        callbacks.onStep?.()
        await animateCompare(svgRef.current, idx, idx, arr, dimensions, anim)
        stepCount++

        arr[idx] = buckets[b][j]
        swaps++
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
        idx++
      }
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

function quickSortMaxComparisons(n: number): number {
  return n * (n - 1) / 2
}

registerSortAlgorithm('quick', {
  name: '快速排序',
  nameKey: 'sort.quick',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(log n)',
  icon: '⚡',
  color: 'bg-accent-amber',
  variant: 'warning',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = quickSortMaxComparisons(n)
    let comparisons = 0, swaps = 0, stepCount = 0

    async function partition(low: number, high: number): Promise<number | undefined> {
      const pivot = arr[high]
      let i = low - 1

      for (let j = low; j < high; j++) {
        if (anim?.isAborted?.()) return undefined
        callbacks.onStep?.()
        await animateCompare(svgRef.current, j, high, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

        if (arr[j] <= pivot) {
          i++
          if (i !== j) {
            await animateSwap(svgRef.current, i, j, arr, dimensions, anim)
            const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp
            swaps++; stepCount++
            callbacks.onSwap?.(swaps, stepCount)
            if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
          }
        }
      }

      if (i + 1 !== high) {
        await animateSwap(svgRef.current, i + 1, high, arr, dimensions, anim)
        const temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp
        swaps++; stepCount++
        callbacks.onSwap?.(swaps, stepCount)
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      return i + 1
    }

    async function quickSort(low: number, high: number): Promise<void> {
      if (low >= high) return
      const pi = await partition(low, high)
      if (pi === undefined || anim?.isAborted?.()) return
      await quickSort(low, pi - 1)
      if (anim?.isAborted?.()) return
      await quickSort(pi + 1, high)
    }

    await quickSort(0, n - 1)
    if (!anim?.isAborted?.()) {
      await animateSorted(svgRef.current, arr, dimensions, anim)
    }
    return { comparisons, swaps, steps: stepCount }
  },
})

function mergeSortMaxSteps(n: number): number {
  if (n <= 1) return 0
  return n * Math.ceil(Math.log2(n)) + n
}

registerSortAlgorithm('merge', {
  name: '归并排序',
  nameKey: 'sort.merge',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  icon: '🔀',
  color: 'bg-accent-teal',
  variant: 'teal',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = mergeSortMaxSteps(n)
    let comparisons = 0, swaps = 0, stepCount = 0

    async function merge(left: number, mid: number, right: number): Promise<boolean> {
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)
      let i = 0, j = 0, k = left

      while (i < leftArr.length && j < rightArr.length) {
        if (anim?.isAborted?.()) return false
        callbacks.onStep?.()
        await animateCompare(svgRef.current, left + i, mid + 1 + j, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i]
          i++
        } else {
          arr[k] = rightArr[j]
          j++
          swaps++; stepCount++
          callbacks.onSwap?.(swaps, stepCount)
        }
        k++
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      while (i < leftArr.length) {
        if (anim?.isAborted?.()) return false
        arr[k] = leftArr[i]
        i++; k++
        stepCount++
        callbacks.onStep?.()
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      while (j < rightArr.length) {
        if (anim?.isAborted?.()) return false
        arr[k] = rightArr[j]
        j++; k++
        stepCount++
        callbacks.onStep?.()
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      return true
    }

    async function mergeSort(left: number, right: number): Promise<void> {
      if (left >= right) return
      const mid = Math.floor((left + right) / 2)
      await mergeSort(left, mid)
      if (anim?.isAborted?.()) return
      await mergeSort(mid + 1, right)
      if (anim?.isAborted?.()) return
      await merge(left, mid, right)
    }

    await mergeSort(0, n - 1)
    if (!anim?.isAborted?.()) {
      await animateSorted(svgRef.current, arr, dimensions, anim)
    }
    return { comparisons, swaps, steps: stepCount }
  },
})

function heapSortMaxComparisons(n: number): number {
  return n * Math.ceil(Math.log2(n))
}

registerSortAlgorithm('heap', {
  name: '堆排序',
  nameKey: 'sort.heapSort',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
  icon: '🏔️',
  color: 'bg-accent-rose',
  variant: 'danger',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = heapSortMaxComparisons(n)
    let comparisons = 0, swaps = 0, stepCount = 0

    async function heapify(size: number, root: number): Promise<boolean> {
      let largest = root
      const left = 2 * root + 1
      const right = 2 * root + 2

      if (left < size) {
        if (anim?.isAborted?.()) return false
        callbacks.onStep?.()
        await animateCompare(svgRef.current, left, largest, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))
        if (arr[left] > arr[largest]) largest = left
      }

      if (right < size) {
        if (anim?.isAborted?.()) return false
        callbacks.onStep?.()
        await animateCompare(svgRef.current, right, largest, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))
        if (arr[right] > arr[largest]) largest = right
      }

      if (largest !== root) {
        await animateSwap(svgRef.current, root, largest, arr, dimensions, anim)
        const temp = arr[root]; arr[root] = arr[largest]; arr[largest] = temp
        swaps++; stepCount++
        callbacks.onSwap?.(swaps, stepCount)
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
        return await heapify(size, largest)
      }

      return true
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      const ok = await heapify(n, i)
      if (!ok) return { comparisons, swaps, steps: stepCount, aborted: true }
    }

    for (let i = n - 1; i > 0; i--) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      await animateSwap(svgRef.current, 0, i, arr, dimensions, anim)
      const temp = arr[0]; arr[0] = arr[i]; arr[i] = temp
      swaps++; stepCount++
      callbacks.onSwap?.(swaps, stepCount)
      if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)

      const ok = await heapify(i, 0)
      if (!ok) return { comparisons, swaps, steps: stepCount, aborted: true }
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

registerSortAlgorithm('selection', {
  name: '选择排序',
  nameKey: 'sort.selection',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  icon: '👆',
  color: 'bg-accent-emerald',
  variant: 'success',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = quickSortMaxComparisons(n)
    let comparisons = 0, swaps = 0, stepCount = 0

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

        callbacks.onStep?.()
        await animateCompare(svgRef.current, minIdx, j, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))
        if (arr[j] < arr[minIdx]) minIdx = j
      }

      if (minIdx !== i) {
        await animateSwap(svgRef.current, i, minIdx, arr, dimensions, anim)
        const temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp
        swaps++; stepCount++
        callbacks.onSwap?.(swaps, stepCount)
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }
      stepCount++
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

registerSortAlgorithm('insertion', {
  name: '插入排序',
  nameKey: 'sort.insertion',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  icon: '📥',
  color: 'bg-accent-violet',
  variant: 'danger',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = bubbleMaxComparisons(n)
    let comparisons = 0, swaps = 0, stepCount = 0

    for (let i = 1; i < n; i++) {
      let j = i
      stepCount++
      callbacks.onStep?.()

      while (j > 0) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

        await animateCompare(svgRef.current, j - 1, j, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

        if (arr[j - 1] > arr[j]) {
          await animateSwap(svgRef.current, j - 1, j, arr, dimensions, anim)
          const temp = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = temp
          swaps++; j--
          callbacks.onSwap?.(swaps, stepCount)
          if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
        } else {
          break
        }
      }
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})
