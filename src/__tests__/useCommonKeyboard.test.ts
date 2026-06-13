import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCommonKeyboard } from '../hooks/useCommonKeyboard'

const mockUseKeyboard = vi.fn()

vi.mock('../hooks/useKeyboard', () => ({
  useKeyboard: (...args: unknown[]) => mockUseKeyboard(...args),
}))

describe('useCommonKeyboard', () => {
  it('应该导出 useCommonKeyboard 函数', () => {
    expect(typeof useCommonKeyboard).toBe('function')
  })

  describe('键盘快捷键注册', () => {
    it('应该注册 Ctrl+Z 为撤销', () => {
      const callbacks = { undo: vi.fn(), redo: vi.fn(), reset: vi.fn(), isAnimating: false }
      mockUseKeyboard.mockClear()

      renderHook(() => useCommonKeyboard(callbacks))

      expect(mockUseKeyboard).toHaveBeenCalledTimes(1)
      const shortcutsArg = mockUseKeyboard.mock.calls[0][0]
      expect(shortcutsArg).toHaveProperty('ctrl+z')
      expect(shortcutsArg['ctrl+z']).toBe(callbacks.undo)
    })

    it('应该注册 Ctrl+Shift+Z 为重做', () => {
      const callbacks = { undo: vi.fn(), redo: vi.fn(), reset: vi.fn(), isAnimating: false }
      mockUseKeyboard.mockClear()

      renderHook(() => useCommonKeyboard(callbacks))

      const shortcutsArg = mockUseKeyboard.mock.calls[0][0]
      expect(shortcutsArg).toHaveProperty('ctrl+shift+z')
      expect(shortcutsArg['ctrl+shift+z']).toBe(callbacks.redo)
    })

    it('应该注册 R 键为重置', () => {
      const callbacks = { undo: vi.fn(), redo: vi.fn(), reset: vi.fn(), isAnimating: false }
      mockUseKeyboard.mockClear()

      renderHook(() => useCommonKeyboard(callbacks))

      const shortcutsArg = mockUseKeyboard.mock.calls[0][0]
      expect(shortcutsArg).toHaveProperty('r')
      expect(shortcutsArg.r).toBe(callbacks.reset)
    })

    it('动画中应该禁用快捷键', () => {
      const callbacks = { undo: vi.fn(), redo: vi.fn(), reset: vi.fn(), isAnimating: true }
      mockUseKeyboard.mockClear()

      renderHook(() => useCommonKeyboard(callbacks))

      expect(mockUseKeyboard).toHaveBeenCalledTimes(1)
      const enabledArg = mockUseKeyboard.mock.calls[0][1]
      expect(enabledArg).toBe(false)
    })

    it('非动画中应该启用快捷键', () => {
      const callbacks = { undo: vi.fn(), redo: vi.fn(), reset: vi.fn(), isAnimating: false }
      mockUseKeyboard.mockClear()

      renderHook(() => useCommonKeyboard(callbacks))

      const enabledArg = mockUseKeyboard.mock.calls[0][1]
      expect(enabledArg).toBe(true)
    })

    it('应该传递正确的回调引用', () => {
      const undo = vi.fn()
      const redo = vi.fn()
      const reset = vi.fn()
      const callbacks = { undo, redo, reset, isAnimating: false }
      mockUseKeyboard.mockClear()

      renderHook(() => useCommonKeyboard(callbacks))

      const shortcutsArg = mockUseKeyboard.mock.calls[0][0]
      expect(shortcutsArg['ctrl+z']).toBe(undo)
      expect(shortcutsArg['ctrl+shift+z']).toBe(redo)
      expect(shortcutsArg.r).toBe(reset)
    })
  })
})