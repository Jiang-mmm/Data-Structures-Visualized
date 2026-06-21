import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSegmentTreeState } from '../../hooks/useSegmentTreeState'
import { buildSegmentTree, countSegmentTreeNodes, validateSegmentTree, DEFAULT_ARRAY } from '../../algorithms/segmentTree'

vi.mock('../../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useSegmentTreeState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('初始化状态', () => {
    it('初始 data 应等于 DEFAULT_ARRAY', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      expect(result.current.data).toEqual(DEFAULT_ARRAY)
    })

    it('初始应无日志', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 初始应为 false', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('初始 nodeCount 应为 15（8 元素数组 → 2n-1 节点）', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      expect(result.current.nodeCount).toBe(15)
    })

    it('初始应通过线段树性质验证', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const tree = buildSegmentTree(result.current.data)
      const validation = validateSegmentTree(tree, result.current.data)
      expect(validation.valid).toBe(true)
    })
  })

  describe('build 操作', () => {
    it('应从新数组构建线段树', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3, 4]) })
      expect(result.current.data).toEqual([1, 2, 3, 4])
      expect(result.current.nodeCount).toBe(7)
    })

    it('build 后应添加日志', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3]) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('应拒绝空数组', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const originalData = [...result.current.data]
      act(() => { result.current.build([]) })
      // 数据不应改变
      expect(result.current.data).toEqual(originalData)
    })

    it('应支持单元素数组', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([42]) })
      expect(result.current.data).toEqual([42])
      expect(result.current.nodeCount).toBe(1)
    })
  })

  describe('query 操作', () => {
    it('应正确返回区间和', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      let queryResult: { sum: number; path: { start: number; end: number; sum: number }[] } = { sum: 0, path: [] }
      act(() => { queryResult = result.current.query(0, 3) })
      const expected = DEFAULT_ARRAY.slice(0, 4).reduce((a, b) => a + b, 0)
      expect(queryResult.sum).toBe(expected)
    })

    it('query 应返回访问路径', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      let queryResult: { sum: number; path: { start: number; end: number; sum: number }[] } = { sum: 0, path: [] }
      act(() => { queryResult = result.current.query(0, 7) })
      expect(queryResult.path.length).toBeGreaterThan(0)
    })

    it('query 应添加日志', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.query(0, 3) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('query 不应修改 data', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const originalData = [...result.current.data]
      act(() => { result.current.query(0, 3) })
      expect(result.current.data).toEqual(originalData)
    })
  })

  describe('update 操作', () => {
    it('应正确更新指定下标的值', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.update(1, 100) })
      expect(result.current.data[1]).toBe(100)
    })

    it('update 后应添加日志', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.update(0, 50) })
      expect(result.current.logs.length).toBeGreaterThan(0)
    })

    it('应拒绝越界下标（负数）', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const originalData = [...result.current.data]
      act(() => { result.current.update(-1, 100) })
      expect(result.current.data).toEqual(originalData)
    })

    it('应拒绝越界下标（>= length）', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const originalData = [...result.current.data]
      act(() => { result.current.update(100, 100) })
      expect(result.current.data).toEqual(originalData)
    })

    it('update 后线段树应保持性质', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.update(2, 999) })
      const tree = buildSegmentTree(result.current.data)
      const validation = validateSegmentTree(tree, result.current.data)
      expect(validation.valid).toBe(true)
    })
  })

  describe('getFlattened 操作', () => {
    it('应返回扁平化结构包含 nodes 和 edges', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const flat = result.current.getFlattened()
      expect(flat.nodes).toBeDefined()
      expect(flat.edges).toBeDefined()
      expect(flat.originalArray).toEqual(DEFAULT_ARRAY)
    })

    it('应返回正确数量的节点', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const flat = result.current.getFlattened()
      const expected = countSegmentTreeNodes(buildSegmentTree(result.current.data))
      expect(flat.nodes.length).toBe(expected)
    })

    it('边数应等于节点数 - 1', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const flat = result.current.getFlattened()
      expect(flat.edges.length).toBe(flat.nodes.length - 1)
    })
  })

  describe('reset 操作', () => {
    it('应重置 data 为初始值', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3]) })
      expect(result.current.data).toEqual([1, 2, 3])
      act(() => { result.current.reset() })
      expect(result.current.data).toEqual(DEFAULT_ARRAY)
    })

    it('应清空日志', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3]) })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应支持撤销 build 操作', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3]) })
      expect(result.current.data).toEqual([1, 2, 3])
      act(() => { result.current.undo() })
      expect(result.current.data).toEqual(DEFAULT_ARRAY)
    })

    it('应支持重做 build 操作', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3]) })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.data).toEqual([1, 2, 3])
    })

    it('应支持撤销 update 操作', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      const original = [...result.current.data]
      act(() => { result.current.update(0, 999) })
      expect(result.current.data[0]).toBe(999)
      act(() => { result.current.undo() })
      expect(result.current.data).toEqual(original)
    })

    it('初始 canUndo 应为 false', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      expect(result.current.canUndo()).toBe(false)
    })

    it('操作后 canUndo 应为 true', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.build([1, 2, 3]) })
      expect(result.current.canUndo()).toBe(true)
    })
  })

  describe('loadData 操作', () => {
    it('应加载外部数据', () => {
      const { result } = renderHook(() => useSegmentTreeState())
      act(() => { result.current.loadData([5, 6, 7, 8, 9]) })
      expect(result.current.data).toEqual([5, 6, 7, 8, 9])
    })
  })
})
