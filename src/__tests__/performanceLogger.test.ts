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

  describe('recordFunction 详细', () => {
    it('应正确处理多个函数', () => {
      perfLogger.recordFunction('funcA', 5)
      perfLogger.recordFunction('funcB', 15)
      const stats = perfLogger.getFunctionStats()
      expect(stats.has('funcA')).toBe(true)
      expect(stats.has('funcB')).toBe(true)
      expect(stats.get('funcA')!.callCount).toBe(1)
      expect(stats.get('funcB')!.callCount).toBe(1)
    })

    it('应正确累计 callCount', () => {
      perfLogger.recordFunction('accFunc', 5)
      perfLogger.recordFunction('accFunc', 10)
      perfLogger.recordFunction('accFunc', 15)
      const stats = perfLogger.getFunctionStats()
      expect(stats.get('accFunc')!.callCount).toBe(3)
    })

    it('应记录首次/末次调用时间', () => {
      const before = Date.now()
      perfLogger.recordFunction('timeFunc', 5)
      const after = Date.now()
      const stats = perfLogger.getFunctionStats()
      const t = stats.get('timeFunc')!
      expect(t.firstCallAt).toBeGreaterThanOrEqual(before)
      expect(t.firstCallAt).toBeLessThanOrEqual(after)
      expect(t.lastCallAt).toBeGreaterThanOrEqual(t.firstCallAt)
    })

    it('应限制函数记录数（>500 shift）', () => {
      for (let i = 0; i < 510; i++) {
        perfLogger.recordFunction('bigFunc', i % 100)
      }
      const stats = perfLogger.getFunctionStats()
      // callCount 应该是 510，但 times 数组最多 500
      expect(stats.get('bigFunc')!.callCount).toBe(510)
    })

    it('当首次与末次时间相同时 callsPerSecond 应为 0', () => {
      perfLogger.recordFunction('sameTimeFunc', 5)
      const stats = perfLogger.getFunctionStats()
      // 单次调用时 firstCallAt === lastCallAt → elapsedSec = 0 → callsPerSecond = 0
      expect(stats.get('sameTimeFunc')!.callsPerSecond).toBe(0)
    })
  })

  describe('FPS stdDev', () => {
    it('应计算 FPS 标准差', () => {
      perfLogger.recordFPS(60, 16)
      perfLogger.recordFPS(40, 25)
      perfLogger.recordFPS(50, 20)
      const stats = perfLogger.getFPSStats()
      expect(stats.stdDevFPS).toBeGreaterThan(0)
    })

    it('应返回 avgFrameTime', () => {
      perfLogger.recordFPS(60, 16)
      perfLogger.recordFPS(30, 33)
      const stats = perfLogger.getFPSStats()
      expect(stats.avgFrameTime).toBe(24.5)
    })
  })

  describe('log 类型分支', () => {
    it('应记录 warning 类型日志', () => {
      perfLogger.log('warning', 'warn message', { key: 'val' })
      const entries = perfLogger.getLogEntries()
      const warn = entries.find(e => e.type === 'warning')
      expect(warn).toBeTruthy()
      expect(warn?.data).toEqual({ key: 'val' })
    })

    it('应记录 fps 类型日志', () => {
      perfLogger.log('fps', 'fps message')
      const entries = perfLogger.getLogEntries()
      const fps = entries.find(e => e.type === 'fps')
      expect(fps).toBeTruthy()
    })

    it('应记录 function 类型日志', () => {
      perfLogger.log('function', 'func message')
      const entries = perfLogger.getLogEntries()
      expect(entries.find(e => e.type === 'function')).toBeTruthy()
    })

    it('应记录 memory 类型日志', () => {
      perfLogger.log('memory', 'mem message')
      const entries = perfLogger.getLogEntries()
      expect(entries.find(e => e.type === 'memory')).toBeTruthy()
    })

    it('应限制日志条数（>2000 shift）', () => {
      for (let i = 0; i < 2010; i++) {
        perfLogger.log('function', `msg ${i}`)
      }
      const entries = perfLogger.getLogEntries()
      expect(entries.length).toBeLessThanOrEqual(2000)
    })
  })

  describe('getSummary 完整路径', () => {
    it('应包含函数调用统计', () => {
      perfLogger.recordFunction('sumFunc', 10)
      const summary = getPerfSummary()
      expect(summary).toContain('sumFunc')
      expect(summary).toContain('调用次数')
    })

    it('有 memory 时应包含 JS Heap 信息', () => {
      // 模拟 performance.memory
      const origMem = (performance as any).memory
      ;(performance as any).memory = {
        usedJSHeapSize: 1024 * 1024 * 50, // 50MB
        totalJSHeapSize: 1024 * 1024 * 100, // 100MB
        jsHeapSizeLimit: 1024 * 1024 * 1000, // 1000MB
      }
      const summary = getPerfSummary()
      expect(summary).toContain('JS Heap')
      ;(performance as any).memory = origMem
    })

    it('无 memory 时应不包含 JS Heap', () => {
      const origMem = (performance as any).memory
      delete (performance as any).memory
      const summary = getPerfSummary()
      expect(summary).not.toContain('JS Heap')
      ;(performance as any).memory = origMem
    })
  })
})