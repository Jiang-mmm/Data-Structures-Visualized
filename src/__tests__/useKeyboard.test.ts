import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboard, DEFAULT_SHORTCUTS } from '../hooks/useKeyboard'

describe('useKeyboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up event listeners
    document.body.innerHTML = ''
  })

  describe('基础功能', () => {
    it('应该注册键盘事件监听器', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useKeyboard({ test: vi.fn() }))

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('禁用时不应该触发回调', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ a: action }, false))

      const event = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event)

      expect(action).not.toHaveBeenCalled()
    })

    it('启用时应该触发回调', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ a: action }, true))

      const event = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event)

      expect(action).toHaveBeenCalledTimes(1)
    })
  })

  describe('快捷键匹配', () => {
    it('应该匹配单键快捷键', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ r: action }))

      const event = new KeyboardEvent('keydown', { key: 'r' })
      window.dispatchEvent(event)

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('应该匹配 Ctrl 组合键', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ 'ctrl+z': action }))

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true })
      window.dispatchEvent(event)

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('应该匹配 Shift 组合键', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ 'shift+a': action }))

      const event = new KeyboardEvent('keydown', { key: 'a', shiftKey: true })
      window.dispatchEvent(event)

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('应该匹配 Ctrl+Shift 组合键', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ 'ctrl+shift+z': action }))

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true })
      window.dispatchEvent(event)

      expect(action).toHaveBeenCalledTimes(1)
    })

    it('不匹配时应该不触发', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ 'ctrl+z': action }))

      const event = new KeyboardEvent('keydown', { key: 'z' })
      window.dispatchEvent(event)

      expect(action).not.toHaveBeenCalled()
    })
  })

  describe('输入框过滤', () => {
    it('输入框中不应该触发无 Ctrl 的快捷键', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ r: action }))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const event = new KeyboardEvent('keydown', { key: 'r', bubbles: true })
      input.dispatchEvent(event)

      expect(action).not.toHaveBeenCalled()
      document.body.removeChild(input)
    })

    it('输入框中 Ctrl+Z 不应该触发，避免与浏览器原生撤销冲突', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ 'ctrl+z': action }))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
      input.dispatchEvent(event)

      expect(action).not.toHaveBeenCalled()
      document.body.removeChild(input)
    })

    it('输入框中非撤销/重做 Ctrl 组合键仍应触发', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ 'ctrl+s': action }))

      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
      input.dispatchEvent(event)

      expect(action).toHaveBeenCalledTimes(1)
      document.body.removeChild(input)
    })

    it('textarea 中不应该触发无 Ctrl 的快捷键', () => {
      const action = vi.fn()
      renderHook(() => useKeyboard({ r: action }))

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.focus()

      const event = new KeyboardEvent('keydown', { key: 'r', bubbles: true })
      textarea.dispatchEvent(event)

      expect(action).not.toHaveBeenCalled()
      document.body.removeChild(textarea)
    })
  })

  describe('动态更新', () => {
    it('应该响应 shortcuts 变化', () => {
      const action1 = vi.fn()
      const action2 = vi.fn()
      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboard(shortcuts),
        { initialProps: { shortcuts: { a: action1 } } }
      )

      const event1 = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event1)
      expect(action1).toHaveBeenCalledTimes(1)

      rerender({ shortcuts: { a: action2 } })

      const event2 = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event2)
      expect(action2).toHaveBeenCalledTimes(1)
    })

    it('应该响应 enabled 变化', () => {
      const action = vi.fn()
      const { rerender } = renderHook(
        ({ enabled }) => useKeyboard({ a: action }, enabled),
        { initialProps: { enabled: true } }
      )

      const event1 = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event1)
      expect(action).toHaveBeenCalledTimes(1)

      rerender({ enabled: false })
      action.mockClear()

      const event2 = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(event2)
      expect(action).not.toHaveBeenCalled()
    })
  })

  describe('DEFAULT_SHORTCUTS', () => {
    it('应该包含所有数据结构类型的快捷键', () => {
      expect(DEFAULT_SHORTCUTS).toHaveProperty('array')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('stack')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('queue')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('linkedlist')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('tree')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('graph')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('hash')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('heap')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('trie')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('sort')
      expect(DEFAULT_SHORTCUTS).toHaveProperty('compare')
    })

    it('每个类型都应该包含 undo 和 redo', () => {
      const dataStructureTypes = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'graph', 'hash', 'heap', 'trie']
      dataStructureTypes.forEach(type => {
        expect(DEFAULT_SHORTCUTS[type]).toHaveProperty('undo')
        expect(DEFAULT_SHORTCUTS[type]).toHaveProperty('redo')
        expect(DEFAULT_SHORTCUTS[type]).toHaveProperty('reset')
        expect(DEFAULT_SHORTCUTS[type]).toHaveProperty('help')
      })
    })

    it('sort 类型应该包含 pause', () => {
      expect(DEFAULT_SHORTCUTS.sort).toHaveProperty('pause')
      expect(DEFAULT_SHORTCUTS.sort.pause).toBe(' ')
    })
  })
})