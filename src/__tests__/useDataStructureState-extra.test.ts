import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDataStructureState } from '../hooks/useDataStructureState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

import { showToast } from '../components/toastStore'
const showToastMock = vi.mocked(showToast)

describe('useDataStructureState 边界与错误路径', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('localStorage 错误处理', () => {
    it('loadFromStorage 中 JSON.parse 失败应清除 storage 并返回 null', () => {
      // 写入无效 JSON 到 storage
      localStorage.setItem('ds-visualizer-data-bad-key', '{invalid json{')
      // useDataStructureState 初始化时应静默忽略
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'bad-key' })
      )
      expect(result.current.data).toEqual([1, 2, 3])
      // localStorage 应被清除
      expect(localStorage.getItem('ds-visualizer-data-bad-key')).toBeNull()
    })

    it('loadFromStorage 中 schema 验证失败应清除 storage', () => {
      // 写入 schema 不接受的数据（空数组）
      localStorage.setItem('ds-visualizer-data-empty-arr', JSON.stringify([]))
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'empty-arr' })
      )
      expect(result.current.data).toEqual([1, 2, 3])
      expect(localStorage.getItem('ds-visualizer-data-empty-arr')).toBeNull()
    })

    it('loadFromStorage 中遇到 null（顶层）应被拒绝', () => {
      localStorage.setItem('ds-visualizer-data-null', JSON.stringify(null))
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'null-key' })
      )
      expect(result.current.data).toEqual([1, 2, 3])
    })

    it('loadFromStorage 中遇到 undefined（顶层）应被拒绝', () => {
      localStorage.setItem('ds-visualizer-data-undef', 'undefined')
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'undef-key' })
      )
      expect(result.current.data).toEqual([1, 2, 3])
    })

    it('saveToStorage 抛错（quota exceeded）应被吞掉', () => {
      vi.useFakeTimers()
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'quota' })
      )
      act(() => {
        result.current.push([4, 5, 6])
        vi.advanceTimersByTime(200)
      })
      // 不应抛错
      expect(result.current.data).toEqual([4, 5, 6])
      setItemSpy.mockRestore()
    })
  })

  describe('animationTimeout 机制', () => {
    it('setIsAnimating(true) 启动 15s 超时计时器', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'anim' })
      )
      act(() => {
        result.current.setIsAnimating(true)
      })
      expect(result.current.isAnimating).toBe(true)

      // 15s 后应自动 setIsAnimating(false) 并 toast
      act(() => {
        vi.advanceTimersByTime(15000)
      })
      expect(result.current.isAnimating).toBe(false)
      expect(showToastMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      )
    })

    it('setIsAnimating(false) 取消超时计时器', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'anim' })
      )
      act(() => {
        result.current.setIsAnimating(true)
      })
      act(() => {
        result.current.setIsAnimating(false)
      })
      // 15s 后不应触发 toast
      act(() => {
        vi.advanceTimersByTime(16000)
      })
      expect(showToastMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      )
    })

    it('setIsAnimating(true) 重复调用应重置计时器', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'anim' })
      )
      act(() => {
        result.current.setIsAnimating(true)
      })
      act(() => {
        vi.advanceTimersByTime(10000)
      })
      // 重新调用应重置
      act(() => {
        result.current.setIsAnimating(true)
        vi.advanceTimersByTime(10000) // 总 20s
      })
      // 第一次超时未触发
      expect(result.current.isAnimating).toBe(true)
      // 再过 5s 触发新超时
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('undo/redo 在动画中', () => {
    it('handleUndo 在 isAnimating=true 时应调用 abortAnimation', () => {
      const abortAnimation = vi.fn()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], {
          storageKey: 'undo-anim',
          abortAnimation,
        })
      )
      act(() => {
        result.current.push([4, 5, 6])
      })
      // 分两次 act：先设置 isAnimating 让 closure 更新，再调用 undo
      act(() => {
        result.current.setIsAnimating(true)
      })
      act(() => {
        result.current.undo()
      })
      expect(abortAnimation).toHaveBeenCalled()
      expect(result.current.data).toEqual([1, 2, 3])
    })

    it('handleRedo 在 isAnimating=true 时应调用 abortAnimation', () => {
      const abortAnimation = vi.fn()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], {
          storageKey: 'redo-anim',
          abortAnimation,
        })
      )
      act(() => {
        result.current.push([4, 5, 6])
        result.current.undo()
      })
      act(() => {
        result.current.setIsAnimating(true)
      })
      act(() => {
        result.current.redo()
      })
      expect(abortAnimation).toHaveBeenCalled()
      expect(result.current.data).toEqual([4, 5, 6])
    })

    it('handleUndo 在 canUndo=false 时应静默返回', () => {
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'no-undo' })
      )
      // 初始状态无历史
      act(() => {
        result.current.undo()
      })
      expect(result.current.data).toEqual([1, 2, 3])
    })

    it('handleRedo 在 canRedo=false 时应静默返回', () => {
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'no-redo' })
      )
      act(() => {
        result.current.redo()
      })
      expect(result.current.data).toEqual([1, 2, 3])
    })
  })

  describe('clearPersist 边界', () => {
    it('无 storageKey 时应静默', () => {
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3])
      )
      act(() => {
        result.current.clearPersist()
      })
      // 不应抛错
    })

    it('有 storageKey 时应清除 localStorage', () => {
      localStorage.setItem('ds-visualizer-data-clear', JSON.stringify([1, 2, 3]))
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'clear' })
      )
      act(() => {
        result.current.clearPersist()
      })
      expect(localStorage.getItem('ds-visualizer-data-clear')).toBeNull()
    })
  })

  describe('logs 截断', () => {
    it('添加超过 100 条 logs 应被截断', () => {
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'logs' })
      )
      act(() => {
        for (let i = 0; i < 110; i++) {
          result.current.addLog('info', `log-${i}`)
        }
      })
      expect(result.current.logs.length).toBe(100)
      // 最早的应被丢弃
      expect(result.current.logs[0]?.message).toBe('log-10')
      expect(result.current.logs[99]?.message).toBe('log-109')
    })
  })

  describe('reset 完整流程', () => {
    it('reset 应清除 logs、history、storage 并 toast', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'reset-test' })
      )
      act(() => {
        result.current.push([4, 5, 6])
        result.current.addLog('info', 'test log')
        result.current.setIsAnimating(true)
        result.current.reset()
      })
      expect(result.current.data).toEqual([1, 2, 3])
      expect(result.current.logs).toEqual([])
      expect(result.current.isAnimating).toBe(false)
      expect(localStorage.getItem('ds-visualizer-data-reset-test')).toBeNull()
    })
  })

  describe('loadData 流程', () => {
    it('loadData 应替换 history 并清空 logs', () => {
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'load' })
      )
      act(() => {
        result.current.push([4, 5, 6])
        result.current.addLog('info', 'before')
        result.current.loadData([7, 8, 9])
      })
      expect(result.current.data).toEqual([7, 8, 9])
      expect(result.current.logs).toEqual([])
    })
  })

  describe('clearLogs 流程', () => {
    it('clearLogs 应清空 logs 但不影响 data', () => {
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'cl' })
      )
      act(() => {
        result.current.push([4, 5, 6])
        result.current.addLog('info', 'test')
        result.current.clearLogs()
      })
      expect(result.current.logs).toEqual([])
      expect(result.current.data).toEqual([4, 5, 6])
    })
  })

  describe('beforeunload 事件', () => {
    it('beforeunload 触发时应立即保存待写入数据', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3], { storageKey: 'unload' })
      )
      act(() => {
        result.current.push([4, 5, 6])
      })
      // 防抖期内 storage 还未写入
      expect(localStorage.getItem('ds-visualizer-data-unload')).toBeNull()

      // 触发 beforeunload
      act(() => {
        const event = new Event('beforeunload')
        window.dispatchEvent(event)
      })
      // 应立即写入
      const stored = localStorage.getItem('ds-visualizer-data-unload')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual([4, 5, 6])
    })

    it('无 storageKey 时 beforeunload 应被忽略', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      renderHook(() => useDataStructureState<number[]>([1, 2, 3]))
      act(() => {
        const event = new Event('beforeunload')
        window.dispatchEvent(event)
      })
      expect(setItemSpy).not.toHaveBeenCalled()
      setItemSpy.mockRestore()
    })
  })

  describe('无 storageKey 行为', () => {
    it('push 后不应触发 localStorage 写入', () => {
      vi.useFakeTimers()
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      const { result } = renderHook(() =>
        useDataStructureState<number[]>([1, 2, 3]) // 无 storageKey
      )
      act(() => {
        result.current.push([4, 5, 6])
        vi.advanceTimersByTime(200)
      })
      expect(setItemSpy).not.toHaveBeenCalled()
      setItemSpy.mockRestore()
    })

    it('data === null 时不应触发写入', () => {
      vi.useFakeTimers()
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      renderHook(() =>
        useDataStructureState<number[] | null>(null, { storageKey: 'null-data' })
      )
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(setItemSpy).not.toHaveBeenCalled()
      setItemSpy.mockRestore()
    })
  })
})
