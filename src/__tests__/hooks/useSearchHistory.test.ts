import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearchHistory } from '../../hooks/useSearchHistory'

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('初始为空数组', () => {
    const { result } = renderHook(() => useSearchHistory())
    expect(result.current.history).toEqual([])
  })

  it('addHistory 添加查询', () => {
    const { result } = renderHook(() => useSearchHistory())
    act(() => {
      result.current.addHistory('bubble')
    })
    expect(result.current.history).toEqual(['bubble'])
  })

  it('相同查询去重并置顶', () => {
    const { result } = renderHook(() => useSearchHistory())
    act(() => {
      result.current.addHistory('bubble')
      result.current.addHistory('quick')
      result.current.addHistory('bubble')
    })
    expect(result.current.history).toEqual(['bubble', 'quick'])
  })

  it('空字符串不写入历史', () => {
    const { result } = renderHook(() => useSearchHistory())
    act(() => {
      result.current.addHistory('  ')
    })
    expect(result.current.history).toEqual([])
  })

  it('removeHistory 删除指定项', () => {
    const { result } = renderHook(() => useSearchHistory())
    act(() => {
      result.current.addHistory('bubble')
      result.current.addHistory('quick')
      result.current.removeHistory('bubble')
    })
    expect(result.current.history).toEqual(['quick'])
  })

  it('clearHistory 清空历史', () => {
    const { result } = renderHook(() => useSearchHistory())
    act(() => {
      result.current.addHistory('bubble')
      result.current.clearHistory()
    })
    expect(result.current.history).toEqual([])
  })

  it('历史记录持久化到 localStorage', () => {
    const { result, unmount } = renderHook(() => useSearchHistory())
    act(() => {
      result.current.addHistory('bubble')
    })
    unmount()

    const { result: result2 } = renderHook(() => useSearchHistory())
    expect(result2.current.history).toEqual(['bubble'])
  })

  it('历史记录上限为 10 条', () => {
    const { result } = renderHook(() => useSearchHistory())
    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addHistory(`query-${i}`)
      }
    })
    expect(result.current.history).toHaveLength(10)
  })
})
