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
      let success: boolean
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
})