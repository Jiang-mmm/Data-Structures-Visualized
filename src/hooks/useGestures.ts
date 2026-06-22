import { useRef, useEffect } from 'react'

export interface GestureCallbacks {
  /** 双指缩放回调（scale 为相对变化比例） */
  onPinch?: (scale: number, centerX: number, centerY: number) => void
  /** 单指横向滑动回调（deltaX 为相对位移） */
  onSwipeHorizontal?: (deltaX: number) => void
  /** 单指纵向滑动回调（deltaY 为相对位移） */
  onSwipeVertical?: (deltaY: number) => void
  /** 长按回调 */
  onLongPress?: (x: number, y: number) => void
  /** 单击回调（touchend 时未移动超过阈值） */
  onTap?: (x: number, y: number) => void
}

export interface GestureOptions {
  /** 启用/禁用手势 */
  enabled?: boolean
  /** 单击移动阈值（像素），超过则不触发 tap */
  tapThreshold?: number
  /** 长按触发时间（毫秒） */
  longPressDelay?: number
  /** 滑动触发阈值（像素） */
  swipeThreshold?: number
}

const DEFAULT_OPTIONS: Required<GestureOptions> = {
  enabled: true,
  tapThreshold: 10,
  longPressDelay: 500,
  swipeThreshold: 30,
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  moved: boolean
  twoFingerActive: boolean
  longPressFired: boolean
  initialDistance: number
  longPressTimer: ReturnType<typeof setTimeout> | null
}

/**
 * useGestures — 移动端触摸手势支持 hook
 *
 * Supports: pinch (2-finger), horizontal/vertical swipe (1-finger),
 * long press, and tap. All internal state is stored in refs to avoid
 * stale closures and unnecessary re-renders.
 *
 * @param ref - 目标容器元素的 ref
 * @param callbacks - 手势回调集合
 * @param options - 可选配置（阈值、启用/禁用等）
 */
export function useGestures(
  ref: React.RefObject<HTMLElement | null>,
  callbacks: GestureCallbacks,
  options?: GestureOptions,
): void {
  const callbacksRef = useRef(callbacks)
  const optionsRef = useRef<Required<GestureOptions>>({ ...DEFAULT_OPTIONS, ...options })
  const stateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    moved: false,
    twoFingerActive: false,
    longPressFired: false,
    initialDistance: 0,
    longPressTimer: null,
  })

  // 更新 callbacks ref，避免 stale closure
  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  // 更新 options ref
  useEffect(() => {
    optionsRef.current = { ...DEFAULT_OPTIONS, ...options }
  }, [options])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const clearLongPressTimer = () => {
      if (stateRef.current.longPressTimer !== null) {
        clearTimeout(stateRef.current.longPressTimer)
        stateRef.current.longPressTimer = null
      }
    }

    const getTouchDistance = (touches: TouchList): number => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchStart = (e: TouchEvent) => {
      const opts = optionsRef.current
      if (!opts.enabled) return

      if (e.touches.length === 1) {
        // 单指：记录起始位置，启动长按定时器
        const touch = e.touches[0]
        stateRef.current.startX = touch.clientX
        stateRef.current.startY = touch.clientY
        stateRef.current.startTime = Date.now()
        stateRef.current.moved = false
        stateRef.current.twoFingerActive = false
        stateRef.current.longPressFired = false
        clearLongPressTimer()

        const cb = callbacksRef.current.onLongPress
        if (cb) {
          stateRef.current.longPressTimer = setTimeout(() => {
            if (!stateRef.current.moved) {
              stateRef.current.longPressFired = true
              cb(touch.clientX, touch.clientY)
            }
          }, opts.longPressDelay)
        }
      } else if (e.touches.length === 2) {
        // 双指：取消长按，记录初始距离
        clearLongPressTimer()
        stateRef.current.twoFingerActive = true
        stateRef.current.initialDistance = getTouchDistance(e.touches)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const opts = optionsRef.current
      if (!opts.enabled) return

      if (e.touches.length === 2 && stateRef.current.twoFingerActive) {
        // 双指缩放
        const cb = callbacksRef.current.onPinch
        if (cb && stateRef.current.initialDistance > 0) {
          e.preventDefault()
          const currentDistance = getTouchDistance(e.touches)
          const scale = currentDistance / stateRef.current.initialDistance
          const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
          const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
          cb(scale, centerX, centerY)
        }
      } else if (e.touches.length === 1 && !stateRef.current.twoFingerActive) {
        // 单指移动：检查是否超过 tap 阈值
        const touch = e.touches[0]
        const dx = touch.clientX - stateRef.current.startX
        const dy = touch.clientY - stateRef.current.startY
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > opts.tapThreshold) {
          stateRef.current.moved = true
          clearLongPressTimer()
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const opts = optionsRef.current
      if (!opts.enabled) return

      clearLongPressTimer()

      // 双指结束：不触发 tap/swipe 回调
      if (stateRef.current.twoFingerActive) {
        if (e.touches.length === 0) {
          stateRef.current.twoFingerActive = false
        }
        return
      }

      // 单指结束：根据移动距离判断 tap 或 swipe
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0]
        const dx = touch.clientX - stateRef.current.startX
        const dy = touch.clientY - stateRef.current.startY
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < opts.tapThreshold && !stateRef.current.longPressFired) {
          // 单击
          const cb = callbacksRef.current.onTap
          if (cb) cb(touch.clientX, touch.clientY)
        } else if (absDx >= opts.swipeThreshold && absDx > absDy) {
          // 横向滑动
          const cb = callbacksRef.current.onSwipeHorizontal
          if (cb) cb(dx)
        } else if (absDy >= opts.swipeThreshold && absDy > absDx) {
          // 纵向滑动
          const cb = callbacksRef.current.onSwipeVertical
          if (cb) cb(dy)
        }
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: false })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      clearLongPressTimer()
    }
  }, [ref])
}
