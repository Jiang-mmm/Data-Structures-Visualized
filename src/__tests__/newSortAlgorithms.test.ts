import { describe, it, expect } from 'vitest'
import { getSortAlgorithm } from '../algorithms/sorting'

/**
 * 新增排序算法单元测试
 * 使用 mock 的 animationFns 避免实际 SVG 操作
 */
const mockAnimationFns = {
  animateCompare: async () => {},
  animateSwap: async () => {},
  animateSorted: async () => {},
  renderSortBars: () => {},
}

const dimensions = { width: 800, height: 400 }

describe('Shell Sort（希尔排序）', () => {
  it('应该正确排序随机数组', async () => {
    const algo = getSortAlgorithm('shell')
    expect(algo).toBeDefined()
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const result = await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(result.comparisons).toBeGreaterThan(0)
  })

  it('应该正确排序已排序数组', async () => {
    const algo = getSortAlgorithm('shell')
    const arr = [1, 2, 3, 4, 5]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('应该正确排序逆序数组', async () => {
    const algo = getSortAlgorithm('shell')
    const arr = [5, 4, 3, 2, 1]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('应该正确排序单元素数组', async () => {
    const algo = getSortAlgorithm('shell')
    const arr = [42]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([42])
  })

  it('应该正确排序空数组', async () => {
    const algo = getSortAlgorithm('shell')
    const arr: number[] = []
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([])
  })
})

describe('Comb Sort（梳排序）', () => {
  it('应该正确排序随机数组', async () => {
    const algo = getSortAlgorithm('comb')
    expect(algo).toBeDefined()
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const result = await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(result.comparisons).toBeGreaterThan(0)
  })

  it('应该正确排序已排序数组', async () => {
    const algo = getSortAlgorithm('comb')
    const arr = [1, 2, 3, 4, 5]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('应该正确排序逆序数组', async () => {
    const algo = getSortAlgorithm('comb')
    const arr = [5, 4, 3, 2, 1]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('应该正确排序含重复元素数组', async () => {
    const algo = getSortAlgorithm('comb')
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9])
  })
})

describe('TimSort', () => {
  it('应该正确排序随机数组', async () => {
    const algo = getSortAlgorithm('tim')
    expect(algo).toBeDefined()
    const arr = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const result = await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(result.comparisons).toBeGreaterThan(0)
  })

  it('应该正确排序已排序数组', async () => {
    const algo = getSortAlgorithm('tim')
    const arr = [1, 2, 3, 4, 5]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('应该正确排序逆序数组', async () => {
    const algo = getSortAlgorithm('tim')
    const arr = [5, 4, 3, 2, 1]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([1, 2, 3, 4, 5])
  })

  it('应该正确排序大数组', async () => {
    const algo = getSortAlgorithm('tim')
    const arr = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000))
    const expected = [...arr].sort((a, b) => a - b)
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual(expected)
  })

  it('应该正确排序单元素数组', async () => {
    const algo = getSortAlgorithm('tim')
    const arr = [42]
    await algo!.execute(arr, mockAnimationFns as any, { current: null } as any, dimensions, undefined, {})
    expect(arr).toEqual([42])
  })
})
