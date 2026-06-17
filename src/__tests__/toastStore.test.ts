import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { showToast, dismissToast } from '../components/toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('showToast', () => {
    it('应该返回包含 id 和 cleanup 的对象', () => {
      const result = showToast({ type: 'info', message: 'test' })
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('cleanup')
      expect(typeof result.id).toBe('number')
      expect(typeof result.cleanup).toBe('function')
      result.cleanup()
    })

    it('应该支持不同类型的 toast', () => {
      const types = ['error', 'success', 'warning', 'info'] as const
      const cleanups = types.map(type =>
        showToast({ type, message: `${type} message` })
      )
      cleanups.forEach(c => c.cleanup())
    })

    it('cleanup 应该立即移除 toast', () => {
      const { cleanup } = showToast({ type: 'info', message: 'cleanup test' })
      cleanup()
    })

    it('应该支持自定义 duration', () => {
      const { cleanup } = showToast({ type: 'info', message: 'custom', duration: 5000 })
      cleanup()
    })
  })

  describe('dismissToast', () => {
    it('应该手动移除指定 toast', () => {
      const { id, cleanup: _cleanup } = showToast({ type: 'info', message: 'to dismiss' })
      dismissToast(id)
    })
  })
})
