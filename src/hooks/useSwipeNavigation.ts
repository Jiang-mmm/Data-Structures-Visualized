import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { STRUCTURE_KEYS } from '../components/Sidebar'

const SWIPE_THRESHOLD = 80 // 最小水平滑动距离（px）
const VERTICAL_RATIO = 1.5 // 水平位移必须明显大于垂直位移，避免误触发滚动

/**
 * 移动端左右滑动切换数据结构页面。
 *
 * 行为：
 * - 向左滑（手指从右往左）→ 下一页
 * - 向右滑（手指从左往右）→ 上一页
 *
 * 保护：
 * - 仅在 touch 事件触发，桌面端无影响
 * - 水平位移需 > SWIPE_THRESHOLD 且明显大于垂直位移
 * - 忽略交互元素（input/textarea/button/select/svg/canvas/contenteditable）上的滑动
 * - 起点在 Sidebar 抽屉内不触发（避免与 Sidebar 关闭手势冲突）
 */
export function useSwipeNavigation(): void {
  const location = useLocation()
  const navigate = useNavigate()
  const startRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        startRef.current = null
        return
      }
      startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const start = startRef.current
      startRef.current = null
      if (!start || e.changedTouches.length !== 1) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - start.x
      const deltaY = endY - start.y

      // 水平位移不足，或垂直位移过大（用户在滚动），忽略
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
      if (Math.abs(deltaY) > Math.abs(deltaX) * VERTICAL_RATIO) return

      // 忽略交互元素上的滑动
      const target = e.target
      if (target instanceof Element && shouldIgnoreTarget(target)) return

      const currentIndex = STRUCTURE_KEYS.findIndex(item => item.path === location.pathname)
      if (currentIndex === -1) return

      let nextIndex: number
      if (deltaX < 0) {
        // 向左滑 → 下一页
        nextIndex = currentIndex + 1
      } else {
        // 向右滑 → 上一页
        nextIndex = currentIndex - 1
      }

      if (nextIndex < 0 || nextIndex >= STRUCTURE_KEYS.length) return
      navigate(STRUCTURE_KEYS[nextIndex].path)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [location.pathname, navigate])
}

function shouldIgnoreTarget(target: Element): boolean {
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') {
    return true
  }
  if (target instanceof HTMLElement && target.isContentEditable) return true
  // SVG/Canvas 通常是可视化区域，避免与 pinch-zoom/drag 冲突
  if (tag === 'SVG' || tag === 'CANVAS' || target.closest('svg, canvas')) {
    return true
  }
  // Sidebar 抽屉内的滑动交给 Sidebar 自身处理
  if (target.closest('[data-sidebar]')) return true
  return false
}
