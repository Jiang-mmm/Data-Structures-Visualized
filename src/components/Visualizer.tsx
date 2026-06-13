import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { startFPSMonitoring, stopFPSMonitoring, measureRender } from '../utils/animationEngine'

interface VisualizerProps {
  data: any
  renderFn: (svg: SVGSVGElement, data: any, dimensions: { width: number; height: number; isDark?: boolean }) => void
  svgRef: React.RefObject<SVGSVGElement>
  dimensions: { width: number; height: number }
  containerRef: React.RefObject<HTMLDivElement>
  className?: string
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1

export default function Visualizer({ data, renderFn, svgRef, dimensions, containerRef, className = '' }: VisualizerProps) {
  const { resolved: themeResolved } = useTheme()
  const { t } = useGlobalSettings()
  const isDark = themeResolved === 'dark'
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const pinchRef = useRef({ initialDistance: 0, initialZoom: 1 })

  useEffect(() => {
    startFPSMonitoring()
    return () => stopFPSMonitoring()
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(1)))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(1)))
  }, [])

  const getTouchDistance = (touches: TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      pinchRef.current.initialDistance = getTouchDistance(e.touches)
      pinchRef.current.initialZoom = zoom
    }
  }, [zoom])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      const scale = currentDistance / pinchRef.current.initialDistance
      const newZoom = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, +(pinchRef.current.initialZoom * scale).toFixed(1))
      )
      setZoom(newZoom)
    }
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(z => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(1)))
      })
    }
  }, [])

  useEffect(() => {
    const el = containerRef?.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: false })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
    }
  }, [containerRef, handleWheel, handleTouchStart, handleTouchMove])

  useEffect(() => {
    if (svgRef?.current && renderFn && data) {
      try {
        const dataSize = Array.isArray(data) ? data.length : data?.nodes?.length || data?.length || 1
        const label = `${renderFn.name || 'Visualizer'}:render (${dataSize} items, ${dimensions.width}x${dimensions.height})`
        measureRender(label, () => {
          renderFn(svgRef.current!, data, { ...dimensions, isDark: isDark as boolean | undefined })
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Visualization render error:', error)
        }
      }
    }
  }, [data, renderFn, svgRef, dimensions, isDark])

  const viewBox = useMemo(() => {
    const w = Math.round(dimensions.width / zoom)
    const h = Math.round(dimensions.height / zoom)
    const x = Math.round((dimensions.width - w) / 2)
    const y = Math.round((dimensions.height - h) / 2)
    return `${x} ${y} ${w} ${h}`
  }, [dimensions.width, dimensions.height, zoom])

  return (
    <div
      ref={containerRef}
      className={`
        flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] overflow-hidden
        border-b-2 border-ink dark:border-dark-border
        ${className}
        ${showGrid ? 'dot-grid dark:dot-grid' : ''}
      `}
      style={{ backgroundClip: 'padding-box' }}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      />

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate/90 backdrop-blur-sm border-2 border-ink/30 dark:border-dark-border/50 px-2 py-1 shadow-[2px_2px_0px_rgba(26,26,46,0.15)] dark:shadow-[2px_2px_0px_rgba(51,65,85,0.3)] z-10">
        <button
          onClick={() => setShowGrid(g => !g)}
          className={`w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center transition-colors text-xs font-bold border-2
            ${showGrid
              ? 'bg-accent-blue/15 border-accent-blue/50 text-accent-blue'
              : 'bg-ink/5 dark:bg-dark-ink/5 border-ink/15 dark:border-dark-border/30 text-ink-light/50 dark:text-dark-ink-light/50 hover:border-ink/30 dark:hover:border-dark-border/50'
            }`}
          title={showGrid ? t('visualizer.hideGrid') : t('visualizer.showGrid')}
          aria-label={showGrid ? t('visualizer.hideGrid') : t('visualizer.showGrid')}
        >
          #
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_MIN}
          aria-label="Zoom out"
          className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center text-ink-light dark:text-dark-ink-light hover:bg-ink/10 dark:hover:bg-dark-ink/10 disabled:opacity-30 transition-colors text-sm font-bold touch-manipulation"
        >
          −
        </button>
        <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light min-w-[40px] text-center select-none" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Zoom in"
          className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center text-ink-light dark:text-dark-ink-light hover:bg-ink/10 dark:hover:bg-dark-ink/10 disabled:opacity-30 transition-colors text-sm font-bold touch-manipulation"
        >
          +
        </button>
      </div>
    </div>
  )
}
