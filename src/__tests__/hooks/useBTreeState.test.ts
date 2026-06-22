import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBTreeState } from '../../hooks/useBTreeState'
import { inorderBTree, countBTreeNodes, countBTreeKeys, validateBTree } from '../../algorithms/bTree'

vi.mock('../../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useBTreeState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该有初始数据（非 null）', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.data).not.toBeNull()
    })

    it('初始应该包含 8 个预设值', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.keyCount).toBe(8)
    })

    it('初始中序遍历应为 [5, 6, 7, 10, 12, 17, 20, 30]', () => {
      const { result } = renderHook(() => useBTreeState())
      const order = inorderBTree(result.current.data)
      expect(order).toEqual([5, 6, 7, 10, 12, 17, 20, 30])
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('初始应满足 B 树所有性质', () => {
      const { result } = renderHook(() => useBTreeState())
      const validation = validateBTree(result.current.data)
      expect(validation.valid).toBe(true)
      expect(validation.allLeavesSameDepth).toBe(true)
      expect(validation.keyCountValid).toBe(true)
      expect(validation.keysSorted).toBe(true)
      expect(validation.childrenCorrect).toBe(true)
    })
  })

  describe('insert 操作', () => {
    it('应该插入新值到 B 树', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.keyCount).toBe(9)
      const order = inorderBTree(result.current.data)
      expect(order).toContain(42)
    })

    it('插入后应保持中序有序', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.insert(15) })
      act(() => { result.current.insert(75) })
      const order = inorderBTree(result.current.data)
      for (let i = 1; i < order.length; i++) {
        expect(order[i]).toBeGreaterThan(order[i - 1])
      }
    })

    it('插入后应保持 B 树性质', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.insert(15) })
      act(() => { result.current.insert(75) })
      const validation = validateBTree(result.current.data)
      expect(validation.valid).toBe(true)
    })

    it('应该拒绝超出范围的值（< 1）', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(0) })
      expect(result.current.keyCount).toBe(8)
    })

    it('应该拒绝超出范围的值（> 99）', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(100) })
      expect(result.current.keyCount).toBe(8)
    })

    it('应该拒绝重复值', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(10) })
      expect(result.current.keyCount).toBe(8)
    })

    it('应该接受字符串数字输入', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert('42') })
      expect(result.current.keyCount).toBe(9)
    })

    it('插入成功应添加日志', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的值', () => {
      const { result } = renderHook(() => useBTreeState())
      let searchResult: { found: boolean; path: number[][] } = { found: false, path: [] }
      act(() => { searchResult = result.current.search(10) })
      expect(searchResult.found).toBe(true)
      expect(searchResult.path.length).toBeGreaterThan(0)
    })

    it('应该返回未找到对于不存在的值', () => {
      const { result } = renderHook(() => useBTreeState())
      let searchResult: { found: boolean; path: number[][] } = { found: false, path: [] }
      act(() => { searchResult = result.current.search(999) })
      expect(searchResult.found).toBe(false)
    })

    it('搜索应添加日志', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.search(10) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })
  })

  describe('inorder 操作', () => {
    it('应返回升序数组', () => {
      const { result } = renderHook(() => useBTreeState())
      let order: number[] = []
      act(() => { order = result.current.inorder() })
      expect(order).toEqual([5, 6, 7, 10, 12, 17, 20, 30])
    })

    it('inorder 应添加日志', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.inorder() })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })
  })

  describe('getFlattened 操作', () => {
    it('应返回扁平化数据包含 nodes 和 edges', () => {
      const { result } = renderHook(() => useBTreeState())
      const flattened = result.current.getFlattened()
      expect(flattened.nodes).toBeDefined()
      expect(flattened.edges).toBeDefined()
    })

    it('应返回正确数量的节点', () => {
      const { result } = renderHook(() => useBTreeState())
      const flattened = result.current.getFlattened()
      expect(flattened.nodes.length).toBe(countBTreeNodes(result.current.data))
    })

    it('应返回正确数量的边', () => {
      const { result } = renderHook(() => useBTreeState())
      const flattened = result.current.getFlattened()
      // 边数 = 节点数 - 1（树形结构）
      expect(flattened.edges.length).toBe(flattened.nodes.length - 1)
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始状态', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.keyCount).toBe(9)
      act(() => { result.current.reset() })
      expect(result.current.keyCount).toBe(8)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销插入操作', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.keyCount).toBe(9)
      act(() => { result.current.undo() })
      expect(result.current.keyCount).toBe(8)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useBTreeState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.keyCount).toBe(9)
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.insert(42) })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })
  })

  describe('nodeCount / keyCount', () => {
    it('keyCount 应与 countBTreeKeys 一致', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.keyCount).toBe(countBTreeKeys(result.current.data))
    })

    it('nodeCount 应与 countBTreeNodes 一致', () => {
      const { result } = renderHook(() => useBTreeState())
      expect(result.current.nodeCount).toBe(countBTreeNodes(result.current.data))
    })

    it('插入后 keyCount 应更新', () => {
      const { result } = renderHook(() => useBTreeState())
      const before = result.current.keyCount
      act(() => { result.current.insert(42) })
      expect(result.current.keyCount).toBe(before + 1)
    })
  })
})
