import { useState, useEffect, useRef, memo } from 'react'
import { getCurrentFPS, startFPSMonitoring, stopFPSMonitoring } from '../utils/animationEngine'
import { perfLogger } from '../utils/performanceLogger'

interface MemoryInfo {
  used: number
  total: number
  limit: number
}

function getMemoryInfo(): MemoryInfo | null {
  return perfLogger.getMemoryInfo()
}

function getFPSColor(fps: number): string {
  if (fps >= 50) return 'text-emerald-400'
  if (fps >= 30) return 'text-amber-400'
  return 'text-red-400'
}

function getFPSBg(fps: number): string {
  if (fps >= 50) return 'bg-emerald-400'
  if (fps >= 30) return 'bg-amber-400'
  return 'bg-red-400'
}

export default memo(function PerformanceMonitor() {
  const [fps, setFps] = useState<number>(60)
  const [memory, setMemory] = useState<MemoryInfo | null>(null)
  const [expanded, setExpanded] = useState<boolean>(false)
  const frameRef = useRef<number | null>(null)
  const [visible, setVisible] = useState<boolean>(() => import.meta.env.DEV)

  useEffect(() => {
    if (!visible) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      return
    }

    startFPSMonitoring()

    const update = () => {
      setFps(getCurrentFPS())
      setMemory(getMemoryInfo())
      frameRef.current = requestAnimationFrame(update)
    }
    frameRef.current = requestAnimationFrame(update)

    return () => {
      stopFPSMonitoring()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [visible])

  if (!visible) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setVisible(true)}
          aria-label="Show performance monitor"
          className="px-2 py-1 bg-ink/80 dark:bg-dark-ink/80 backdrop-blur-sm border border-white/10 text-xs font-mono text-white/50 hover:text-white/80 transition-colors"
        >
          FPS
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        onContextMenu={(e) => { e.preventDefault(); setVisible(false) }}
        aria-label="Toggle performance details"
        aria-expanded={expanded}
        className="flex items-center gap-1.5 px-2 py-1 bg-ink/80 dark:bg-dark-ink/80 backdrop-blur-sm border border-white/10 text-xs font-mono hover:bg-ink/90 dark:hover:bg-dark-ink/90 transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getFPSBg(fps)}`} />
        <span className={getFPSColor(fps)}>{fps} FPS</span>
        {memory && (
          <span className="text-white/50 ml-1">{memory.used}MB</span>
        )}
      </button>

      {expanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-ink/90 dark:bg-dark-ink/90 backdrop-blur-sm border border-white/10 p-3 min-w-[200px]">
          <div className="text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50">FPS</span>
              <span className={getFPSColor(fps)}>{fps}</span>
            </div>
            <div className="w-full bg-white/10 h-1">
              <div
                className={`h-1 transition-all duration-300 ${getFPSBg(fps)}`}
                style={{ width: `${Math.min(100, (fps / 60) * 100)}%` }}
              />
            </div>

            {memory && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">JS Heap</span>
                  <span className="text-blue-400">{memory.used} MB</span>
                </div>
                <div className="w-full bg-white/10 h-1">
                  <div
                    className="h-1 bg-blue-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (memory.used / memory.limit) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Total</span>
                  <span className="text-white/70">{memory.total} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Limit</span>
                  <span className="text-white/70">{memory.limit} MB</span>
                </div>
              </>
            )}

            <div className="pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Status</span>
                <span className={fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400'}>
                  {fps >= 50 ? 'Smooth' : fps >= 30 ? 'Fair' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
