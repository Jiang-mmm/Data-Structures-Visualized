import { useEffect, useState, useCallback, useRef, useMemo, memo, ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useColorTheme } from '../hooks/useColorTheme'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { measureRender } from '../utils/animationEngine'

interface VisualizerProps {
  data: unknown
  renderFn: (svg: SVGSVGElement, data: unknown, dimensions: { width: number; height: number; isDark?: boolean }) => void
  svgRef: React.RefObject<SVGSVGElement | null>
  dimensions: { width: number; height: number }
  containerRef: React.RefObject<HTMLDivElement | null>
  className?: string
  ariaLabel?: string
  renderOptions?: Record<string, unknown>
  overlay?: ReactNode
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1
const GRID_KEY = 'ds-visualizer-show-grid'
const ZOOM_KEY = 'ds-visualizer-zoom'

function loadBool(key: string, fallback: boolean): boolean {
  try { const v = localStorage.getItem(key); return v !== null ? v === 'true' : fallback } catch { return fallback }
}
function loadNumber(key: string, fallback: number): number {
  try { const v = localStorage.getItem(key); return v !== null ? Number(v) : fallback } catch { return fallback }
}

function Visualizer({ data, renderFn, svgRef, dimensions, containerRef, className = '', ariaLabel, renderOptions, overlay }: VisualizerProps) {
  const { resolved: themeResolved } = useTheme()
  const { theme: colorTheme } = useColorTheme()
  const { t } = useGlobalSettings()
  const isDark = themeResolved === 'dark'
  const [zoom, setZoom] = useState(() => loadNumber(ZOOM_KEY, 1))
  const [showGrid, setShowGrid] = useState(() => loadBool(GRID_KEY, false))
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const pinchRef = useRef({ initialDistance: 0, initialZoom: 1 })
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 })

  // 缓存 dimensions 引用，避免 ResizeObserver 触发的尺寸变化作为 useEffect 依赖
  // 导致动画进行中 Visualizer 重渲染（selectAll('*').interrupt()）打断 D3 过渡
  const dimensionsRef = useRef(dimensions)
  dimensionsRef.current = dimensions

  const handleZoomIn = useCallback(() => {
    setZoom(z => {
      const next = Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(1))
      try { localStorage.setItem(ZOOM_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => {
      const next = Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(1))
      try { localStorage.setItem(ZOOM_KEY, String(next)) } catch {}
      return next
    })
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
      try { localStorage.setItem(ZOOM_KEY, String(newZoom)) } catch {}
    }
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setZoom(z => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(1)))
        try { localStorage.setItem(ZOOM_KEY, String(next)) } catch {}
        return next
      })
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y }
    e.currentTarget.classList.add('cursor-grabbing')
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPan({ x: dragRef.current.startPanX + dx, y: dragRef.current.startPanY + dy })
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    dragRef.current.dragging = false
    e.currentTarget.classList.remove('cursor-grabbing')
  }, [])

  const handleResetPan = useCallback(() => {
    setPan({ x: 0, y: 0 })
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
        const d = data as Record<string, unknown>
        const dataSize = Array.isArray(data) ? data.length : (d?.nodes as unknown[])?.length || (d?.length as number) || 1
        // 使用 ref 读取最新 dimensions，避免将其作为依赖项触发重渲染
        const dims = dimensionsRef.current
        const label = `${renderFn.name || 'Visualizer'}:render (${dataSize} items, ${dims.width}x${dims.height})`
        measureRender(label, () => {
          renderFn(svgRef.current!, data, { ...dims, isDark: isDark as boolean | undefined, ...renderOptions })
        })
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Visualization render error:', error)
        }
      }
    }
  }, [data, renderFn, svgRef, isDark, colorTheme, renderOptions])

  const viewBox = useMemo(() => {
    const w = Math.round(dimensions.width / zoom)
    const h = Math.round(dimensions.height / zoom)
    const x = Math.round((dimensions.width - w) / 2) - pan.x / zoom
    const y = Math.round((dimensions.height - h) / 2) - pan.y / zoom
    return `${x} ${y} ${w} ${h}`
  }, [dimensions.width, dimensions.height, zoom, pan.x, pan.y])

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`
        flex-1 relative min-h-[200px] sm:min-h-[250px] lg:min-h-[350px] overflow-hidden bg-clip-padding
        border-b-2 border-ink dark:border-dark-border cursor-grab select-none
        ${className}
        ${showGrid ? 'dot-grid dark:dot-grid' : ''}
      `}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel || t('visualizer.empty')}
      />

      {overlay}

      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate/90 backdrop-blur-sm border-2 border-ink/20 dark:border-dark-border/40 px-2 py-1 shadow-soft z-10 rounded-sm"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowGrid(g => { const next = !g; try { localStorage.setItem(GRID_KEY, String(next)) } catch {}; return next })}
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
        {(pan.x !== 0 || pan.y !== 0) && (
          <button
            onClick={handleResetPan}
            aria-label={t('visualizer.center') || 'Center'}
            className="w-9 h-9 sm:w-7 sm:h-7 flex items-center justify-center transition-colors text-xs font-bold border-2 bg-ink/5 dark:bg-dark-ink/5 border-ink/15 dark:border-dark-border/30 text-ink-light/50 dark:text-dark-ink-light/50 hover:border-ink/30 dark:hover:border-dark-border/50"
          >
            ⌖
          </button>
        )}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= ZOOM_MIN}
          aria-label={t('visualizer.zoomOut') || 'Zoom out'}
          className="w-7 h-7 flex items-center justify-center text-ink-light dark:text-dark-ink-light hover:bg-ink/10 dark:hover:bg-dark-ink/10 disabled:opacity-30 transition-colors text-sm font-bold touch-manipulation"
        >
          −
        </button>
        <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light min-w-[40px] text-center select-none" aria-live="polite">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          disabled={zoom >= ZOOM_MAX}
          aria-label={t('visualizer.zoomIn') || 'Zoom in'}
          className="w-7 h-7 flex items-center justify-center text-ink-light dark:text-dark-ink-light hover:bg-ink/10 dark:hover:bg-dark-ink/10 disabled:opacity-30 transition-colors text-sm font-bold touch-manipulation"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default memo(Visualizer)
