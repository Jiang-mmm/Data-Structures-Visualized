import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHashState } from '../hooks/useHashState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useHashState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始条目', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.data).toEqual([
        { key: 12, value: 'Alice' },
        { key: 25, value: 'Bob' },
        { key: 42, value: 'Charlie' },
        { key: 19, value: 'Diana' },
      ])
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('bucketCount 应该为 7', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.bucketCount).toBe(7)
    })

    it('entryCount 应该等于数据长度', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.entryCount).toBe(4)
    })
  })

  describe('hashFn 函数', () => {
    it('应该正确计算 12 的哈希值', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.hashFn(12)).toBe(5)
    })

    it('应该正确计算 25 的哈希值', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.hashFn(25)).toBe(4)
    })

    it('应该正确计算 42 的哈希值', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.hashFn(42)).toBe(0)
    })

    it('应该正确计算 19 的哈希值', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.hashFn(19)).toBe(5)
    })

    it('12 和 19 应该冲突（同一桶）', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.hashFn(12)).toBe(result.current.hashFn(19))
    })
  })

  describe('insert 操作', () => {
    it('应该插入新的键值对', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.insert(7, 'Test') })
      expect(success).toBe(true)
      expect(result.current.entryCount).toBe(5)
      expect(result.current.data).toContainEqual({ key: 7, value: 'Test' })
    })

    it('应该更新已存在的键的值', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.insert(12, 'Updated') })
      expect(success).toBe(true)
      const entry = result.current.data.find((e: { key: number; value: string }) => e.key === 12)
      expect(entry!.value).toBe('Updated')
      expect(result.current.entryCount).toBe(4)
    })

    it('应该拒绝无效键（非数字）', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.insert('abc', 'Test') })
      expect(success).toBe(false)
      expect(result.current.entryCount).toBe(4)
    })

    it('应该拒绝超出范围的键（0 和 100）', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.insert(0, 'Test') })
      expect(success).toBe(false)
      act(() => { success = result.current.insert(100, 'Test') })
      expect(success).toBe(false)
      expect(result.current.entryCount).toBe(4)
    })

    it('应该接受边界值键 1 和 99', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.insert(1, 'One') })
      expect(success).toBe(true)
      act(() => { success = result.current.insert(99, 'NinetyNine') })
      expect(success).toBe(true)
      expect(result.current.entryCount).toBe(6)
    })

    it('应该插入冲突键到同一桶', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.insert(12, 'Alice') })
      act(() => { result.current.insert(19, 'Diana') })
      expect(result.current.hashFn(12)).toBe(result.current.hashFn(19))
    })
  })

  describe('remove 操作', () => {
    it('应该删除存在的键', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.remove(12) })
      expect(success).toBe(true)
      expect(result.current.entryCount).toBe(3)
      expect(result.current.data.find((e: { key: number }) => e.key === 12)).toBeUndefined()
    })

    it('应该返回 false 对于不存在的键', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.remove(999) })
      expect(success).toBe(false)
      expect(result.current.entryCount).toBe(4)
    })

    it('应该拒绝无效键（非数字）', () => {
      const { result } = renderHook(() => useHashState())
      let success = false as boolean
      act(() => { success = result.current.remove('abc') })
      expect(success).toBe(false)
    })

    it('应该支持连续删除多个键', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.remove(12) })
      act(() => { result.current.remove(25) })
      expect(result.current.entryCount).toBe(2)
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的键', () => {
      const { result } = renderHook(() => useHashState())
      let entry: { key: number; value: string } | null = null as any
      act(() => { entry = result.current.search(12) })
      expect(entry).toEqual({ key: 12, value: 'Alice' })
    })

    it('应该返回 null 对于不存在的键', () => {
      const { result } = renderHook(() => useHashState())
      let entry: { key: number; value: string } | null = null as any
      act(() => { entry = result.current.search(999) })
      expect(entry).toBe(null)
    })

    it('应该返回 null 对于无效键', () => {
      const { result } = renderHook(() => useHashState())
      let entry: { key: number; value: string } | null = null as any
      act(() => { entry = result.current.search('abc') })
      expect(entry).toBe(null)
    })

    it('应该找到所有初始键', () => {
      const { result } = renderHook(() => useHashState())
      let entry1: { key: number; value: string } | null
      let entry2: { key: number; value: string } | null
      let entry3: { key: number; value: string } | null
      let entry4: { key: number; value: string } | null
      act(() => { entry1 = result.current.search(12) })
      act(() => { entry2 = result.current.search(25) })
      act(() => { entry3 = result.current.search(42) })
      act(() => { entry4 = result.current.search(19) })
      expect(entry1!.value).toBe('Alice')
      expect(entry2!.value).toBe('Bob')
      expect(entry3!.value).toBe('Charlie')
      expect(entry4!.value).toBe('Diana')
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始条目', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.insert(7, 'Test') })
      expect(result.current.entryCount).toBe(5)
      act(() => { result.current.reset() })
      expect(result.current.data).toEqual([
        { key: 12, value: 'Alice' },
        { key: 25, value: 'Bob' },
        { key: 42, value: 'Charlie' },
        { key: 19, value: 'Diana' },
      ])
      expect(result.current.entryCount).toBe(4)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.insert(7, 'Test') })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('loadData 操作', () => {
    it('应该加载新数据', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.loadData([{ key: 1, value: 'One' }]) })
      expect(result.current.data).toEqual([{ key: 1, value: 'One' }])
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.insert(7, 'Test') })
      act(() => { result.current.loadData([]) })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销插入操作', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.insert(7, 'Test') })
      expect(result.current.entryCount).toBe(5)
      act(() => { result.current.undo() })
      expect(result.current.entryCount).toBe(4)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.insert(7, 'Test') })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.entryCount).toBe(5)
      expect(result.current.data).toContainEqual({ key: 7, value: 'Test' })
    })

    it('应该支持撤销删除操作', () => {
      const { result } = renderHook(() => useHashState())
      act(() => { result.current.remove(12) })
      expect(result.current.entryCount).toBe(3)
      act(() => { result.current.undo() })
      expect(result.current.entryCount).toBe(4)
      expect(result.current.data).toContainEqual({ key: 12, value: 'Alice' })
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useHashState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.insert(7, 'Test') })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })
  })
})
