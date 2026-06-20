import { useState, useEffect, useRef, memo } from 'react'
import { getCurrentFPS, startFPSMonitoring, stopFPSMonitoring } from '../utils/animationEngine'
import { perfLogger } from '../utils/performanceLogger'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface MemoryInfo {
  used: number
  total: number
  limit: number
}

function getMemoryInfo(): MemoryInfo | null {
  return perfLogger.getMemoryInfo()
}

function getFPSColor(fps: number): string {
  if (fps >= 50) return 'text-accent-emerald'
  if (fps >= 30) return 'text-accent-amber'
  return 'text-accent-rose'
}

function getFPSBg(fps: number): string {
  if (fps >= 50) return 'bg-accent-emerald'
  if (fps >= 30) return 'bg-accent-amber'
  return 'bg-accent-rose'
}

function PerformanceMonitor() {
  const { t } = useGlobalSettings()
  const [fps, setFps] = useState<number>(60)
  const [memory, setMemory] = useState<MemoryInfo | null>(null)
  const [expanded, setExpanded] = useState<boolean>(false)
  const frameRef = useRef<number | null>(null)
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setVisible(v => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!visible) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      stopFPSMonitoring()
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
      frameRef.current = null
    }
  }, [visible])

  if (!visible) {
    return null
  }

  return (
    <div className="fixed top-2 left-2 z-40">
      <button
        onClick={() => setExpanded(!expanded)}
        onContextMenu={(e) => { e.preventDefault(); setVisible(false) }}
        aria-label={t('performanceMonitor.toggle')}
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
                  <span className="text-white/50">{t('performanceMonitor.jsHeap')}</span>
                  <span className="text-accent-blue">{memory.used} MB</span>
                </div>
                <div className="w-full bg-white/10 h-1">
                  <div
                    className="h-1 bg-accent-blue transition-all duration-300"
                    style={{ width: `${Math.min(100, (memory.used / memory.limit) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">{t('performanceMonitor.total')}</span>
                  <span className="text-white/70">{memory.total} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">{t('performanceMonitor.limit')}</span>
                  <span className="text-white/70">{memory.limit} MB</span>
                </div>
              </>
            )}

            <div className="pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/50">{t('performanceMonitor.status')}</span>
                <span className={fps >= 50 ? 'text-accent-emerald' : fps >= 30 ? 'text-accent-amber' : 'text-accent-rose'}>
                  {fps >= 50 ? t('performanceMonitor.smooth') : fps >= 30 ? t('performanceMonitor.fair') : t('performanceMonitor.low')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(PerformanceMonitor)
