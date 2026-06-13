import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStackState } from '../hooks/useStackState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useStackState.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始数据', () => {
      const { result } = renderHook(() => useStackState())
      expect(result.current.data).toEqual([8, 17, 42])
    })

    it('size 应该等于数据长度', () => {
      const { result } = renderHook(() => useStackState())
      expect(result.current.size).toBe(3)
    })
  })

  describe('push 操作', () => {
    it('应该成功入栈有效值', () => {
      const { result } = renderHook(() => useStackState())
      let success: boolean
      act(() => { success = result.current.push(50) })
      expect(success).toBe(true)
      expect(result.current.data).toEqual([8, 17, 42, 50])
    })

    it('应该更新 size', () => {
      const { result } = renderHook(() => useStackState())
      act(() => { result.current.push(5) })
      expect(result.current.size).toBe(4)
    })

    it('应该拒绝超过最大数量的栈', () => {
      const { result } = renderHook(() => useStackState())
      act(() => { result.current.loadData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) })
      expect(result.current.data.length).toBe(10)
      let success: boolean
      act(() => { success = result.current.push(11) })
      expect(success).toBe(false)
      expect(result.current.data.length).toBe(10)
    })

    it('应该拒绝无效输入', () => {
      const { result } = renderHook(() => useStackState())
      let success: boolean
      act(() => { success = result.current.push('abc' as any) })
      expect(success).toBe(false)
    })

    it('应该接受边界值 1 和 99', () => {
      const { result } = renderHook(() => useStackState())
      let success: boolean
      act(() => { success = result.current.push(1) })
      expect(success).toBe(true)
      act(() => { success = result.current.push(99) })
      expect(success).toBe(true)
    })
  })

  describe('pop 操作', () => {
    it('应该成功出栈并返回栈顶元素', () => {
      const { result } = renderHook(() => useStackState())
      let popped: number | null
      act(() => { popped = result.current.pop() })
      expect(popped).toBe(42)
      expect(result.current.data).toEqual([8, 17])
    })

    it('应该更新 size', () => {
      const { result } = renderHook(() => useStackState())
      act(() => { result.current.pop() })
      expect(result.current.size).toBe(2)
    })

    it('应该拒绝空栈出栈', () => {
      const { result } = renderHook(() => useStackState())
      act(() => { result.current.loadData([]) })
      let popped: number | null
      act(() => { popped = result.current.pop() })
      expect(popped).toBe(null)
      expect(result.current.data).toEqual([])
    })
  })

  describe('peek 操作', () => {
    it('应该返回栈顶元素而不删除', () => {
      const { result } = renderHook(() => useStackState())
      let top: number | null
      act(() => { top = result.current.peek() })
      expect(top).toBe(42)
      expect(result.current.data).toEqual([8, 17, 42])
    })

    it('应该返回空栈的 null', () => {
      const { result } = renderHook(() => useStackState())
      act(() => { result.current.loadData([]) })
      let top: number | null
      act(() => { top = result.current.peek() })
      expect(top).toBe(null)
    })
  })

  describe('clear 操作', () => {
    it('应该清空栈', () => {
      const { result } = renderHook(() => useStackState())
      act(() => { result.current.clear() })
      expect(result.current.data).toEqual([])
      expect(result.current.size).toBe(0)
    })
  })
})
