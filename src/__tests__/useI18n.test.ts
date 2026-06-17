import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useI18n, tStatic } from '../i18n/useI18n'

describe('useI18n', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('tStatic', () => {
    it('应该返回中文翻译（默认语言）', () => {
      const result = tStatic('common.reset')
      expect(result).toBe('重置')
    })

    it('应该支持嵌套键', () => {
      const result = tStatic('array.title')
      expect(result).toBe('数组')
    })

    it('应该在键不存在时返回原始键', () => {
      const result = tStatic('nonexistent.key')
      expect(result).toBe('nonexistent.key')
    })

    it('应该在语言切换后返回对应翻译', () => {
      localStorage.setItem('ds-visualizer-lang', 'en')
      const result = tStatic('common.reset')
      expect(result).toBe('Reset')
    })
  })

  describe('useI18n hook', () => {
    it('应该返回默认中文语言', () => {
      const { result } = renderHook(() => useI18n())
      expect(result.current.lang).toBe('zh')
    })

    it('t 函数应该返回中文翻译', () => {
      const { result } = renderHook(() => useI18n())
      expect(result.current.t('common.reset')).toBe('重置')
    })

    it('t 函数应该在键不存在时返回原始键', () => {
      const { result } = renderHook(() => useI18n())
      expect(result.current.t('missing.key')).toBe('missing.key')
    })

    it('setLanguage 应该切换语言', () => {
      const { result } = renderHook(() => useI18n())
      act(() => { result.current.setLanguage('en') })
      expect(result.current.lang).toBe('en')
      expect(result.current.t('common.reset')).toBe('Reset')
    })

    it('setLanguage 应该忽略无效语言', () => {
      const { result } = renderHook(() => useI18n())
      act(() => { result.current.setLanguage('fr') })
      expect(result.current.lang).toBe('zh')
    })

    it('setLanguage 应该保存到 localStorage', () => {
      const { result } = renderHook(() => useI18n())
      act(() => { result.current.setLanguage('en') })
      expect(localStorage.getItem('ds-visualizer-lang')).toBe('en')
    })

    it('应该从 localStorage 恢复语言设置', () => {
      localStorage.setItem('ds-visualizer-lang', 'en')
      const { result } = renderHook(() => useI18n())
      expect(result.current.lang).toBe('en')
    })

    it('supportedLanguages 应该返回支持的语言列表', () => {
      const { result } = renderHook(() => useI18n())
      expect(result.current.supportedLanguages).toContain('zh')
      expect(result.current.supportedLanguages).toContain('en')
    })

    it('应该在语言切换后更新 t 函数', () => {
      const { result } = renderHook(() => useI18n())
      const zhResult = result.current.t('stack.push')
      act(() => { result.current.setLanguage('en') })
      const enResult = result.current.t('stack.push')
      expect(zhResult).not.toBe(enResult)
    })
  })
})
