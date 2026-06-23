import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColorTheme } from '../hooks/useColorTheme'
import * as themeColors from '../utils/themeColors'

vi.mock('../utils/themeColors', () => ({
  getTheme: vi.fn(() => 'default'),
  setTheme: vi.fn(),
  subscribeTheme: vi.fn(() => () => {}),
  getAvailableThemes: vi.fn(() => [
    { key: 'default', name: 'Default', nameKey: 'sidebar.themeDefault', icon: '◉' },
    { key: 'forest', name: 'Forest', nameKey: 'sidebar.themeForest', icon: '◈' },
    { key: 'warm', name: 'Warm', nameKey: 'sidebar.themeWarm', icon: '◎' },
  ]),
}))

describe('useColorTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该返回当前主题', () => {
    const { result } = renderHook(() => useColorTheme())
    expect(result.current.theme).toBe('default')
  })

  it('应该返回 setTheme 函数', () => {
    const { result } = renderHook(() => useColorTheme())
    expect(typeof result.current.setTheme).toBe('function')
  })

  it('应该返回可用主题列表', () => {
    const { result } = renderHook(() => useColorTheme())
    expect(result.current.themes.length).toBe(3)
    expect(result.current.themes[0]?.key).toBe('default')
  })

  it('th 应该暴露的字段：theme / setTheme / themes', () => {
    const { result } = renderHook(() => useColorTheme())
    expect(result.current).toHaveProperty('theme')
    expect(result.current).toHaveProperty('setTheme')
    expect(result.current).toHaveProperty('themes')
  })

  it('setTheme 调用应该能正常执行', () => {
    const { result } = renderHook(() => useColorTheme())
    expect(() => act(() => {
      result.current.setTheme('dark')
    })).not.toThrow()
  })

  it('应该订阅主题变化', () => {
    renderHook(() => useColorTheme())
    expect(vi.mocked(themeColors.subscribeTheme)).toHaveBeenCalled()
  })

  it('应该使用 getTheme 获取初始主题', () => {
    renderHook(() => useColorTheme())
    expect(vi.mocked(themeColors.getTheme)).toHaveBeenCalled()
  })

  it('应该返回 getAvailableThemes 调用结果', () => {
    const { result } = renderHook(() => useColorTheme())
    // 验证 themes 来自 getAvailableThemes
    expect(result.current.themes).toEqual(vi.mocked(themeColors.getAvailableThemes)())
  })
})
