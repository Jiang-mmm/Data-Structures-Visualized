import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from '../hooks/useHistory'

describe('useHistory', () => {
  it('应该初始化状态', () => {
    const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
    expect(result.current.state).toEqual([1, 2, 3])
  })

  it('应该支持撤销', () => {
    const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    expect(result.current.state).toEqual([4, 5, 6])
    
    act(() => {
      result.current.undo()
    })
    expect(result.current.state).toEqual([1, 2, 3])
  })

  it('应该支持重做', () => {
    const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    act(() => {
      result.current.undo()
    })
    
    act(() => {
      result.current.redo()
    })
    expect(result.current.state).toEqual([4, 5, 6])
  })

  it('应该返回正确的 canUndo 和 canRedo', () => {
    const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
    
    expect(result.current.canUndo()).toBe(false)
    expect(result.current.canRedo()).toBe(false)
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    expect(result.current.canUndo()).toBe(true)
    expect(result.current.canRedo()).toBe(false)
    
    act(() => {
      result.current.undo()
    })
    
    expect(result.current.canUndo()).toBe(false)
    expect(result.current.canRedo()).toBe(true)
  })

  it('应该返回预览数据', () => {
    const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
    
    expect(result.current.getUndoPreview()).toBeNull()
    expect(result.current.getRedoPreview()).toBeNull()
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    expect(result.current.getUndoPreview()).toEqual([1, 2, 3])
    expect(result.current.getRedoPreview()).toBeNull()
    
    act(() => {
      result.current.undo()
    })
    
    expect(result.current.getUndoPreview()).toBeNull()
    expect(result.current.getRedoPreview()).toEqual([4, 5, 6])
  })

  it('应该支持重置', () => {
    const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
    
    act(() => {
      result.current.push([4, 5, 6])
    })
    
    act(() => {
      result.current.reset([7, 8, 9])
    })
    
    expect(result.current.state).toEqual([7, 8, 9])
    expect(result.current.canUndo()).toBe(false)
    expect(result.current.canRedo()).toBe(false)
  })

  describe('undoBlock 机制', () => {
    it('undoBlock 为 true 时 undo 应返回 null', () => {
      const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
      
      act(() => {
        result.current.push([4, 5, 6])
      })
      
      expect(result.current.state).toEqual([4, 5, 6])
      
      act(() => {
        result.current.setUndoBlock(true)
      })
      
      let undoResult: number[] | null = null
      act(() => {
        undoResult = result.current.undo()
      })
      
      expect(undoResult).toBeNull()
      // 状态不应改变
      expect(result.current.state).toEqual([4, 5, 6])
    })

    it('undoBlock 为 true 时 redo 应返回 null', () => {
      const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
      
      act(() => {
        result.current.push([4, 5, 6])
      })
      
      act(() => {
        result.current.undo()
      })
      
      expect(result.current.state).toEqual([1, 2, 3])
      
      act(() => {
        result.current.setUndoBlock(true)
      })
      
      let redoResult: number[] | null = null
      act(() => {
        redoResult = result.current.redo()
      })
      
      expect(redoResult).toBeNull()
      // 状态不应改变
      expect(result.current.state).toEqual([1, 2, 3])
    })

    it('undoBlock 为 true 时 canUndo 应返回 false', () => {
      const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
      
      act(() => {
        result.current.push([4, 5, 6])
      })
      
      // 未阻塞时 canUndo 应为 true
      expect(result.current.canUndo()).toBe(true)
      
      act(() => {
        result.current.setUndoBlock(true)
      })
      
      // 阻塞后 canUndo 应为 false
      expect(result.current.canUndo()).toBe(false)
    })

    it('undoBlock 为 true 时 canRedo 应返回 false', () => {
      const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
      
      act(() => {
        result.current.push([4, 5, 6])
      })
      
      act(() => {
        result.current.undo()
      })
      
      // 未阻塞时 canRedo 应为 true
      expect(result.current.canRedo()).toBe(true)
      
      act(() => {
        result.current.setUndoBlock(true)
      })
      
      // 阻塞后 canRedo 应为 false
      expect(result.current.canRedo()).toBe(false)
    })

    it('setUndoBlock(false) 应恢复撤销/重做功能', () => {
      const { result } = renderHook(() => useHistory<number[]>([1, 2, 3]))
      
      act(() => {
        result.current.push([4, 5, 6])
      })
      
      act(() => {
        result.current.setUndoBlock(true)
      })
      
      // 阻塞时无法撤销
      expect(result.current.canUndo()).toBe(false)
      
      act(() => {
        result.current.setUndoBlock(false)
      })
      
      // 解除阻塞后可以撤销
      expect(result.current.canUndo()).toBe(true)
      
      act(() => {
        result.current.undo()
      })
      
      expect(result.current.state).toEqual([1, 2, 3])
    })
  })
})