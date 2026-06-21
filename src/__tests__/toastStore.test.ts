import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { showToast, dismissToast, formatErrorMessage } from '../components/toastStore'

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

    it('错误 toast 应该显示模块和操作前缀', () => {
      expect(formatErrorMessage('输入无效', '数组', '插入')).toBe('[数组 / 插入] 输入无效')
    })

    it('错误 toast 仅模块时应该正确格式化', () => {
      expect(formatErrorMessage('越界', '栈')).toBe('[栈] 越界')
    })

    it('非错误 toast 不应该添加前缀', () => {
      const { cleanup } = showToast({ type: 'success', message: '成功', module: '数组', operation: '插入' })
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
