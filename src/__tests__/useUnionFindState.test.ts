import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUnionFindState } from '../hooks/useUnionFindState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useUnionFindState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该有初始数据结构', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.data).toBeDefined()
      expect(result.current.data.nodes).toBeDefined()
      expect(result.current.data.nodes.length).toBeGreaterThan(0)
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('初始应该包含 8 个预设值', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.size()).toBe(8)
    })

    it('初始值应为 [1, 2, 3, 4, 5, 6, 7, 8]', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.values()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('初始应有 3 个连通分量', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.components()).toBe(3)
    })
  })

  describe('insert 操作', () => {
    it('应该插入新值到并查集', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(42) })
      expect(result.current.size()).toBe(9)
      expect(result.current.values()).toContain(42)
    })

    it('应该拒绝超出范围的值（< 1）', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(0) })
      expect(result.current.size()).toBe(8)
    })

    it('应该拒绝超出范围的值（> 99）', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(100) })
      expect(result.current.size()).toBe(8)
    })

    it('应该拒绝重复值', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(1) })
      expect(result.current.size()).toBe(8)
    })

    it('应该拒绝非数字输入', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(NaN) })
      expect(result.current.size()).toBe(8)
    })

    it('应该拒绝 Infinity 输入', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(Infinity) })
      expect(result.current.size()).toBe(8)
    })

    it('插入后应添加日志', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('插入的节点应作为独立集合', () => {
      const { result } = renderHook(() => useUnionFindState())
      const before = result.current.components()
      act(() => { result.current.insert(42) })
      expect(result.current.components()).toBe(before + 1)
    })
  })

  describe('remove 操作', () => {
    it('应该删除已存在的值', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.remove(1) })
      expect(result.current.size()).toBe(7)
      expect(result.current.values()).not.toContain(1)
    })

    it('删除不存在的值应保持不变', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.remove(99) })
      expect(result.current.size()).toBe(8)
    })

    it('删除后应添加日志', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.remove(1) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('删除节点后应保持其他节点连通性', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.remove(2) })
      // 1 和 3 应仍连通
      let connected = false
      act(() => { connected = result.current.checkConnected(1, 3) })
      expect(connected).toBe(true)
    })
  })

  describe('find 操作', () => {
    it('应返回已存在节点的查找结果', () => {
      const { result } = renderHook(() => useUnionFindState())
      let res = { rootId: '', path: [] as string[] }
      act(() => { res = result.current.find(1) })
      expect(res.rootId).toBeDefined()
      expect(res.rootId).not.toBe('')
    })

    it('查找不存在的节点应返回空结果', () => {
      const { result } = renderHook(() => useUnionFindState())
      let res = { rootId: 'x', path: ['x'] as string[] }
      act(() => { res = result.current.find(99) })
      expect(res.rootId).toBe('')
      expect(res.path).toEqual([])
    })

    it('查找后应添加日志', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.find(1) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('查找应返回路径数组', () => {
      const { result } = renderHook(() => useUnionFindState())
      let res = { rootId: '', path: [] as string[] }
      act(() => { res = result.current.find(3) })
      expect(Array.isArray(res.path)).toBe(true)
    })
  })

  describe('union 操作', () => {
    it('应合并两个不同集合', () => {
      const { result } = renderHook(() => useUnionFindState())
      const before = result.current.components()
      act(() => { result.current.union(1, 4) })
      expect(result.current.components()).toBe(before - 1)
    })

    it('已连通的节点合并应保持不变', () => {
      const { result } = renderHook(() => useUnionFindState())
      const before = result.current.components()
      act(() => { result.current.union(1, 2) })
      expect(result.current.components()).toBe(before)
    })

    it('合并后应添加日志', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.union(1, 4) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('合并不存在的节点应保持不变', () => {
      const { result } = renderHook(() => useUnionFindState())
      const before = result.current.components()
      act(() => { result.current.union(1, 99) })
      expect(result.current.components()).toBe(before)
    })

    it('合并后两节点应连通', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.union(1, 4) })
      let connected = false
      act(() => { connected = result.current.checkConnected(1, 4) })
      expect(connected).toBe(true)
    })
  })

  describe('checkConnected 操作', () => {
    it('同集合节点应返回 true', () => {
      const { result } = renderHook(() => useUnionFindState())
      let connected = false
      act(() => { connected = result.current.checkConnected(1, 2) })
      expect(connected).toBe(true)
    })

    it('不同集合节点应返回 false', () => {
      const { result } = renderHook(() => useUnionFindState())
      let connected = true
      act(() => { connected = result.current.checkConnected(1, 4) })
      expect(connected).toBe(false)
    })

    it('不存在的节点应返回 false', () => {
      const { result } = renderHook(() => useUnionFindState())
      let connected = true
      act(() => { connected = result.current.checkConnected(1, 99) })
      expect(connected).toBe(false)
    })

    it('连通性查询后应添加日志', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.checkConnected(1, 4) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })
  })

  describe('size 和 values 操作', () => {
    it('size 应返回节点数', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.size()).toBe(8)
    })

    it('values 应返回升序值数组', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.values()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })
  })

  describe('components 操作', () => {
    it('应返回连通分量数', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.components()).toBe(3)
    })

    it('合并后连通分量应减少', () => {
      const { result } = renderHook(() => useUnionFindState())
      const before = result.current.components()
      act(() => { result.current.union(1, 4) })
      expect(result.current.components()).toBe(before - 1)
    })
  })

  describe('undo/redo 操作', () => {
    it('初始 canUndo 应为 false', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.canUndo()).toBe(false)
    })

    it('初始 canRedo 应为 false', () => {
      const { result } = renderHook(() => useUnionFindState())
      expect(result.current.canRedo()).toBe(false)
    })

    it('插入后 canUndo 应为 true', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(42) })
      expect(result.current.canUndo()).toBe(true)
    })

    it('undo 应撤销插入', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.undo() })
      expect(result.current.size()).toBe(8)
      expect(result.current.values()).not.toContain(42)
    })

    it('redo 应重做撤销的操作', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.size()).toBe(9)
      expect(result.current.values()).toContain(42)
    })
  })

  describe('reset 操作', () => {
    it('reset 应恢复初始状态', () => {
      const { result } = renderHook(() => useUnionFindState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.reset() })
      expect(result.current.size()).toBe(8)
      expect(result.current.values()).not.toContain(42)
    })
  })
})
