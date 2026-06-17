import { describe, it, expect, vi } from 'vitest'
import {
  getAllSortAlgorithms,
  getSortAlgorithm
} from '../algorithms/sorting'

const mockAnimFns = {
  animateCompare: vi.fn().mockResolvedValue(undefined),
  animateSwap: vi.fn().mockResolvedValue(undefined),
  animateSorted: vi.fn().mockResolvedValue(undefined),
  renderSortBars: vi.fn()
}

const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
const mockDimensions = { width: 800, height: 400 }
const mockAnim = { promise: Promise.resolve(), abort: vi.fn(), isAborted: vi.fn().mockReturnValue(false), resolve: vi.fn(), reject: vi.fn() }

function createCallbacks(onStep?: () => void) {
  return {
    onStep: onStep ? vi.fn(onStep) : vi.fn(),
    onCompare: vi.fn(),
    onSwap: vi.fn()
  }
}

async function runSort(key: string, arr: number[], onStep?: () => void) {
  const algo = getSortAlgorithm(key)
  if (!algo) throw new Error(`Algorithm "${key}" not found`)
  const callbacks = createCallbacks(onStep)
  vi.clearAllMocks()
  mockAnim.isAborted.mockReturnValue(false)
  await algo.execute(arr, mockAnimFns, mockSvgRef, mockDimensions, mockAnim, callbacks)
  return { result: arr, callbacks }
}

describe('getAllSortAlgorithms', () => {
  it('返回所有排序算法', () => {
    const algorithms = getAllSortAlgorithms()
    expect(algorithms.size).toBeGreaterThanOrEqual(7)
  })
})

describe('冒泡排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('bubble', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('选择排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('selection', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('插入排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('insertion', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('归并排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('merge', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('快速排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('quick', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('堆排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('heap', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('基数排序', () => {
  it('正确排序', async () => {
    const { result } = await runSort('radix', [5, 3, 1, 4, 2])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('空数组排序不报错', () => {
  const availableKeys = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'radix']

  for (const key of availableKeys) {
    it(`${key} 处理空数组`, async () => {
      const algo = getSortAlgorithm(key)
      if (!algo) return
      const callbacks = createCallbacks()
      vi.clearAllMocks()
      mockAnim.isAborted.mockReturnValue(false)
      await expect(
        algo.execute([], mockAnimFns, mockSvgRef, mockDimensions, mockAnim, callbacks)
      ).resolves.toBeDefined()
    })
  }
})

describe('单元素数组排序', () => {
  const availableKeys = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'radix']

  for (const key of availableKeys) {
    it(`${key} 处理单元素数组`, async () => {
      const { result } = await runSort(key, [1])
      expect(result).toEqual([1])
    })
  }
})

describe('已排序数组排序', () => {
  it('冒泡排序对已排序数组结果不变', async () => {
    const { result } = await runSort('bubble', [1, 2, 3, 4, 5])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('逆序数组排序', () => {
  it('快速排序对逆序数组正确排序', async () => {
    const { result } = await runSort('quick', [5, 4, 3, 2, 1])
    expect(result).toEqual([1, 2, 3, 4, 5])
  })
})

describe('排序过程调用 onStep 回调', () => {
  it('冒泡排序调用 onStep 回调', async () => {
    const stepFn = vi.fn()
    const { callbacks } = await runSort('bubble', [5, 3, 1], stepFn)
    expect(callbacks.onStep).toHaveBeenCalled()
    expect(callbacks.onStep.mock.calls.length).toBeGreaterThan(0)
  })
})
