import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../hooks/useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('应该返回默认 system 模式', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.mode).toBe('system')
    expect(['light', 'dark']).toContain(result.current.resolved)
  })

  it('cycle 应该切换 light -> dark -> system', () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.cycle() })
    expect(result.current.mode).toBe('light')
    expect(result.current.resolved).toBe('light')

    act(() => { result.current.cycle() })
    expect(result.current.mode).toBe('dark')
    expect(result.current.resolved).toBe('dark')

    act(() => { result.current.cycle() })
    expect(result.current.mode).toBe('system')
  })

  it('set 应该直接设置主题', () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.set('dark') })
    expect(result.current.mode).toBe('dark')
    expect(result.current.resolved).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('set light 应该移除 dark class', () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.set('dark') })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => { result.current.set('light') })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('应该从 localStorage 恢复主题', () => {
    localStorage.setItem('ds-visualizer-theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.mode).toBe('dark')
    expect(result.current.resolved).toBe('dark')
  })

  it('应该保存主题到 localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.set('dark') })
    expect(localStorage.getItem('ds-visualizer-theme')).toBe('dark')
  })

  it('应该在 cycle 时更新 localStorage', () => {
    const { result } = renderHook(() => useTheme())
    act(() => { result.current.cycle() })
    expect(localStorage.getItem('ds-visualizer-theme')).toBe('light')
  })
})
