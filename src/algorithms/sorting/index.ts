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
  icon: '○',
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
  icon: '#',
  color: 'bg-accent-cyan',
  variant: 'teal',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    let comparisons = 0
    const swaps = 0
    let stepCount = 0

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
  icon: '▧',
  color: 'bg-accent-indigo',
  variant: 'primary',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    let comparisons = 0, swaps = 0, stepCount = 0

    const max = Math.max(...arr)
    const min = Math.min(...arr)
    const bucketCount = Math.floor(Math.sqrt(n)) + 1
    const bucketRange = (max - min + 1) / bucketCount

    const buckets: number[][] = Array.from({ length: bucketCount }, (): number[] => [])

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
  icon: '◆',
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
  icon: '⇌',
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
  icon: '△',
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
  icon: '◎',
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
  icon: '↙',
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

/**
 * 希尔排序（Shell Sort）
 * 时间复杂度: O(n log²n)（取决于间隔序列）
 * 空间复杂度: O(1)
 * 是插入排序的改进版，通过逐步缩小的间隔对子序列进行插入排序
 */
registerSortAlgorithm('shell', {
  name: '希尔排序',
  nameKey: 'sort.shell',
  timeComplexity: 'O(n log²n)',
  spaceComplexity: 'O(1)',
  icon: '◇',
  color: 'bg-accent-amber',
  variant: 'warning',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = n * Math.ceil(Math.log2(n))
    let comparisons = 0, swaps = 0, stepCount = 0

    // 使用 Knuth 间隔序列：1, 4, 13, 40, 121, ...
    let gap = 1
    while (gap < n / 3) gap = gap * 3 + 1

    while (gap >= 1) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

      // 对每个间隔 gap 进行插入排序
      for (let i = gap; i < n; i++) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

        let j = i
        while (j >= gap) {
          if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

          callbacks.onStep?.()
          await animateCompare(svgRef.current, j - gap, j, arr, dimensions, anim)
          comparisons++
          callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

          if (arr[j - gap] > arr[j]) {
            await animateSwap(svgRef.current, j - gap, j, arr, dimensions, anim)
            const temp = arr[j]; arr[j] = arr[j - gap]; arr[j - gap] = temp
            swaps++; j -= gap
            stepCount++
            callbacks.onSwap?.(swaps, stepCount)
            if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
          } else {
            break
          }
        }
      }

      gap = Math.floor(gap / 3)
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

/**
 * 梳排序（Comb Sort）
 * 时间复杂度: O(n²)（最坏）/ O(n log n)（平均）
 * 空间复杂度: O(1)
 * 冒泡排序的改进版，使用逐步缩小的间隔（收缩因子 1.3）消除小值靠近末尾的"乌龟"问题
 */
registerSortAlgorithm('comb', {
  name: '梳排序',
  nameKey: 'sort.comb',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(1)',
  icon: '▣',
  color: 'bg-accent-cyan',
  variant: 'teal',
  execute: async (arr, { animateCompare, animateSwap, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = n * Math.ceil(Math.log2(n))
    let comparisons = 0, swaps = 0, stepCount = 0

    let gap = n
    const shrinkFactor = 1.3
    let swapped = true

    while (gap > 1 || swapped) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

      // 收缩间隔
      gap = Math.floor(gap / shrinkFactor)
      if (gap < 1) gap = 1

      swapped = false

      for (let i = 0; i + gap < n; i++) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }

        callbacks.onStep?.()
        await animateCompare(svgRef.current, i, i + gap, arr, dimensions, anim)
        comparisons++
        callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

        if (arr[i] > arr[i + gap]) {
          await animateSwap(svgRef.current, i, i + gap, arr, dimensions, anim)
          const temp = arr[i]; arr[i] = arr[i + gap]; arr[i + gap] = temp
          swaps++; stepCount++
          swapped = true
          callbacks.onSwap?.(swaps, stepCount)
          if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
        }
      }
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

/**
 * TimSort（简化版）
 * 时间复杂度: O(n log n)
 * 空间复杂度: O(n)
 * 结合归并排序和插入排序的混合算法，对小规模子序列使用插入排序，再合并
 * 此处为教学简化版，使用固定 run 长度 32
 */
registerSortAlgorithm('tim', {
  name: 'TimSort',
  nameKey: 'sort.tim',
  timeComplexity: 'O(n log n)',
  spaceComplexity: 'O(n)',
  icon: '◈',
  color: 'bg-accent-indigo',
  variant: 'primary',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    const total = n * Math.ceil(Math.log2(n))
    let comparisons = 0, swaps = 0, stepCount = 0
    const RUN = 32

    // 对长度 <= RUN 的子序列使用插入排序
    async function insertionSort(left: number, right: number): Promise<boolean> {
      for (let i = left + 1; i <= right; i++) {
        if (anim?.isAborted?.()) return false
        const temp = arr[i]
        let j = i - 1

        while (j >= left) {
          if (anim?.isAborted?.()) return false
          callbacks.onStep?.()
          await animateCompare(svgRef.current, j, j + 1, arr, dimensions, anim)
          comparisons++
          callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

          if (arr[j] > temp) {
            arr[j + 1] = arr[j]
            swaps++; stepCount++
            callbacks.onSwap?.(swaps, stepCount)
            j--
          } else {
            break
          }
        }
        arr[j + 1] = temp
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }
      return true
    }

    // 合并两个有序子序列
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
        i++; k++; stepCount++
        callbacks.onStep?.()
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      while (j < rightArr.length) {
        if (anim?.isAborted?.()) return false
        arr[k] = rightArr[j]
        j++; k++; stepCount++
        callbacks.onStep?.()
        if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
      }

      return true
    }

    // 1. 对每个 RUN 长度的子序列进行插入排序
    for (let i = 0; i < n; i += RUN) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      const right = Math.min(i + RUN - 1, n - 1)
      const ok = await insertionSort(i, right)
      if (!ok) return { comparisons, swaps, steps: stepCount, aborted: true }
    }

    // 2. 逐步合并有序子序列，每次合并的跨度翻倍
    for (let size = RUN; size < n; size *= 2) {
      for (let left = 0; left < n; left += 2 * size) {
        if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
        const mid = left + size - 1
        const right = Math.min(left + 2 * size - 1, n - 1)
        if (mid < right) {
          const ok = await merge(left, mid, right)
          if (!ok) return { comparisons, swaps, steps: stepCount, aborted: true }
        }
      }
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})

registerSortAlgorithm('counting', {
  name: '计数排序',
  nameKey: 'sort.counting',
  timeComplexity: 'O(n+k)',
  spaceComplexity: 'O(n+k)',
  icon: '⊞',
  color: 'bg-accent-cyan',
  variant: 'teal',
  execute: async (arr, { animateCompare, animateSorted, renderSortBars }, svgRef, dimensions, anim, callbacks) => {
    const n = arr.length
    let comparisons = 0, swaps = 0, stepCount = 0

    if (n === 0) {
      return { comparisons, swaps, steps: stepCount }
    }

    const max = Math.max(...arr)
    const min = Math.min(...arr)
    const range = max - min + 1
    const total = n + range

    // 1. 统计每个值出现次数
    const count = new Array(range).fill(0)
    for (let i = 0; i < n; i++) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      count[arr[i] - min]++
    }

    // 2. 累加计数，转换为位置索引
    for (let i = 1; i < range; i++) {
      count[i] += count[i - 1]
    }

    // 3. 按逆序将元素放入输出数组（保证稳定性）
    const output = new Array(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      const idx = arr[i] - min
      output[count[idx] - 1] = arr[i]
      count[idx]--
    }

    // 4. 将排序结果复制回原数组，逐步可视化
    for (let i = 0; i < n; i++) {
      if (anim?.isAborted?.()) return { comparisons, swaps, steps: stepCount, aborted: true }
      callbacks.onStep?.()
      await animateCompare(svgRef.current, i, i, arr, dimensions, anim)
      comparisons++
      stepCount++
      callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))

      arr[i] = output[i]
      swaps++
      callbacks.onSwap?.(swaps, stepCount)
      if (svgRef.current) renderSortBars(svgRef.current, arr, dimensions)
    }

    await animateSorted(svgRef.current, arr, dimensions, anim)
    return { comparisons, swaps, steps: stepCount }
  },
})
