import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useArrayState } from '../hooks/useArrayState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

describe('useArrayState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该初始化状态', () => {
    const { result } = renderHook(() => useArrayState())
    expect(result.current.data).toEqual([8, 3, 12, 5, 9])
  })

  it('应该支持插入元素', () => {
    const { result } = renderHook(() => useArrayState())
    
    act(() => {
      result.current.insert(1, 0)
    })
    expect(result.current.data[0]).toBe(1)
  })

  it('应该支持删除元素', () => {
    const { result } = renderHook(() => useArrayState())
    
    act(() => {
      result.current.remove(0)
    })
    expect(result.current.data).not.toContain(8)
  })

  it('应该支持搜索元素', () => {
    const { result } = renderHook(() => useArrayState())
    
    const index = result.current.search(12)
    expect(index).toBe(2)
  })

  it('应该支持随机生成', () => {
    const { result } = renderHook(() => useArrayState())
    
    act(() => {
      result.current.randomize()
    })
    expect(result.current.data).toHaveLength(8)
  })

  it('应该支持撤销', () => {
    const { result } = renderHook(() => useArrayState())
    
    act(() => {
      result.current.insert(1, 0)
    })
    
    act(() => {
      result.current.undo()
    })
    expect(result.current.data).toEqual([8, 3, 12, 5, 9])
  })

  describe('insert 边界条件', () => {
    it('数组满时插入应该失败', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) })
      const success = result.current.insert(99, 0)
      expect(success).toBe(false)
    })

    it('负索引插入应该失败', () => {
      const { result } = renderHook(() => useArrayState())
      const success = result.current.insert(1, -1)
      expect(success).toBe(false)
    })

    it('超范围索引插入应该失败', () => {
      const { result } = renderHook(() => useArrayState())
      const success = result.current.insert(1, 100)
      expect(success).toBe(false)
    })

    it('无效输入应该失败', () => {
      const { result } = renderHook(() => useArrayState())
      const success = result.current.insert('abc', 0)
      expect(success).toBe(false)
    })

    it('边界值 0 应该失败', () => {
      const { result } = renderHook(() => useArrayState())
      const success = result.current.insert(0, 0)
      expect(success).toBe(false)
    })

    it('边界值 100 应该失败', () => {
      const { result } = renderHook(() => useArrayState())
      const success = result.current.insert(100, 0)
      expect(success).toBe(false)
    })

    it('字符串数字应该成功', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([]) })
      let success = false as boolean
      act(() => { success = result.current.insert('50', 0) })
      expect(success).toBe(true)
      expect(result.current.data[0]).toBe(50)
    })
  })

  describe('remove 边界条件', () => {
    it('负索引删除应该返回 null', () => {
      const { result } = renderHook(() => useArrayState())
      const value = result.current.remove(-1)
      expect(value).toBeNull()
    })

    it('超范围索引删除应该返回 null', () => {
      const { result } = renderHook(() => useArrayState())
      const value = result.current.remove(100)
      expect(value).toBeNull()
    })

    it('空数组删除应该返回 null', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([]) })
      const value = result.current.remove(0)
      expect(value).toBeNull()
    })
  })

  describe('search 边界条件', () => {
    it('搜索不存在的值应该返回 -1', () => {
      const { result } = renderHook(() => useArrayState())
      const index = result.current.search(999)
      expect(index).toBe(-1)
    })

    it('空数组搜索应该返回 -1', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([]) })
      const index = result.current.search(1)
      expect(index).toBe(-1)
    })
  })

  describe('searchAll', () => {
    it('应该返回所有匹配项的索引', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([5, 3, 5, 8, 5, 1]) })
      const indices = result.current.searchAll(5)
      expect(indices).toEqual([0, 2, 4])
    })

    it('无匹配时应该返回空数组', () => {
      const { result } = renderHook(() => useArrayState())
      const indices = result.current.searchAll(999)
      expect(indices).toEqual([])
    })

    it('空数组应该返回空数组', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([]) })
      const indices = result.current.searchAll(1)
      expect(indices).toEqual([])
    })

    it('单匹配应该返回单元素数组', () => {
      const { result } = renderHook(() => useArrayState())
      const indices = result.current.searchAll(12)
      expect(indices).toEqual([2])
    })
  })

  describe('binarySearch', () => {
    it('有序数组中查找存在的值应该返回正确索引', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([1, 3, 5, 7, 9, 11, 13]) })
      const index = result.current.binarySearch(7)
      expect(index).toBe(3)
    })

    it('有序数组中查找不存在的值应该返回 -1', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([1, 3, 5, 7, 9]) })
      const index = result.current.binarySearch(6)
      expect(index).toBe(-1)
    })

    it('无序数组应该返回 -1（前置条件失败）', () => {
      const { result } = renderHook(() => useArrayState())
      // 默认数据 [8, 3, 12, 5, 9] 无序
      const index = result.current.binarySearch(8)
      expect(index).toBe(-1)
    })

    it('空数组应该返回 -1', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([]) })
      const index = result.current.binarySearch(1)
      expect(index).toBe(-1)
    })

    it('单元素有序数组查找命中应该返回 0', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([42]) })
      const index = result.current.binarySearch(42)
      expect(index).toBe(0)
    })

    it('单元素有序数组查找未命中应该返回 -1', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([42]) })
      const index = result.current.binarySearch(7)
      expect(index).toBe(-1)
    })

    it('查找首元素应该返回 0', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([2, 4, 6, 8, 10]) })
      const index = result.current.binarySearch(2)
      expect(index).toBe(0)
    })

    it('查找末元素应该返回最后一个索引', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([2, 4, 6, 8, 10]) })
      const index = result.current.binarySearch(10)
      expect(index).toBe(4)
    })

    it('允许重复值的有序数组应返回其中一个匹配索引', () => {
      const { result } = renderHook(() => useArrayState())
      act(() => { result.current.loadData([1, 3, 3, 3, 5]) })
      const index = result.current.binarySearch(3)
      expect([1, 2, 3]).toContain(index)
    })
  })
})