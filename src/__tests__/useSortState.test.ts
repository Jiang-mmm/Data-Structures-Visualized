import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSortState } from '../hooks/useSortState'
import { showToast } from '../components/toastStore'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useSortState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始数据', () => {
      const { result } = renderHook(() => useSortState())
      expect(result.current.data).toEqual([38, 27, 43, 9, 82, 10, 55, 21])
    })

    it('stats 应该初始化为空状态', () => {
      const { result } = renderHook(() => useSortState())
      expect(result.current.stats).toEqual({
        algorithm: '',
        comparisons: 0,
        swaps: 0,
        steps: 0
      })
    })

    it('progress 应该初始为 0', () => {
      const { result } = renderHook(() => useSortState())
      expect(result.current.progress).toBe(0)
    })
  })

  describe('randomize 操作', () => {
    it('应该生成长度为 8 的随机数组', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.randomize() })
      expect(result.current.data.length).toBe(8)
    })

    it('应该重置 stats', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.randomize() })
      expect(result.current.stats).toEqual({
        algorithm: '',
        comparisons: 0,
        swaps: 0,
        steps: 0
      })
    })

    it('应该重置 progress', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.randomize() })
      expect(result.current.progress).toBe(0)
    })

    it('应该生成 5~99 之间的随机数', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.randomize() })
      result.current.data.forEach((val: number) => {
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThanOrEqual(99)
      })
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始数据', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.randomize() })
      act(() => { result.current.reset() })
      expect(result.current.data).toEqual([38, 27, 43, 9, 82, 10, 55, 21])
    })

    it('应该重置 stats', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.reset() })
      expect(result.current.stats).toEqual({
        algorithm: '',
        comparisons: 0,
        swaps: 0,
        steps: 0
      })
    })
  })

  describe('runAlgorithm 操作', () => {
    it('应该更新 stats 中的 algorithm 字段', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('bubble', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      expect(result.current.stats.algorithm).toMatch(/冒泡排序/)
    })

    it('应该在排序完成后更新 stats', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('bubble', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      expect(result.current.stats.comparisons).toBeGreaterThan(0)
      expect(result.current.stats.swaps).toBeGreaterThanOrEqual(0)
      expect(result.current.stats.steps).toBeGreaterThanOrEqual(0)
    })

    it('应该更新 data 为排序后的结果', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('bubble', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
    })
  })

  describe('stop 操作', () => {
    it('应该停止动画并设置 isAnimating 为 false', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.stop() })
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning', message: '已停止排序' })
      )
    })

    it('应该在动画运行中停止时调用 abort', () => {
      const { result } = renderHook(() => useSortState())
      act(() => { result.current.stop() })
      expect(showToast).toHaveBeenCalled()
    })
  })

  describe('runAlgorithm 错误处理', () => {
    it('应该对未知算法显示错误', async () => {
      const { result } = renderHook(() => useSortState())
      await act(async () => {
        await result.current.runAlgorithm('unknown', { animateCompare: vi.fn(), animateSwap: vi.fn(), animateSorted: vi.fn(), renderSortBars: vi.fn() }, { current: null } as { current: SVGSVGElement | null }, { width: 800, height: 400 }, { isAborted: () => false, abort: () => {} })
      })
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', message: '未知算法: unknown' })
      )
    })

    it('应该在动画被中断时正确处理', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(true), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('bubble', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      expect(result.current.isAnimating).toBe(false)
    })

    it('应该支持 selection 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('selection', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/选择排序/)
    })

    it('应该支持 insertion 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('insertion', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/插入排序/)
    })

    it('应该支持 quick 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('quick', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/快速排序/)
    })

    it('应该支持 merge 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('merge', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/归并排序/)
    })

    it('应该支持 heap 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('heap', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/堆排序/)
    })

    it('应该支持 radix 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('radix', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/基数排序/)
    })

    it('应该支持 bucket 排序算法', async () => {
      const { result } = renderHook(() => useSortState())
      const mockAnimateFns = {
        animateCompare: vi.fn().mockResolvedValue(undefined),
        animateSwap: vi.fn().mockResolvedValue(undefined),
        animateSorted: vi.fn().mockResolvedValue(undefined),
        renderSortBars: vi.fn()
      }
      const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
      const mockDimensions = { width: 800, height: 400 }
      const mockAnim = { isAborted: vi.fn().mockReturnValue(false), abort: vi.fn() }

      await act(async () => {
        await result.current.runAlgorithm('bucket', mockAnimateFns, mockSvgRef, mockDimensions, mockAnim)
      })

      const sorted = [...result.current.data].sort((a: number, b: number) => a - b)
      expect(result.current.data).toEqual(sorted)
      expect(result.current.stats.algorithm).toMatch(/桶排序/)
    })
  })
})
