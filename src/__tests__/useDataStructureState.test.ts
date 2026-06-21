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

  it('beforeunload 时应保存最新数据', () => {
    const { result } = renderHook(() =>
      useDataStructureState<number[]>([1, 2, 3], { storageKey: 'beforeunload-test' })
    )

    act(() => {
      result.current.push([4, 5, 6])
    })

    act(() => {
      window.dispatchEvent(new Event('beforeunload'))
    })

    const saved = localStorage.getItem('ds-visualizer-data-beforeunload-test')
    expect(saved).not.toBeNull()
    expect(JSON.parse(saved!)).toEqual([4, 5, 6])
  })

  it('应清空无效 localStorage 数据并回退到 initialData', () => {
    localStorage.setItem('ds-visualizer-data-invalid-test', JSON.stringify({}))
    const { result } = renderHook(() =>
      useDataStructureState<number[]>([1, 2], { storageKey: 'invalid-test' })
    )
    expect(result.current.data).toEqual([1, 2])
    expect(localStorage.getItem('ds-visualizer-data-invalid-test')).toBeNull()
  })

  it('应拒绝过深深度的 localStorage 数据', () => {
    let deep: Record<string, unknown> = { value: 1 }
    for (let i = 0; i < 20; i++) {
      deep = { nested: deep }
    }
    localStorage.setItem('ds-visualizer-data-deep-test', JSON.stringify(deep))
    const { result } = renderHook(() =>
      useDataStructureState<{ value: number }>({ value: 0 }, { storageKey: 'deep-test' })
    )
    expect(result.current.data).toEqual({ value: 0 })
    expect(localStorage.getItem('ds-visualizer-data-deep-test')).toBeNull()
  })

  it('应接受有效的复杂 localStorage 数据', () => {
    localStorage.setItem(
      'ds-visualizer-data-valid-test',
      JSON.stringify({ nodes: [{ id: 1, label: 'a' }] })
    )
    const { result } = renderHook(() =>
      useDataStructureState<{ nodes: Array<{ id: number; label: string }> }>(
        { nodes: [] },
        { storageKey: 'valid-test' }
      )
    )
    expect(result.current.data).toEqual({ nodes: [{ id: 1, label: 'a' }] })
  })
})