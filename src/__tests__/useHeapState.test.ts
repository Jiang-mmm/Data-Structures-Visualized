import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHeapState } from '../hooks/useHeapState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useHeapState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始堆数据', () => {
      const { result } = renderHook(() => useHeapState())
      expect(result.current.data).toEqual([95, 80, 70, 60, 50, 40, 30])
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useHeapState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useHeapState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('heapSize 应该等于数据长度', () => {
      const { result } = renderHook(() => useHeapState())
      expect(result.current.heapSize).toBe(7)
    })
  })

  describe('insert 操作', () => {
    it('应该插入有效值到堆', () => {
      const { result } = renderHook(() => useHeapState())
      let success: boolean
      act(() => { success = result.current.insert(25) })
      expect(success).toBe(true)
      expect(result.current.data).toEqual([95, 80, 70, 60, 50, 40, 30, 25])
      expect(result.current.heapSize).toBe(8)
    })

    it('应该拒绝无效输入（非数字）', () => {
      const { result } = renderHook(() => useHeapState())
      let success: boolean
      act(() => { success = result.current.insert('abc') })
      expect(success).toBe(false)
      expect(result.current.heapSize).toBe(7)
    })

    it('应该拒绝超出范围的值（0 和 100）', () => {
      const { result } = renderHook(() => useHeapState())
      let success: boolean
      act(() => { success = result.current.insert(0) })
      expect(success).toBe(false)
      act(() => { success = result.current.insert(100) })
      expect(success).toBe(false)
      expect(result.current.heapSize).toBe(7)
    })

    it('应该接受边界值 1 和 99', () => {
      const { result } = renderHook(() => useHeapState())
      let success: boolean
      act(() => { success = result.current.insert(1) })
      expect(success).toBe(true)
      act(() => { success = result.current.insert(99) })
      expect(success).toBe(true)
      expect(result.current.heapSize).toBe(9)
    })

    it('应该拒绝 null/undefined 输入', () => {
      const { result } = renderHook(() => useHeapState())
      let success: boolean
      act(() => { success = result.current.insert(null as unknown as string) })
      expect(success).toBe(false)
      act(() => { success = result.current.insert(undefined as unknown as string) })
      expect(success).toBe(false)
    })
  })

  describe('extractMax 操作', () => {
    it('应该提取堆顶最大值', () => {
      const { result } = renderHook(() => useHeapState())
      let max: number | null
      act(() => { max = result.current.extractMax() })
      expect(max).toBe(95)
      expect(result.current.heapSize).toBe(6)
    })

    it('应该在提取后通过 siftDown 维护堆性质', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.extractMax() })
      expect(result.current.data[0]).toBe(80)
      expect(result.current.data.length).toBe(6)
    })

    it('应该返回 null 对于空堆', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.reset() })
      act(() => { result.current.loadData([]) })
      let max: number | null
      act(() => { max = result.current.extractMax() })
      expect(max).toBe(null)
    })

    it('应该正确处理单元素堆', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.loadData([42]) })
      let max: number | null
      act(() => { max = result.current.extractMax() })
      expect(max).toBe(42)
      expect(result.current.data).toEqual([])
      expect(result.current.heapSize).toBe(0)
    })

    it('应该支持连续提取多个元素', () => {
      const { result } = renderHook(() => useHeapState())
      let max1: number | null
      act(() => { max1 = result.current.extractMax() })
      act(() => { result.current.extractMax() })
      act(() => { result.current.extractMax() })
      expect(max1).toBe(95)
      expect(result.current.heapSize).toBe(4)
    })
  })

  describe('peek 操作', () => {
    it('应该返回堆顶元素但不移除', () => {
      const { result } = renderHook(() => useHeapState())
      let top: number | null
      act(() => { top = result.current.peek() })
      expect(top).toBe(95)
      expect(result.current.heapSize).toBe(7)
    })

    it('连续 peek 应该返回相同值', () => {
      const { result } = renderHook(() => useHeapState())
      let top1: number | null, top2: number | null
      act(() => { top1 = result.current.peek() })
      act(() => { top2 = result.current.peek() })
      expect(top1).toBe(top2)
    })

    it('应该返回 null 对于空堆', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.loadData([]) })
      let top: number | null
      act(() => { top = result.current.peek() })
      expect(top).toBe(null)
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始堆数据', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.insert(25) })
      expect(result.current.heapSize).toBe(8)
      act(() => { result.current.reset() })
      expect(result.current.data).toEqual([95, 80, 70, 60, 50, 40, 30])
      expect(result.current.heapSize).toBe(7)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.insert(25) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('loadData 操作', () => {
    it('应该加载新数据', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.loadData([10, 20, 30]) })
      expect(result.current.data).toEqual([10, 20, 30])
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.insert(25) })
      act(() => { result.current.loadData([1, 2]) })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销插入操作', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.insert(25) })
      expect(result.current.heapSize).toBe(8)
      act(() => { result.current.undo() })
      expect(result.current.heapSize).toBe(7)
      expect(result.current.data).toEqual([95, 80, 70, 60, 50, 40, 30])
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.insert(25) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.heapSize).toBe(8)
      expect(result.current.data).toEqual([95, 80, 70, 60, 50, 40, 30, 25])
    })

    it('应该支持撤销 extractMax 操作', () => {
      const { result } = renderHook(() => useHeapState())
      act(() => { result.current.extractMax() })
      expect(result.current.heapSize).toBe(6)
      act(() => { result.current.undo() })
      expect(result.current.heapSize).toBe(7)
      expect(result.current.data).toEqual([95, 80, 70, 60, 50, 40, 30])
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useHeapState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.insert(25) })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })
  })
})
