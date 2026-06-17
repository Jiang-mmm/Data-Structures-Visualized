import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLinkedListState } from '../hooks/useLinkedListState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useLinkedListState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始数据', () => {
      const { result } = renderHook(() => useLinkedListState())
      expect(result.current.data).toEqual([10, 20, 30, 40])
    })

    it('应该有正确的初始长度', () => {
      const { result } = renderHook(() => useLinkedListState())
      expect(result.current.length).toBe(4)
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useLinkedListState())
      expect(result.current.logs).toEqual([])
    })
  })

  describe('insertHead 操作', () => {
    it('应该在头部插入有效值', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead(5) })
      expect(result.current.data).toEqual([5, 10, 20, 30, 40])
    })

    it('应该更新长度', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead(1) })
      expect(result.current.length).toBe(5)
    })

    it('应该拒绝无效输入', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead('abc') })
      expect(result.current.data).toEqual([10, 20, 30, 40])
    })
  })

  describe('insertTail 操作', () => {
    it('应该在尾部插入有效值', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertTail(50) })
      expect(result.current.data).toEqual([10, 20, 30, 40, 50])
    })

    it('应该更新长度', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertTail(99) })
      expect(result.current.length).toBe(5)
    })

    it('应该拒绝无效输入', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertTail('') })
      expect(result.current.data).toEqual([10, 20, 30, 40])
    })
  })

  describe('insertAt 操作', () => {
    it('应该在指定位置插入有效值', () => {
      const { result } = renderHook(() => useLinkedListState())
      let success = false as boolean
      act(() => { success = result.current.insertAt(2, 25) })
      expect(success).toBe(true)
      expect(result.current.data).toEqual([10, 20, 25, 30, 40])
    })

    it('应该在开头插入 (index === 0)', () => {
      const { result } = renderHook(() => useLinkedListState())
      let success = false as boolean
      act(() => { success = result.current.insertAt(0, 5) })
      expect(success).toBe(true)
      expect(result.current.data).toEqual([5, 10, 20, 30, 40])
    })

    it('应该在末尾插入 (index === length)', () => {
      const { result } = renderHook(() => useLinkedListState())
      let success = false as boolean
      act(() => { success = result.current.insertAt(4, 50) })
      expect(success).toBe(true)
      expect(result.current.data).toEqual([10, 20, 30, 40, 50])
    })

    it('应该拒绝索引越界 (index < 0)', () => {
      const { result } = renderHook(() => useLinkedListState())
      let success = false as boolean
      act(() => { success = result.current.insertAt(-1, 5) })
      expect(success).toBe(false)
    })

    it('应该拒绝索引越界 (index > length)', () => {
      const { result } = renderHook(() => useLinkedListState())
      let success = false as boolean
      act(() => { success = result.current.insertAt(10, 5) })
      expect(success).toBe(false)
    })

    it('应该拒绝无效输入', () => {
      const { result } = renderHook(() => useLinkedListState())
      let success = false as boolean
      act(() => { success = result.current.insertAt(1, 'abc') })
      expect(success).toBe(false)
    })
  })

  describe('deleteAt 操作', () => {
    it('应该删除指定位置的元素', () => {
      const { result } = renderHook(() => useLinkedListState())
      let removed: number | null = null
      act(() => { removed = result.current.deleteAt(1) })
      expect(removed).toBe(20)
      expect(result.current.data).toEqual([10, 30, 40])
    })

    it('应该删除头元素', () => {
      const { result } = renderHook(() => useLinkedListState())
      let removed: number | null = null
      act(() => { removed = result.current.deleteAt(0) })
      expect(removed).toBe(10)
      expect(result.current.data).toEqual([20, 30, 40])
    })

    it('应该删除尾元素', () => {
      const { result } = renderHook(() => useLinkedListState())
      let removed: number | null = null
      act(() => { removed = result.current.deleteAt(3) })
      expect(removed).toBe(40)
      expect(result.current.data).toEqual([10, 20, 30])
    })

    it('应该返回 null 对于索引越界 (负数)', () => {
      const { result } = renderHook(() => useLinkedListState())
      let removed: number | null = null
      act(() => { removed = result.current.deleteAt(-1) })
      expect(removed).toBe(null)
    })

    it('应该返回 null 对于索引越界 (大于等于长度)', () => {
      const { result } = renderHook(() => useLinkedListState())
      let removed: number | null = null
      act(() => { removed = result.current.deleteAt(4) })
      expect(removed).toBe(null)
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的元素', () => {
      const { result } = renderHook(() => useLinkedListState())
      let index: number = -1
      act(() => { index = result.current.search(30) })
      expect(index).toBe(2)
    })

    it('应该返回 -1 对于不存在的元素', () => {
      const { result } = renderHook(() => useLinkedListState())
      let index: number = -1
      act(() => { index = result.current.search(999) })
      expect(index).toBe(-1)
    })
  })

  describe('reverse 操作', () => {
    it('应该反转链表', () => {
      const { result } = renderHook(() => useLinkedListState())
      let reversed: number[] = [] as any
      act(() => { reversed = result.current.reverse() })
      expect(reversed).toEqual([40, 30, 20, 10])
      expect(result.current.data).toEqual([40, 30, 20, 10])
    })

    it('应该返回单元素链表的反转结果', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.loadData([42]) })
      let reversed: number[] = [] as any
      act(() => { reversed = result.current.reverse() })
      expect(reversed).toEqual([42])
    })
  })

  describe('detectCycle 操作', () => {
    it('应该返回无环结果对于普通链表', () => {
      const { result } = renderHook(() => useLinkedListState())
      let cycleResult: { hasCycle: boolean; steps: unknown[] } = { hasCycle: false, steps: [] }
      act(() => { cycleResult = result.current.detectCycle() })
      expect(cycleResult.hasCycle).toBe(false)
      expect(Array.isArray(cycleResult.steps)).toBe(true)
    })

    it('应该返回无环结果对于空链表', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.loadData([]) })
      let cycleResult: { hasCycle: boolean; steps: unknown[] } = { hasCycle: false, steps: [] }
      act(() => { cycleResult = result.current.detectCycle() })
      expect(cycleResult.hasCycle).toBe(false)
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始数据', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead(5) })
      expect(result.current.data.length).toBe(5)
      act(() => { result.current.reset() })
      expect(result.current.data).toEqual([10, 20, 30, 40])
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead(5) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('loadData 操作', () => {
    it('应该加载新数据', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.loadData([1, 2, 3]) })
      expect(result.current.data).toEqual([1, 2, 3])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销操作', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead(5) })
      expect(result.current.data).toEqual([5, 10, 20, 30, 40])
      act(() => { result.current.undo() })
      expect(result.current.data).toEqual([10, 20, 30, 40])
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useLinkedListState())
      act(() => { result.current.insertHead(5) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.data).toEqual([5, 10, 20, 30, 40])
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useLinkedListState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.insertHead(5) })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })
  })
})
