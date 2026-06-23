import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAvlTreeState } from '../hooks/useAvlTreeState'
import { countNodes, inorderAvl } from '../algorithms/avlTree'
import { showToast } from '../components/toastStore'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useAvlTreeState', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('初始化', () => {
    it('初始应该有 7 个节点', () => {
      const { result } = renderHook(() => useAvlTreeState())
      expect(result.current.nodeCount).toBe(7)
    })

    it('初始中序遍历应为 [20, 30, 40, 50, 60, 70, 80]', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const order = inorderAvl(result.current.data)
      expect(order).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('isAnimating 初始应为 false', () => {
      const { result } = renderHook(() => useAvlTreeState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('logs 初始应为空', () => {
      const { result } = renderHook(() => useAvlTreeState())
      expect(result.current.logs).toEqual([])
    })

    it('canUndo 初始应为 false', () => {
      const { result } = renderHook(() => useAvlTreeState())
      expect(result.current.canUndo()).toBe(false)
    })

    it('canRedo 初始应为 false', () => {
      const { result } = renderHook(() => useAvlTreeState())
      expect(result.current.canRedo()).toBe(false)
    })
  })

  describe('insert 操作', () => {
    it('应该插入新值到 AVL 树', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(25) })
      expect(result.current.nodeCount).toBe(8)
    })

    it('插入重复值应触发 warning toast', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(50) })  // 50 已在初始树
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      )
    })

    it('插入重复值不应增加节点数', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const before = result.current.nodeCount
      act(() => { result.current.insert(50) })
      expect(result.current.nodeCount).toBe(before)
    })

    it('插入成功应触发 success toast', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(25) })
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      )
    })

    it('插入无效值应触发 error toast', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert('not-a-number') })
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })

    it('插入无效值不应修改数据', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const before = result.current.nodeCount
      act(() => { result.current.insert('not-a-number') })
      expect(result.current.nodeCount).toBe(before)
    })

    it('插入字符串数字应正确解析', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert('25') })
      expect(result.current.nodeCount).toBe(8)
      expect(inorderAvl(result.current.data)).toContain(25)
    })

    it('连续插入 3 个值应保持中序有序', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(15) })
      act(() => { result.current.insert(75) })
      act(() => { result.current.insert(45) })
      const order = inorderAvl(result.current.data)
      for (let i = 1; i < order.length; i++) {
        expect(order[i]).toBeGreaterThan(order[i - 1])
      }
    })

    it('插入后日志应包含 oper 和 code 类型', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(25) })
      const types = result.current.logs.map(l => l.type)
      expect(types).toContain('oper')
      expect(types).toContain('code')
    })
  })

  describe('deleteNode 操作', () => {
    it('应该删除存在的节点', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.deleteNode(50) })
      expect(result.current.nodeCount).toBe(6)
      expect(inorderAvl(result.current.data)).not.toContain(50)
    })

    it('删除不存在的节点应返回 null', () => {
      const { result } = renderHook(() => useAvlTreeState())
      let ret: number | null = 0
      act(() => {
        ret = result.current.deleteNode(999)
      })
      expect(ret).toBeNull()
    })

    it('删除不存在的节点应触发 warning toast', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.deleteNode(999) })
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      )
    })

    it('删除成功应触发 success toast', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.deleteNode(50) })
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      )
    })

    it('删除叶子节点后应保持中序有序', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.deleteNode(20) })
      const order = inorderAvl(result.current.data)
      expect(order).toEqual([30, 40, 50, 60, 70, 80])
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的节点', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const search = result.current.search(50)
      expect(search.found).toBe(true)
      expect(search.path.length).toBeGreaterThan(0)
    })

    it('应该返回 not found 状态', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const search = result.current.search(999)
      expect(search.found).toBe(false)
    })

    it('找到节点后应记录 oper log', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.search(50) })
      const types = result.current.logs.map(l => l.type)
      expect(types).toContain('oper')
    })

    it('未找到节点后应记录 not found log', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.search(999) })
      const types = result.current.logs.map(l => l.type)
      expect(types).toContain('oper')
    })
  })

  describe('遍历操作', () => {
    it('preorder 应该返回正确的遍历序列', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const order = result.current.preorder()
      // AVL 树 [50,30,70,20,40,60,80] 初始插入后已平衡，preorder 应包含 7 个元素
      expect(order.length).toBe(7)
      expect(order.every(v => [20, 30, 40, 50, 60, 70, 80].includes(v))).toBe(true)
    })

    it('inorder 应该返回排序后序列', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const order = result.current.inorder()
      expect(order).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('postorder 应该返回 7 个元素', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const order = result.current.postorder()
      expect(order.length).toBe(7)
    })

    it('levelorder 应该返回 7 个元素', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const order = result.current.levelorder()
      expect(order.length).toBe(7)
    })

    it('遍历后应记录 oper + code log', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.preorder() })
      const types = result.current.logs.map(l => l.type)
      expect(types).toContain('oper')
      expect(types).toContain('code')
    })
  })

  describe('getFlattened 操作', () => {
    it('应该返回扁平化数组', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const flat = result.current.getFlattened()
      expect(flat.nodes.length).toBe(7)
    })

    it('扁平化数组应包含原始 7 个值', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const flat = result.current.getFlattened()
      const values = flat.nodes.map(n => n.value)
      expect(values.sort((a, b) => a - b)).toEqual([20, 30, 40, 50, 60, 70, 80])
    })
  })

  describe('undo/redo', () => {
    it('插入后 canUndo 应为 true', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(25) })
      expect(result.current.canUndo()).toBe(true)
    })

    it('undo 后节点数应恢复', () => {
      const { result } = renderHook(() => useAvlTreeState())
      const before = result.current.nodeCount
      act(() => { result.current.insert(25) })
      expect(result.current.nodeCount).toBe(before + 1)
      act(() => { result.current.undo() })
      expect(result.current.nodeCount).toBe(before)
    })

    it('undo 后 canRedo 应为 true', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(25) })
      act(() => { result.current.undo() })
      expect(result.current.canRedo()).toBe(true)
    })

    it('redo 后节点数应再次增加', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(25) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.nodeCount).toBe(8)
    })
  })

  describe('isAnimating 状态', () => {
    it('setIsAnimating 应该更新状态', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.setIsAnimating(true) })
      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('与算法函数协同', () => {
    it('插入后 countNodes 应该正确反映节点数', () => {
      const { result } = renderHook(() => useAvlTreeState())
      act(() => { result.current.insert(10) })
      act(() => { result.current.insert(20) })
      expect(countNodes(result.current.data)).toBe(result.current.nodeCount)
    })
  })
})
