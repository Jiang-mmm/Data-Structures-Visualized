import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { createAnimation, type Animation, registerApplyPresetAbortCallback, unregisterApplyPresetAbortCallback } from '../utils/animationEngine'
import { clearGraphSimulation } from '../visualizers/graphVisualizer'
import { debounce } from '../utils/debounce'

export function useVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const animRef = useRef<Animation | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 400 })

  const updateDimensions = useCallback((): boolean => {
    const el = containerRef.current
    if (!el) return false
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const borderTop = parseFloat(cs.borderTopWidth) || 0
    const borderBottom = parseFloat(cs.borderBottomWidth) || 0
    const borderLeft = parseFloat(cs.borderLeftWidth) || 0
    const borderRight = parseFloat(cs.borderRightWidth) || 0
    const newWidth = Math.max(100, Math.floor(rect.width - borderLeft - borderRight))
    const newHeight = Math.max(100, Math.floor(rect.height - borderTop - borderBottom))
    setDimensions(prev => {
      if (prev.width === newWidth && prev.height === newHeight) return prev
      return { width: newWidth, height: newHeight }
    })
    return true
  }, [])

  // 首次渲染前计算真实尺寸，防止元素下沉
  useLayoutEffect(() => {
    const el = svgRef.current || containerRef.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    if (w >= 100 && h >= 100) {
      setDimensions({ width: Math.floor(w), height: Math.floor(h) })
    }
  }, [])

  const abortAnimation = useCallback((): void => {
    if (animRef.current) {
      animRef.current.abort()
      animRef.current = null
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    const el = containerRef.current
    if (!el) return
    const svg = svgRef.current

    registerApplyPresetAbortCallback(abortAnimation)

    const debouncedUpdate = debounce(() => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(updateDimensions)
    }, 100)

    const observer = new ResizeObserver(() => {
      debouncedUpdate()
    })

    observer.observe(el)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      debouncedUpdate.cancel()
      observer.disconnect()
      abortAnimation()
      unregisterApplyPresetAbortCallback()
      if (svg) clearGraphSimulation(svg)
    }
  }, [updateDimensions, abortAnimation, svgRef])

  const getAnimationContext = useCallback((): Animation => {
    if (animRef.current) {
      animRef.current.abort()
    }
    const anim = createAnimation()
    animRef.current = anim
    return anim
  }, [])

  return { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation }
}
