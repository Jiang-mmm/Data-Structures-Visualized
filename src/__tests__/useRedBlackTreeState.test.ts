import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRedBlackTreeState } from '../hooks/useRedBlackTreeState'
import { inorderRedBlack, countNodes, validateRedBlack } from '../algorithms/redBlackTree'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useRedBlackTreeState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该有初始数据（非 null）', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      expect(result.current.data).not.toBeNull()
    })

    it('初始应该包含 7 个预设值', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      expect(result.current.nodeCount).toBe(7)
    })

    it('初始中序遍历应为 [20, 30, 40, 50, 60, 70, 80]', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const order = inorderRedBlack(result.current.data)
      expect(order).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('初始根节点应为黑色', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      expect(result.current.data?.color).toBe('black')
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('初始应满足红黑树所有性质', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const validation = validateRedBlack(result.current.data)
      expect(validation.rootIsBlack).toBe(true)
      expect(validation.noConsecutiveRed).toBe(true)
      expect(validation.blackHeightConsistent).toBe(true)
      expect(validation.isBst).toBe(true)
    })
  })

  describe('insert 操作', () => {
    it('应该插入新值到红黑树', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.nodeCount).toBe(8)
      const order = inorderRedBlack(result.current.data)
      expect(order).toContain(42)
    })

    it('插入后应保持中序有序', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.insert(15) })
      act(() => { result.current.insert(75) })
      const order = inorderRedBlack(result.current.data)
      for (let i = 1; i < order.length; i++) {
        expect(order[i]).toBeGreaterThan(order[i - 1])
      }
    })

    it('插入后应保持红黑性质', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.insert(15) })
      act(() => { result.current.insert(75) })
      const validation = validateRedBlack(result.current.data)
      expect(validation.rootIsBlack).toBe(true)
      expect(validation.noConsecutiveRed).toBe(true)
      expect(validation.blackHeightConsistent).toBe(true)
    })

    it('应该拒绝超出范围的值（< 1）', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(0) })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该拒绝超出范围的值（> 99）', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(100) })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该接受边界值 1 和 99', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(1) })
      expect(result.current.nodeCount).toBe(8)
      act(() => { result.current.insert(99) })
      expect(result.current.nodeCount).toBe(9)
    })

    it('应该拒绝重复值', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(50) })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该拒绝非数字输入', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(NaN) })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该拒绝 Infinity 输入', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(Infinity) })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该接受字符串数字输入', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert('42') })
      expect(result.current.nodeCount).toBe(8)
    })

    it('插入成功应添加日志', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('插入日志应携带 codeStepId 为 "insert"', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      const operLog = result.current.logs.find(l => l.type === 'oper')
      expect(operLog).toBeDefined()
      expect(operLog?.codeStepId).toBe('insert')
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的值', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      let searchResult: { found: boolean; path: number[] } = null as any
      act(() => { searchResult = result.current.search(30) })
      expect(searchResult.found).toBe(true)
      expect(searchResult.path.length).toBeGreaterThan(0)
    })

    it('应该返回未找到对于不存在的值', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      let searchResult: { found: boolean; path: number[] } = null as any
      act(() => { searchResult = result.current.search(999) })
      expect(searchResult.found).toBe(false)
    })

    it('搜索成功应添加日志', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.search(30) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('搜索日志应携带 codeStepId 为 "search"', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.search(30) })
      const operLog = result.current.logs.find(l => l.type === 'oper')
      expect(operLog).toBeDefined()
      expect(operLog?.codeStepId).toBe('search')
    })

    it('搜索路径应从根节点开始', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      let searchResult: { found: boolean; path: number[] } = null as any
      act(() => { searchResult = result.current.search(30) })
      expect(searchResult.path[0]).toBe(50)
    })
  })

  describe('inorder 操作', () => {
    it('应返回升序数组', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      let order: number[] = []
      act(() => { order = result.current.inorder() })
      expect(order).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('inorder 应添加日志', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.inorder() })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('inorder 日志应携带 codeStepId 为 "inorder"', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.inorder() })
      const operLog = result.current.logs.find(l => l.type === 'oper')
      expect(operLog).toBeDefined()
      expect(operLog?.codeStepId).toBe('inorder')
    })
  })

  describe('getFlattened 操作', () => {
    it('应返回扁平化数据包含 nodes 和 edges', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const flattened = result.current.getFlattened()
      expect(flattened.nodes).toBeDefined()
      expect(flattened.edges).toBeDefined()
    })

    it('应返回正确数量的节点', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const flattened = result.current.getFlattened()
      expect(flattened.nodes.length).toBe(7)
    })

    it('应返回正确数量的边（节点数 - 1）', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const flattened = result.current.getFlattened()
      expect(flattened.edges.length).toBe(6)
    })

    it('每个节点应包含 color 字段', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const flattened = result.current.getFlattened()
      for (const node of flattened.nodes) {
        expect(node.color === 'red' || node.color === 'black').toBe(true)
      }
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始状态', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.nodeCount).toBe(8)
      act(() => { result.current.reset() })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销插入操作', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.nodeCount).toBe(8)
      act(() => { result.current.undo() })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.nodeCount).toBe(8)
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
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

  describe('loadData 操作', () => {
    it('应该加载新数据', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const originalData = result.current.data
      act(() => { result.current.insert(42) })
      act(() => { result.current.loadData(originalData) })
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      act(() => { result.current.insert(42) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.loadData(result.current.data) })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('nodeCount', () => {
    it('应与 countNodes 一致', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      expect(result.current.nodeCount).toBe(countNodes(result.current.data))
    })

    it('插入后应更新', () => {
      const { result } = renderHook(() => useRedBlackTreeState())
      const before = result.current.nodeCount
      act(() => { result.current.insert(42) })
      expect(result.current.nodeCount).toBe(before + 1)
    })
  })
})
