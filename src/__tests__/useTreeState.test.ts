import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTreeState } from '../hooks/useTreeState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useTreeState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用默认初始数据', () => {
      const { result } = renderHook(() => useTreeState())
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80])
    })

    it('应该有正确的初始节点数', () => {
      const { result } = renderHook(() => useTreeState())
      expect(result.current.nodeCount).toBe(7)
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useTreeState())
      expect(result.current.logs).toEqual([])
    })
  })

  describe('insert 操作', () => {
    it('应该插入有效值', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(25) })
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80, 0, 25])
    })

    it('应该更新节点数', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(10) })
      expect(result.current.nodeCount).toBe(8)
    })

    it('应该拒绝无效输入', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert('abc') })
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80])
    })

    it('应该拒绝超出范围的值', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(0) })
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80])
      act(() => { result.current.insert(100) })
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80])
    })

    it('应该接受边界值 1 和 99', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(1) })
      expect(result.current.nodeCount).toBe(8)
      act(() => { result.current.insert(99) })
      expect(result.current.nodeCount).toBe(9)
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的节点', () => {
      const { result } = renderHook(() => useTreeState())
      let searchResult: { found: number; path: number[] }
      act(() => { searchResult = result.current.search(70) })
      expect(searchResult.found).toBe(2)
      expect(Array.isArray(searchResult.path)).toBe(true)
    })

    it('应该返回 -1 对于不存在的节点', () => {
      const { result } = renderHook(() => useTreeState())
      let searchResult: { found: number; path: number[] }
      act(() => { searchResult = result.current.search(999) })
      expect(searchResult.found).toBe(-1)
    })

    it('应该记录搜索路径', () => {
      const { result } = renderHook(() => useTreeState())
      let searchResult: { found: number; path: number[] }
      act(() => { searchResult = result.current.search(20) })
      expect(searchResult.path.length).toBeGreaterThan(0)
    })
  })

  describe('deleteNode 操作', () => {
    it('应该删除存在的节点', () => {
      const { result } = renderHook(() => useTreeState())
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(20) })
      expect(deletedIndex).toBe(3)
      expect(result.current.nodeCount).toBe(6)
    })

    it('应该返回 null 对于不存在的节点', () => {
      const { result } = renderHook(() => useTreeState())
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(999) })
      expect(deletedIndex).toBe(null)
    })

    it('应该删除叶子节点（无子节点）', () => {
      const { result } = renderHook(() => useTreeState())
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(20) })
      expect(deletedIndex).toBe(3)
      expect(result.current.data).not.toContain(20)
      expect(result.current.nodeCount).toBe(6)
    })

    it('应该删除只有左子节点的节点', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.loadData([50, 30, 70, 20]) })
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(30) })
      expect(deletedIndex).toBe(1)
      expect(result.current.data).not.toContain(30)
      expect(result.current.data).toContain(20)
    })

    it('应该删除只有右子节点的节点', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.loadData([50, 30, 70, 0, 40]) })
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(30) })
      expect(deletedIndex).toBe(1)
      expect(result.current.data).not.toContain(30)
    })

    it('应该删除双子树节点（使用后继替换）', () => {
      const { result } = renderHook(() => useTreeState())
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(50) })
      expect(deletedIndex).toBe(0)
      expect(result.current.data).not.toContain(50)
      expect(result.current.nodeCount).toBe(6)
    })

    it('空树删除应该返回 null', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.loadData([]) })
      let deletedIndex: number | null
      act(() => { deletedIndex = result.current.deleteNode(20) })
      expect(deletedIndex).toBe(null)
    })
  })

  describe('preorder 操作', () => {
    it('应该返回前序遍历索引数组', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.preorder()
      expect(Array.isArray(indices)).toBe(true)
      expect(indices.length).toBe(7)
    })

    it('前序遍历应该先访问根节点', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.preorder()
      expect(indices[0]).toBe(0)
    })
  })

  describe('inorder 操作', () => {
    it('应该返回中序遍历索引数组', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.inorder()
      expect(Array.isArray(indices)).toBe(true)
      expect(indices.length).toBe(7)
    })

    it('中序遍历 BST 应该得到排序结果', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.inorder()
      const values = indices.map(i => result.current.data[i])
      expect(values).toEqual([20, 30, 40, 50, 60, 70, 80])
    })
  })

  describe('postorder 操作', () => {
    it('应该返回后序遍历索引数组', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.postorder()
      expect(Array.isArray(indices)).toBe(true)
      expect(indices.length).toBe(7)
    })

    it('后序遍历应该最后访问根节点', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.postorder()
      expect(indices[indices.length - 1]).toBe(0)
    })
  })

  describe('levelorder 操作', () => {
    it('应该返回层序遍历索引数组', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.levelorder()
      expect(Array.isArray(indices)).toBe(true)
      expect(indices.length).toBe(7)
    })

    it('层序遍历应该先访问根节点', () => {
      const { result } = renderHook(() => useTreeState())
      const indices = result.current.levelorder()
      expect(indices[0]).toBe(0)
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始数据', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(25) })
      expect(result.current.nodeCount).toBe(8)
      act(() => { result.current.reset() })
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80])
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(25) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('loadData 操作', () => {
    it('应该加载新数据', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.loadData([1, 2, 3]) })
      expect(result.current.data).toEqual([1, 2, 3])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销操作', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(25) })
      expect(result.current.data.length).toBe(9)
      act(() => { result.current.undo() })
      expect(result.current.data).toEqual([50, 30, 70, 20, 40, 60, 80])
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useTreeState())
      act(() => { result.current.insert(25) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.data.length).toBe(9)
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useTreeState())
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
