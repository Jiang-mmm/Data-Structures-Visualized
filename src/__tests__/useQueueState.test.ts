import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQueueState } from '../hooks/useQueueState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useQueueState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始数据', () => {
      const { result } = renderHook(() => useQueueState())
      expect(result.current.data).toEqual([10, 20, 30])
    })

    it('size 应该等于数据长度', () => {
      const { result } = renderHook(() => useQueueState())
      expect(result.current.size).toBe(3)
    })
  })

  describe('enqueue 操作', () => {
    it('应该成功入队有效值', () => {
      const { result } = renderHook(() => useQueueState())
      let success: boolean
      act(() => { success = result.current.enqueue(40) })
      expect(success).toBe(true)
      expect(result.current.data).toEqual([10, 20, 30, 40])
    })

    it('应该更新 size', () => {
      const { result } = renderHook(() => useQueueState())
      act(() => { result.current.enqueue(40) })
      expect(result.current.size).toBe(4)
    })

    it('应该拒绝超过最大数量的队列', () => {
      const { result } = renderHook(() => useQueueState())
      act(() => { result.current.loadData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) })
      expect(result.current.data.length).toBe(10)
      let success: boolean
      act(() => { success = result.current.enqueue(11) })
      expect(success).toBe(false)
      expect(result.current.data.length).toBe(10)
    })

    it('应该拒绝无效输入', () => {
      const { result } = renderHook(() => useQueueState())
      let success: boolean
      act(() => { success = result.current.enqueue('abc') })
      expect(success).toBe(false)
    })

    it('应该接受边界值 1 和 99', () => {
      const { result } = renderHook(() => useQueueState())
      let success: boolean
      act(() => { success = result.current.enqueue(1) })
      expect(success).toBe(true)
      act(() => { success = result.current.enqueue(99) })
      expect(success).toBe(true)
    })
  })

  describe('dequeue 操作', () => {
    it('应该成功出队并返回队首元素', () => {
      const { result } = renderHook(() => useQueueState())
      let dequeued: number | null
      act(() => { dequeued = result.current.dequeue() })
      expect(dequeued).toBe(10)
      expect(result.current.data).toEqual([20, 30])
    })

    it('应该更新 size', () => {
      const { result } = renderHook(() => useQueueState())
      act(() => { result.current.dequeue() })
      expect(result.current.size).toBe(2)
    })

    it('应该拒绝空队出队', () => {
      const { result } = renderHook(() => useQueueState())
      act(() => { result.current.loadData([]) })
      let dequeued: number | null
      act(() => { dequeued = result.current.dequeue() })
      expect(dequeued).toBe(null)
      expect(result.current.data).toEqual([])
    })
  })

  describe('front 操作', () => {
    it('应该返回队首元素而不删除', () => {
      const { result } = renderHook(() => useQueueState())
      let front: number | null
      act(() => { front = result.current.front() })
      expect(front).toBe(10)
      expect(result.current.data).toEqual([10, 20, 30])
    })

    it('应该返回空队的 null', () => {
      const { result } = renderHook(() => useQueueState())
      act(() => { result.current.loadData([]) })
      let front: number | null
      act(() => { front = result.current.front() })
      expect(front).toBe(null)
    })
  })

  describe('clear 操作', () => {
    it('应该清空队列', () => {
      const { result } = renderHook(() => useQueueState())
      act(() => { result.current.clear() })
      expect(result.current.data).toEqual([])
      expect(result.current.size).toBe(0)
    })
  })
})
