import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSkipListState } from '../hooks/useSkipListState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useSkipListState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该有初始数据结构（含 head 节点）', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.data).toBeDefined()
      expect(result.current.data.nodes).toBeDefined()
      expect(result.current.data.nodes.length).toBeGreaterThan(0)
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('初始应该包含 5 个预设值', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.size()).toBe(5)
    })

    it('初始值应为 [10, 20, 30, 40, 50]', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.values()).toEqual([10, 20, 30, 40, 50])
    })
  })

  describe('insert 操作', () => {
    it('应该插入新值到跳表', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      expect(result.current.size()).toBe(6)
      expect(result.current.values()).toContain(42)
    })

    it('应该拒绝超出范围的值（< 1）', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(0) })
      expect(result.current.size()).toBe(5)
    })

    it('应该拒绝超出范围的值（> 99）', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(100) })
      expect(result.current.size()).toBe(5)
    })

    it('应该拒绝重复值', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(10) })
      expect(result.current.size()).toBe(5)
    })

    it('应该拒绝非数字输入', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(NaN) })
      expect(result.current.size()).toBe(5)
    })

    it('应该拒绝 Infinity 输入', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(Infinity) })
      expect(result.current.size()).toBe(5)
    })

    it('插入成功应添加日志', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('插入日志应携带 codeStepId 为 "insert"', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      const operLog = result.current.logs.find(l => l.type === 'oper')
      expect(operLog).toBeDefined()
      expect(operLog?.codeStepId).toBe('insert')
    })
  })

  describe('remove 操作', () => {
    it('应该删除存在的值', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.remove(30) })
      expect(result.current.size()).toBe(4)
      expect(result.current.values()).not.toContain(30)
    })

    it('删除不存在的值应保持原样', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.remove(999) })
      expect(result.current.size()).toBe(5)
    })

    it('删除成功应添加日志', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.remove(30) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('删除日志应携带 codeStepId 为 "delete"', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.remove(30) })
      const operLog = result.current.logs.find(l => l.type === 'oper')
      expect(operLog).toBeDefined()
      expect(operLog?.codeStepId).toBe('delete')
    })

    it('删除不存在的值也应添加日志', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.remove(999) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的值', () => {
      const { result } = renderHook(() => useSkipListState())
      let searchResult: { found: boolean; path: Array<{ nodeId: string; level: number }> } = null as any
      act(() => { searchResult = result.current.search(30) })
      expect(searchResult.found).toBe(true)
    })

    it('应该返回未找到对于不存在的值', () => {
      const { result } = renderHook(() => useSkipListState())
      let searchResult: { found: boolean; path: Array<{ nodeId: string; level: number }> } = null as any
      act(() => { searchResult = result.current.search(999) })
      expect(searchResult.found).toBe(false)
    })

    it('搜索成功应添加日志', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.search(30) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('搜索日志应携带 codeStepId 为 "search"', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.search(30) })
      const operLog = result.current.logs.find(l => l.type === 'oper')
      expect(operLog).toBeDefined()
      expect(operLog?.codeStepId).toBe('search')
    })

    it('应该拒绝非数字搜索', () => {
      const { result } = renderHook(() => useSkipListState())
      let searchResult: { found: boolean; path: Array<{ nodeId: string; level: number }> } = null as any
      act(() => { searchResult = result.current.search(NaN) })
      expect(searchResult.found).toBe(false)
      expect(searchResult.path).toEqual([])
    })
  })

  describe('size 与 values 操作', () => {
    it('size 应返回当前节点数（不含 head）', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.size()).toBe(5)
      act(() => { result.current.insert(42) })
      expect(result.current.size()).toBe(6)
      act(() => { result.current.remove(10) })
      expect(result.current.size()).toBe(5)
    })

    it('values 应返回升序数组', () => {
      const { result } = renderHook(() => useSkipListState())
      const vals = result.current.values()
      for (let i = 1; i < vals.length; i++) {
        expect(vals[i]).toBeGreaterThan(vals[i - 1])
      }
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始状态', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      expect(result.current.size()).toBe(6)
      act(() => { result.current.reset() })
      expect(result.current.size()).toBe(5)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销插入操作', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      expect(result.current.size()).toBe(6)
      act(() => { result.current.undo() })
      expect(result.current.size()).toBe(5)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.size()).toBe(6)
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useSkipListState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.insert(42) })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })

    it('应该支持撤销删除操作', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.remove(30) })
      expect(result.current.size()).toBe(4)
      act(() => { result.current.undo() })
      expect(result.current.size()).toBe(5)
      expect(result.current.values()).toContain(30)
    })
  })

  describe('loadData 操作', () => {
    it('应该加载新跳表数据', () => {
      const { result } = renderHook(() => useSkipListState())
      const newData = result.current.data
      act(() => { result.current.insert(42) })
      act(() => { result.current.loadData(newData) })
      expect(result.current.data).toEqual(newData)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useSkipListState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.loadData(result.current.data) })
      expect(result.current.logs).toEqual([])
    })
  })
})
