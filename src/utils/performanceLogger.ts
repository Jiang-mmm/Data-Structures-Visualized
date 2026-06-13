export interface FPSRecord {
  timestamp: number
  fps: number
  frameTime: number
}

export interface FuncPerfRecord {
  functionName: string
  callCount: number
  totalMs: number
  avgMs: number
  minMs: number
  maxMs: number
  lastCallMs: number
  callsPerSecond: number
  firstCallAt: number
  lastCallAt: number
}

export interface PerfLogEntry {
  timestamp: number
  type: 'fps' | 'render' | 'function' | 'memory' | 'warning'
  message: string
  data?: Record<string, any>
}

class PerformanceLogger {
  private fpsRecords: FPSRecord[] = []
  private funcRecords: Map<string, number[]> = new Map()
  private funcCallCounts: Map<string, number> = new Map()
  private funcFirstCallTime: Map<string, number> = new Map()
  private funcLastCallTime: Map<string, number> = new Map()
  private logEntries: PerfLogEntry[] = []
  private maxFPSRecords = 300
  private maxLogEntries = 2000
  private maxFuncRecords = 500

  reset() {
    this.fpsRecords = []
    this.funcRecords = new Map()
    this.funcCallCounts = new Map()
    this.funcFirstCallTime = new Map()
    this.funcLastCallTime = new Map()
    this.logEntries = []
  }

  recordFPS(fps: number, frameTime: number) {
    const record: FPSRecord = { timestamp: Date.now(), fps, frameTime }
    this.fpsRecords.push(record)
    if (this.fpsRecords.length > this.maxFPSRecords) {
      this.fpsRecords.shift()
    }
  }

  recordFunction(name: string, durationMs: number) {
    if (!this.funcRecords.has(name)) {
      this.funcRecords.set(name, [])
      this.funcCallCounts.set(name, 0)
      this.funcFirstCallTime.set(name, Date.now())
    }

    const times = this.funcRecords.get(name)!
    times.push(durationMs)
    if (times.length > this.maxFuncRecords) {
      times.shift()
    }

    this.funcCallCounts.set(name, (this.funcCallCounts.get(name) || 0) + 1)
    this.funcLastCallTime.set(name, Date.now())

    if (durationMs > 100) {
      this.log('warning', `[PERF] ${name} took ${durationMs.toFixed(2)}ms (>100ms)`, {
        functionName: name,
        durationMs,
        callCount: this.funcCallCounts.get(name),
      })
    }
  }

  log(type: PerfLogEntry['type'], message: string, data?: Record<string, any>) {
    const entry: PerfLogEntry = { timestamp: Date.now(), type, message, data }
    this.logEntries.push(entry)
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries.shift()
    }

    if (typeof window === 'undefined') return

