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

  it('应该支持 isAnimating 期间 undo 触发 abortAnimation', () => {
    const abortFn = vi.fn()
    const { result } = renderHook(() =>
      useDataStructureState<number[]>([1, 2, 3], { abortAnimation: abortFn })
    )

    act(() => {
      result.current.push([4, 5, 6])
    })
    act(() => {
      result.current.setIsAnimating(true)
    })

    act(() => {
      result.current.undo()
    })

    expect(abortFn).toHaveBeenCalled()
  })

  it('应该支持 isAnimating 期间 redo 触发 abortAnimation', () => {
    const abortFn = vi.fn()
    const { result } = renderHook(() =>
      useDataStructureState<number[]>([1, 2, 3], { abortAnimation: abortFn })
    )

    act(() => {
      result.current.push([4, 5, 6])
    })
    act(() => {
      result.current.undo()
    })
    act(() => {
      result.current.setIsAnimating(true)
    })

    act(() => {
      result.current.redo()
    })

    expect(abortFn).toHaveBeenCalled()
  })

  it('在 isAnimating=false 时 undo 不应调用 abortAnimation', () => {
    const abortFn = vi.fn()
    const { result } = renderHook(() =>
      useDataStructureState<number[]>([1, 2, 3], { abortAnimation: abortFn })
    )

    act(() => {
      result.current.push([4, 5, 6])
    })
    act(() => {
      result.current.undo()
    })

    expect(abortFn).not.toHaveBeenCalled()
  })

  it('应该支持 loadData', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))

    act(() => {
      result.current.loadData([10, 20, 30])
    })

    expect(result.current.data).toEqual([10, 20, 30])
  })

  it('应该支持 clearPersist（有 storageKey）', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useDataStructureState<number[]>([1, 2, 3], { storageKey: 'persist-test' })
    )

    act(() => {
      result.current.push([4, 5, 6])
    })

    // 等待防抖写入
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(localStorage.getItem('ds-visualizer-data-persist-test')).not.toBeNull()

    act(() => {
      result.current.clearPersist()
    })

    expect(localStorage.getItem('ds-visualizer-data-persist-test')).toBeNull()
    vi.useRealTimers()
  })

  it('clearPersist 无 storageKey 时应为 no-op', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))

    // 不传 storageKey，clearPersist 应不抛错
    expect(() => {
      act(() => {
        result.current.clearPersist()
      })
    }).not.toThrow()
  })

  it('应该返回 setUndoBlock 函数', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    expect(typeof result.current.setUndoBlock).toBe('function')
  })

  it('应该返回 getHistory / getCurrentIndex / getUndoPreview / getRedoPreview 函数', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
    expect(typeof result.current.getHistory).toBe('function')
    expect(typeof result.current.getCurrentIndex).toBe('function')
    expect(typeof result.current.getUndoPreview).toBe('function')
    expect(typeof result.current.getRedoPreview).toBe('function')
  })

  it('setIsAnimating(true) 后可再次 setIsAnimating(false)', () => {
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))

    act(() => {
      result.current.setIsAnimating(true)
    })
    expect(result.current.isAnimating).toBe(true)

    act(() => {
      result.current.setIsAnimating(false)
    })
    expect(result.current.isAnimating).toBe(false)
  })

  it('连续 setIsAnimating(true) 应重置 timeout', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDataStructureState<number[]>([1, 2, 3]))

    act(() => {
      result.current.setIsAnimating(true)
    })
    act(() => {
      result.current.setIsAnimating(true)  // 第二次 true 应清除前一个 timeout
    })

    // 推进 16s，原 timeout 应已被第二次重置
    act(() => {
      vi.advanceTimersByTime(16000)
    })

    // 第二次的 timeout 已触发，isAnimating 应为 false
    expect(result.current.isAnimating).toBe(false)
    vi.useRealTimers()
  })
})