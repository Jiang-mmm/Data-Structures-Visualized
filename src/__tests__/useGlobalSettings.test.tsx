import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { GlobalSettingsProvider, useGlobalSettings } from '../hooks/useGlobalSettings'

function wrapper({ children }: { children: ReactNode }) {
  return <GlobalSettingsProvider>{children}</GlobalSettingsProvider>
}

describe('useGlobalSettings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该在 Provider 内使用时返回上下文', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    expect(result.current.t).toBeDefined()
    expect(result.current.lang).toBeDefined()
    expect(result.current.animationSpeed).toBeDefined()
  })

  it('t 函数应该返回翻译字符串', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    expect(result.current.t('common.reset')).toBe('重置')
  })

  it('应该返回默认语言 zh', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    expect(result.current.lang).toBe('zh')
  })

  it('setLanguage 应该切换语言', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    act(() => { result.current.setLanguage('en') })
    expect(result.current.lang).toBe('en')
    expect(result.current.t('common.reset')).toBe('Reset')
  })

  it('animationSpeed 应该有默认值', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    expect(typeof result.current.animationSpeed).toBe('number')
    expect(result.current.animationSpeed).toBeGreaterThan(0)
  })

  it('setAnimationSpeed 应该更新速度', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    act(() => { result.current.setAnimationSpeed(2) })
    expect(result.current.animationSpeed).toBe(2)
  })

  it('cycleSpeed 应该循环速度预设', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    const initial = result.current.animationSpeed
    act(() => { result.current.cycleSpeed() })
    expect(result.current.animationSpeed).not.toBe(initial)
  })

  it('applyPreset 应该应用预设', () => {
    const { result } = renderHook(() => useGlobalSettings(), { wrapper })
    act(() => { result.current.applyPreset('fast') })
    expect(result.current.currentPreset).toBe('fast')
  })

  it('应该在 Provider 外使用时抛出错误', () => {
    expect(() => renderHook(() => useGlobalSettings())).toThrow(
      'useGlobalSettings must be used within GlobalSettingsProvider'
    )
  })
})
