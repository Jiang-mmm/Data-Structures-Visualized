import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { yieldToMain, runWithTimeSlicing } from '../utils/timeslicing'

describe('timeslicing', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('yieldToMain', () => {
    it('应该返回 Promise', () => {
      const result = yieldToMain()
      expect(result).toBeInstanceOf(Promise)
    })

    it('应该经过异步后 resolve', async () => {
      let resolved = false
      yieldToMain().then(() => { resolved = true })
      expect(resolved).toBe(false)
      await vi.runAllTimersAsync()
      expect(resolved).toBe(true)
    })
  })

  describe('runWithTimeSlicing', () => {
    it('应该处理所有元素', async () => {
      const processItem = vi.fn().mockImplementation(async (item: number) => item * 2)
      const promise = runWithTimeSlicing([1, 2, 3], processItem)
      await vi.advanceTimersByTimeAsync(50)
      const results = await promise
      expect(results).toEqual([2, 4, 6])
      expect(processItem).toHaveBeenCalledTimes(3)
    })

    it('空数组应该返回空结果', async () => {
      const processItem = vi.fn()
      const results = await runWithTimeSlicing([], processItem)
      expect(results).toEqual([])
      expect(processItem).not.toHaveBeenCalled()
    })

    it('应该按索引顺序处理', async () => {
      const calls: number[] = []
      const processItem = vi.fn().mockImplementation(async (item: number, index: number) => {
        calls.push(index)
      })
      const promise = runWithTimeSlicing([1, 2, 3], processItem)
      await vi.advanceTimersByTimeAsync(100)
      await promise
      expect(calls).toEqual([0, 1, 2])
    })

    it('默认 batchSize 为 10', async () => {
      const items = Array.from({ length: 25 }, (_, i) => i)
      const processItem = vi.fn().mockImplementation(async (item: number) => item)
      const promise = runWithTimeSlicing(items, processItem)
      await vi.advanceTimersByTimeAsync(200)
      await promise
      expect(processItem).toHaveBeenCalledTimes(25)
    })

    it('自定义 batchSize 应该生效', async () => {
      const items = Array.from({ length: 5 }, (_, i) => i)
      const processItem = vi.fn().mockImplementation(async (item: number) => item)
      const promise = runWithTimeSlicing(items, processItem, 2)
      await vi.advanceTimersByTimeAsync(100)
      await promise
      expect(processItem).toHaveBeenCalledTimes(5)
    })
  })
})