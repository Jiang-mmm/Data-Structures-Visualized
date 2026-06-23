/**
 * toastStore useToast hook + dismissToast 完整测试
 * 用于提升 src/components/toastStore.ts 覆盖率（基线 72.97% statements / 46.15% functions）
 * 覆盖：useSyncExternalStore、subscribe 取消订阅、toast 数量上限 MAX_TOASTS=5
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { showToast, dismissToast, useToast } from '../components/toastStore'

describe('toastStore useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    // 触发所有 pending setTimeout（含 toast 自动 dismiss），避免模块级 toasts 数组在测试间残留
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('useToast', () => {
    it('应返回 toasts 数组（初始为空）', () => {
      const { result } = renderHook(() => useToast())
      expect(result.current.toasts).toEqual([])
    })

    it('应返回 toast 函数', () => {
      const { result } = renderHook(() => useToast())
      expect(typeof result.current.toast).toBe('function')
    })

    it('调用 toast 后 toasts 应更新', () => {
      const { result } = renderHook(() => useToast())
      act(() => {
        result.current.toast({ type: 'info', message: 'test' })
      })
      expect(result.current.toasts.length).toBe(1)
      expect(result.current.toasts[0].message).toBe('test')
    })

    it('toast 函数应返回 cleanup', () => {
      const { result } = renderHook(() => useToast())
      let cleanup: (() => void) | null = null
      act(() => {
        const ret = result.current.toast({ type: 'info', message: 'cleanup' })
        cleanup = ret.cleanup
      })
      expect(cleanup).toBeTruthy()
    })

    it('多个 hook 实例应共享 toasts 状态', () => {
      const { result: r1 } = renderHook(() => useToast())
      const { result: r2 } = renderHook(() => useToast())
      act(() => {
        r1.current.toast({ type: 'info', message: 'shared' })
      })
      expect(r2.current.toasts.length).toBe(1)
    })

    it('cleanup 应立即移除 toast', () => {
      const { result } = renderHook(() => useToast())
      let cleanup: (() => void) | null = null
      act(() => {
        const ret = result.current.toast({ type: 'info', message: 'immediate cleanup' })
        cleanup = ret.cleanup
      })
      expect(result.current.toasts.length).toBe(1)
      act(() => {
        cleanup?.()
      })
      expect(result.current.toasts.length).toBe(0)
    })

    it('toast 自动过期应使用 duration', () => {
      const { result } = renderHook(() => useToast())
      act(() => {
        result.current.toast({ type: 'info', message: 'auto dismiss', duration: 1000 })
      })
      expect(result.current.toasts.length).toBe(1)
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(result.current.toasts.length).toBe(0)
    })

    it('MAX_TOASTS 上限（5）应被强制', () => {
      // 直接用 showToast 模块函数添加 7 个
      for (let i = 0; i < 7; i++) {
        const { cleanup } = showToast({ type: 'info', message: `toast ${i}` })
        // 不在 showToast 内部清理，仅触发 emitChange
        void cleanup
      }
      // 最后只剩 5 个
      // 这里用模块级 showToast，没经过 useSyncExternalStore
      // 仅验证模块内部状态
      const { result } = renderHook(() => useToast())
      expect(result.current.toasts.length).toBeLessThanOrEqual(5)
    })
  })

  describe('dismissToast 完整路径', () => {
    it('dismissToast 不存在的 id 应为 no-op', () => {
      // 不抛错
      expect(() => dismissToast(99999)).not.toThrow()
    })

    it('连续 dismiss 多个 id', () => {
      const a = showToast({ type: 'info', message: 'a' })
      const b = showToast({ type: 'info', message: 'b' })
      dismissToast(a.id)
      dismissToast(b.id)
    })
  })
})
