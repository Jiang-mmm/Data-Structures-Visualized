import { describe, it, expect, vi, beforeEach } from 'vitest'
import { perfLogger, measurePerf, measurePerfAsync, getPerfSummary, resetPerfLogger } from '../utils/performanceLogger'

describe('performanceLogger', () => {
  beforeEach(() => {
    resetPerfLogger()
    vi.clearAllMocks()
  })

  describe('perfLogger 单例', () => {
    it('perfLogger 应该是一个实例', () => {
      expect(perfLogger).toBeTruthy()
      expect(typeof perfLogger.recordFPS).toBe('function')
      expect(typeof perfLogger.getFPSStats).toBe('function')
    })
  })

  describe('FPS 记录', () => {
    it('应该记录 FPS 数据', () => {
      perfLogger.recordFPS(60, 16.67)
      const stats = perfLogger.getFPSStats()
      expect(stats.sampleCount).toBe(1)
      expect(stats.avgFPS).toBe(60)
    })

    it('应该计算平均值', () => {
      perfLogger.recordFPS(60, 16)
      perfLogger.recordFPS(30, 33)
      perfLogger.recordFPS(30, 33)
      const stats = perfLogger.getFPSStats()
      expect(stats.sampleCount).toBe(3)
      expect(stats.avgFPS).toBe(40)
    })

    it('无记录时应返回零值', () => {
      const stats = perfLogger.getFPSStats()
      expect(stats.sampleCount).toBe(0)
      expect(stats.avgFPS).toBe(0)
    })

    it('应该计算最小和最大 FPS', () => {
      perfLogger.recordFPS(30, 33)
      perfLogger.recordFPS(60, 16)
      perfLogger.recordFPS(45, 22)
      const stats = perfLogger.getFPSStats()
      expect(stats.minFPS).toBe(30)
      expect(stats.maxFPS).toBe(60)
    })

    it('应该限制最大记录数', () => {
      for (let i = 0; i < 350; i++) {
        perfLogger.recordFPS(60, 16)
      }
      const stats = perfLogger.getFPSStats()
      expect(stats.sampleCount).toBeLessThanOrEqual(300)
    })
  })

  describe('函数性能记录', () => {
    it('应该记录函数调用', () => {
      perfLogger.recordFunction('testFunc', 10)
      const stats = perfLogger.getFunctionStats()
      expect(stats.has('testFunc')).toBe(true)
      expect(stats.get('testFunc')!.callCount).toBe(1)
    })

    it('应该计算函数平均耗时', () => {
      perfLogger.recordFunction('testFunc', 10)
      perfLogger.recordFunction('testFunc', 20)
      const stats = perfLogger.getFunctionStats()
      expect(stats.get('testFunc')!.avgMs).toBe(15)
    })

    it('应该计算最小和最大耗时', () => {
      perfLogger.recordFunction('testFunc', 10)
      perfLogger.recordFunction('testFunc', 50)
      perfLogger.recordFunction('testFunc', 30)
      const stats = perfLogger.getFunctionStats()
      expect(stats.get('testFunc')!.minMs).toBe(10)
      expect(stats.get('testFunc')!.maxMs).toBe(50)
    })

    it('超过 100ms 应该记录警告', () => {
      const logSpy = vi.spyOn(perfLogger, 'log')
      perfLogger.recordFunction('slowFunc', 150)
      expect(logSpy).toHaveBeenCalledWith('warning', expect.stringContaining('slowFunc'), expect.any(Object))
      logSpy.mockRestore()
    })

    it('低于 100ms 不应该记录警告', () => {
      const logSpy = vi.spyOn(perfLogger, 'log')
      perfLogger.recordFunction('fastFunc', 50)
      const warningCalls = logSpy.mock.calls.filter(call => call[0] === 'warning')
      expect(warningCalls).toHaveLength(0)
      logSpy.mockRestore()
    })
  })

  describe('measurePerf', () => {
    it('应该测量函数执行时间', () => {
      const result = measurePerf('syncTest', () => {
        return 42
      })
      expect(result).toBe(42)
      const stats = perfLogger.getFunctionStats()
      expect(stats.has('syncTest')).toBe(true)
    })

    it('抛出异常时也应记录', () => {
      expect(() => {
        measurePerf('errorTest', () => {
          throw new Error('test error')
        })
      }).toThrow('test error')
      const stats = perfLogger.getFunctionStats()
      expect(stats.has('errorTest')).toBe(true)
    })
  })

  describe('measurePerfAsync', () => {
    it('应该测量异步函数执行时间', async () => {
      const result = await measurePerfAsync('asyncTest', async () => {
        return 84
      })
      expect(result).toBe(84)
      const stats = perfLogger.getFunctionStats()
      expect(stats.has('asyncTest')).toBe(true)
    })

    it('异步函数抛出异常时也应记录', async () => {
      await expect(
        measurePerfAsync('asyncErrorTest', async () => {
          throw new Error('async error')
        })
      ).rejects.toThrow('async error')
      const stats = perfLogger.getFunctionStats()
      expect(stats.has('asyncErrorTest')).toBe(true)
    })
  })

  describe('reset', () => {
    it('应该重置所有记录', () => {
      perfLogger.recordFPS(60, 16)
      perfLogger.recordFunction('test', 10)
      resetPerfLogger()
      expect(perfLogger.getFPSStats().sampleCount).toBe(0)
      expect(perfLogger.getFunctionStats().size).toBe(0)
    })
  })

  describe('getSummary', () => {
    it('应该返回摘要字符串', () => {
      perfLogger.recordFPS(60, 16)
      const summary = getPerfSummary()
      expect(typeof summary).toBe('string')
      expect(summary).toContain('FPS')
    })

    it('无记录时应该返回基础摘要', () => {
      const summary = getPerfSummary()
      expect(summary).toContain('采样数')
      expect(summary).toContain('暂无函数调用记录')
    })
  })

  describe('getLogEntries', () => {
    it('应该返回日志条目', () => {
      perfLogger.log('render', 'test message')
      const entries = perfLogger.getLogEntries()
      expect(entries.length).toBe(1)
      expect(entries[0].type).toBe('render')
      expect(entries[0].message).toBe('test message')
    })
  })

  describe('getMemoryInfo', () => {
    it('应该返回内存信息或 null', () => {
      const info = perfLogger.getMemoryInfo()
      expect(info === null || typeof info === 'object').toBe(true)
    })
  })
})