    switch (type) {
      case 'warning':
        console.warn(message, data || '')
        break
      case 'fps':
        console.debug(message, data || '')
        break
      default:
        if (import.meta.env.DEV) {
          console.log(message, data || '')
        }
    }
  }

  getFPSStats(): {
    avgFPS: number
    minFPS: number
    maxFPS: number
    stdDevFPS: number
    avgFrameTime: number
    sampleCount: number
    records: FPSRecord[]
  } {
    if (this.fpsRecords.length === 0) {
      return { avgFPS: 0, minFPS: 0, maxFPS: 0, stdDevFPS: 0, avgFrameTime: 0, sampleCount: 0, records: [] }
    }

    const fpsValues = this.fpsRecords.map(r => r.fps)
    const frameTimes = this.fpsRecords.map(r => r.frameTime)
    const avgFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
    const minFPS = Math.min(...fpsValues)
    const maxFPS = Math.max(...fpsValues)

    const variance = fpsValues.reduce((sum, val) => sum + (val - avgFPS) ** 2, 0) / fpsValues.length
    const stdDevFPS = Math.sqrt(variance)

    return {
      avgFPS: Math.round(avgFPS * 100) / 100,
      minFPS,
      maxFPS,
      stdDevFPS: Math.round(stdDevFPS * 100) / 100,
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      sampleCount: this.fpsRecords.length,
      records: [...this.fpsRecords],
    }
  }

  getFunctionStats(): Map<string, FuncPerfRecord> {
    const stats = new Map<string, FuncPerfRecord>()

    for (const [name, times] of this.funcRecords.entries()) {
      if (times.length === 0) continue

      const totalMs = times.reduce((a, b) => a + b, 0)
      const avgMs = totalMs / times.length
      const minMs = Math.min(...times)
      const maxMs = Math.max(...times)
      const callCount = this.funcCallCounts.get(name) || 0
      const firstCallAt = this.funcFirstCallTime.get(name) || 0
      const lastCallAt = this.funcLastCallTime.get(name) || 0
      const elapsedSec = (lastCallAt - firstCallAt) / 1000
      const callsPerSecond = elapsedSec > 0 ? callCount / elapsedSec : 0

      stats.set(name, {
        functionName: name,
        callCount,
        totalMs,
        avgMs: Math.round(avgMs * 100) / 100,
        minMs: Math.round(minMs * 100) / 100,
        maxMs: Math.round(maxMs * 100) / 100,
        lastCallMs: times[times.length - 1],
        callsPerSecond: Math.round(callsPerSecond * 100) / 100,
        firstCallAt,
        lastCallAt,
      })
    }

    return stats
  }

  getMemoryInfo(): { used: number; total: number; limit: number } | null {
    if (typeof performance === 'undefined') return null
    const mem = (performance as any).memory
    if (!mem) return null
    return {
      used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
      total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
    }
  }

  getLogEntries(): PerfLogEntry[] {
    return [...this.logEntries]
  }

  getSummary(): string {
    const fps = this.getFPSStats()
    const funcs = this.getFunctionStats()
    const memory = this.getMemoryInfo()

    const lines = [
      '═══════════════════════════════════════════════════════',
      '性能监控日志摘要',
      `时间: ${new Date().toISOString()}`,
      '───────────────────────────────────────────────────────',
      '',
      '【FPS 帧率统计】',
      `  采样数:     ${fps.sampleCount}`,
      `  平均帧率:   ${fps.avgFPS} FPS`,
      `  最低帧率:   ${fps.minFPS} FPS`,
      `  最高帧率:   ${fps.maxFPS} FPS`,
      `  帧率波动:   ±${fps.stdDevFPS} FPS (标准差)`,
      `  平均帧耗时: ${fps.avgFrameTime}ms`,
      '',
    ]

    if (memory) {
      lines.push(
        '【内存使用】',
        `  JS Heap:  ${memory.used}MB / ${memory.limit}MB (${memory.total}MB total)`,
        '',
      )
    }

    lines.push('【函数性能统计】')

    if (funcs.size === 0) {
      lines.push('  (暂无函数调用记录)')
    } else {
      for (const [name, stat] of funcs.entries()) {
        lines.push(
          `  ${name}:`,
          `    调用次数: ${stat.callCount} | 平均: ${stat.avgMs}ms | 最小: ${stat.minMs}ms | 最大: ${stat.maxMs}ms`,
          `    调用频率: ${stat.callsPerSecond} 次/秒`,
        )
      }
    }

    lines.push('', '═══════════════════════════════════════════════════════')
    return lines.join('\n')
  }
}

export const perfLogger = new PerformanceLogger()

export function measurePerf<T>(functionName: string, fn: () => T): T {
  const start = performance.now()
  try {
    const result = fn()
    const elapsed = performance.now() - start
    perfLogger.recordFunction(functionName, elapsed)
    return result
  } catch (err) {
    const elapsed = performance.now() - start
    perfLogger.recordFunction(functionName, elapsed)
    throw err
  }
}

export async function measurePerfAsync<T>(functionName: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const elapsed = performance.now() - start
    perfLogger.recordFunction(functionName, elapsed)
    return result
  } catch (err) {
    const elapsed = performance.now() - start
    perfLogger.recordFunction(functionName, elapsed)
    throw err
  }
}

export function getPerfSummary(): string {
  return perfLogger.getSummary()
}

export function resetPerfLogger() {
  perfLogger.reset()
}