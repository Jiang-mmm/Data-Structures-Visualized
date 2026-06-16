import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLearningProgress } from '../hooks/useLearningProgress'

describe('useLearningProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该返回初始空进度', () => {
    const { result } = renderHook(() => useLearningProgress())
    const { total, completed, percentage } = result.current.getProgress()
    expect(total).toBe(10)
    expect(completed).toBe(0)
    expect(percentage).toBe(0)
  })

  it('应该标记节点为已访问', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markVisited('array'))
    expect(result.current.isVisited('array')).toBe(true)
    expect(result.current.isVisited('stack')).toBe(false)
  })

  it('应该标记节点为已完成', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))
    expect(result.current.isCompleted('array')).toBe(true)
    expect(result.current.isVisited('array')).toBe(true) // completed implies visited
  })

  it('应该正确计算进度百分比', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))
    const { completed, percentage } = result.current.getProgress()
    expect(completed).toBe(1)
    expect(percentage).toBe(10)
  })

  it('array无前置条件应该默认解锁', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isUnlocked('array')).toBe(true)
  })

  it('stack需要完成array才能解锁', () => {
    const { result } = renderHook(() => useLearningProgress())

    expect(result.current.isUnlocked('stack')).toBe(false)

    act(() => result.current.markCompleted('array'))
    expect(result.current.isUnlocked('stack')).toBe(true)
  })

  it('graph需要完成linkedlist和queue才能解锁', () => {
    const { result } = renderHook(() => useLearningProgress())

    expect(result.current.isUnlocked('graph')).toBe(false)

    act(() => result.current.markCompleted('array'))
    expect(result.current.isUnlocked('graph')).toBe(false)

    act(() => result.current.markCompleted('linkedlist'))
    expect(result.current.isUnlocked('graph')).toBe(false)

    act(() => result.current.markCompleted('queue'))
    expect(result.current.isUnlocked('graph')).toBe(true)
  })

  it('应该重置进度', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))
    act(() => result.current.markVisited('stack'))
    expect(result.current.getProgress().completed).toBe(1)

    act(() => result.current.resetProgress())
    expect(result.current.getProgress().completed).toBe(0)
    expect(result.current.isVisited('array')).toBe(false)
    expect(result.current.isUnlocked('array')).toBe(true) // array has no prerequisites
  })

  it('不应该重复标记已访问的节点', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markVisited('array'))
    act(() => result.current.markVisited('array'))
    // Should still only have 1 visited
    expect(result.current.isVisited('array')).toBe(true)
  })

  it('应该将进度持久化到localStorage', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))

    const stored = JSON.parse(localStorage.getItem('ds-visualizer-learning-progress')!)
    expect(stored.completed).toContain('array')
  })

  it('应该从localStorage恢复进度', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'stack'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isVisited('array')).toBe(true)
    expect(result.current.isVisited('stack')).toBe(true)
    expect(result.current.isCompleted('array')).toBe(true)
    expect(result.current.isCompleted('stack')).toBe(false)
  })

  it('应该处理无效的localStorage数据', () => {
    localStorage.setItem('ds-visualizer-learning-progress', 'invalid-json!!')
    const { result } = renderHook(() => useLearningProgress())
    const { completed } = result.current.getProgress()
    expect(completed).toBe(0)
  })

  it('应该处理未知节点ID', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isUnlocked('nonexistent')).toBe(false)
    expect(result.current.isVisited('nonexistent')).toBe(false)
  })
})
