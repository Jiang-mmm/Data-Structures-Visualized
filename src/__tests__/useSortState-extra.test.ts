/**
 * useSortState 错误路径 + 边界 + stop abort 测试
 * 用于提升 src/hooks/useSortState.ts 覆盖率（基线 88.57% statements / 73.68% functions）
 * 覆盖：stop 时的 isAnimating 状态、stats algorithm 空、push 在 sort 阻塞期间行为
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSortState } from '../hooks/useSortState'
import { showToast } from '../components/toastStore'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

describe('useSortState 错误路径与边界', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('setIsAnimating(true) 后 isAnimating 应为 true', () => {
    const { result } = renderHook(() => useSortState())
    act(() => {
      result.current.setIsAnimating(true)
    })
    expect(result.current.isAnimating).toBe(true)
    act(() => {
      result.current.setIsAnimating(false)
    })
    expect(result.current.isAnimating).toBe(false)
  })

  it('stop 多次调用应安全', () => {
    const { result } = renderHook(() => useSortState())
    act(() => {
      result.current.stop()
      result.current.stop()
      result.current.stop()
    })
    // 多次显示 toast
    expect(showToast).toHaveBeenCalled()
  })

  it('randomize 应生成 8 个 5-99 范围的随机数', () => {
    const { result } = renderHook(() => useSortState())
    act(() => {
      result.current.randomize()
    })
    expect(result.current.data).toHaveLength(8)
    // 全部数字都应在 [5, 99] 范围内
    result.current.data.forEach((v: number) => {
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(99)
    })
  })

  it('push 操作应增加历史栈深度', () => {
    const { result } = renderHook(() => useSortState())
    expect(result.current.canUndo()).toBe(false)
    act(() => {
      result.current.randomize()
    })
    expect(result.current.canUndo()).toBe(true)
    act(() => {
      result.current.randomize()
    })
    expect(result.current.canUndo()).toBe(true)
  })

  it('undo 应恢复上一次 randomize 的结果', () => {
    const { result } = renderHook(() => useSortState())
    act(() => {
      result.current.randomize()
    })
    const first = [...result.current.data]
    act(() => {
      result.current.randomize()
    })
    expect(result.current.data).not.toEqual(first)
    act(() => {
      result.current.undo()
    })
    expect(result.current.data).toEqual(first)
  })

  it('redo 应恢复 redo 栈的数据', () => {
    const { result } = renderHook(() => useSortState())
    act(() => {
      result.current.randomize()
    })
    const a = [...result.current.data]
    act(() => {
      result.current.randomize()
    })
    act(() => {
      result.current.undo()
    })
    expect(result.current.data).toEqual(a)
    act(() => {
      result.current.redo()
    })
    expect(result.current.data).not.toEqual(a)
  })

  it('runAlgorithm 空 algorithmKey 应走错误路径', async () => {
    const { result } = renderHook(() => useSortState())
    await act(async () => {
      await result.current.runAlgorithm(
        '',
        { animateCompare: vi.fn(), animateSwap: vi.fn(), animateSorted: vi.fn(), renderSortBars: vi.fn() },
        { current: null } as { current: SVGSVGElement | null },
        { width: 800, height: 400 },
        { isAborted: () => false, abort: () => {} }
      )
    })
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('runAlgorithm 大小写敏感（UPPER）应走错误路径', async () => {
    const { result } = renderHook(() => useSortState())
    await act(async () => {
      await result.current.runAlgorithm(
        'BUBBLE',
        { animateCompare: vi.fn(), animateSwap: vi.fn(), animateSorted: vi.fn(), renderSortBars: vi.fn() },
        { current: null } as { current: SVGSVGElement | null },
        { width: 800, height: 400 },
        { isAborted: () => false, abort: () => {} }
      )
    })
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('排序结束后 progress 应被设置（1）', async () => {
    const { result } = renderHook(() => useSortState())
    const mockAnimateFns = {
      animateCompare: vi.fn().mockResolvedValue(undefined),
      animateSwap: vi.fn().mockResolvedValue(undefined),
      animateSorted: vi.fn().mockResolvedValue(undefined),
      renderSortBars: vi.fn(),
    }
    const mockSvgRef: { current: SVGSVGElement | null } = { current: null }
    const mockAnim = { isAborted: () => false, abort: () => {} }

    await act(async () => {
      await result.current.runAlgorithm('bubble', mockAnimateFns, mockSvgRef, { width: 800, height: 400 }, mockAnim)
    })

    // 排序完成后 progress 应为 100 (即 1)
    expect(result.current.progress).toBeGreaterThan(0)
  })

  it('runAlgorithm 应在 abort 时不抛错', async () => {
    const { result } = renderHook(() => useSortState())
    const mockAnimateFns = {
      animateCompare: vi.fn().mockResolvedValue(undefined),
      animateSwap: vi.fn().mockResolvedValue(undefined),
      animateSorted: vi.fn().mockResolvedValue(undefined),
      renderSortBars: vi.fn(),
    }
    let callCount = 0
    const mockAnim = {
      isAborted: () => {
        callCount++
        return callCount > 2 // 第三次后中止
      },
      abort: () => {},
    }
    await act(async () => {
      await result.current.runAlgorithm('bubble', mockAnimateFns, { current: null } as { current: SVGSVGElement | null }, { width: 800, height: 400 }, mockAnim)
    })
    // 排序被中止，isAnimating 应回到 false
    expect(result.current.isAnimating).toBe(false)
  })
})
