import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDataStructureState } from '../hooks/useDataStructureState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

describe('useDataStructureState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该初始化状态', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    expect(result.current.data).toEqual([1, 2, 3])
  })

  it('应该支持 push 操作', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    expect(result.current.data).toEqual([4, 5, 6])
  })

  it('应该支持撤销', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    act(() => {
      result.current.undo()
    })
    expect(result.current.data).toEqual([1, 2, 3])
  })

  it('应该支持重做', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    act(() => {
      result.current.undo()
    })
    
    act(() => {
      result.current.redo()
    })
    expect(result.current.data).toEqual([4, 5, 6])
  })

  it('应该支持添加日志', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.addLog('info', 'test message')
    })
    expect(result.current.logs).toHaveLength(1)
    expect(result.current.logs[0].message).toBe('test message')
  })

  it('应该支持清空日志', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.addLog('info', 'test message')
    })
    
    act(() => {
      result.current.clearLogs()
    })
    expect(result.current.logs).toHaveLength(0)
  })

  it('应该支持重置', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    act(() => {
      result.current.reset()
    })
    expect(result.current.data).toEqual([1, 2, 3])
  })
})