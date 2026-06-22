import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGestures } from '../../hooks/useGestures'
import type { GestureCallbacks } from '../../hooks/useGestures'

/**
 * 创建模拟 Touch 对象
 */
function createTouch(clientX: number, clientY: number, identifier: number, target: EventTarget): Touch {
  return {
    clientX,
    clientY,
    identifier,
    target,
    radiusX: 0,
    radiusY: 0,
    force: 1,
    pageX: clientX,
    pageY: clientY,
    screenX: clientX,
    screenY: clientY,
  } as Touch
}

/**
 * 创建模拟 TouchEvent
 * jsdom 不完全支持 TouchEvent 的 touches 属性，需要手动定义
 */
function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  target: EventTarget,
  touches: Array<{ clientX: number; clientY: number; identifier: number }>,
  changedTouches?: Array<{ clientX: number; clientY: number; identifier: number }>,
): TouchEvent {
  const touchObjects: Touch[] = touches.map(t => createTouch(t.clientX, t.clientY, t.identifier, target))
  const changedObjects: Touch[] = (changedTouches ?? touches).map(t => createTouch(t.clientX, t.clientY, t.identifier, target))

  let event: TouchEvent
  try {
    event = new TouchEvent(type, {
      touches: touchObjects,
      targetTouches: touchObjects,
      changedTouches: changedObjects,
      bubbles: true,
      cancelable: true,
    })
  } catch {
    // 回退：创建普通 Event 并手动定义 touches 属性
    event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent
    Object.defineProperty(event, 'touches', { value: touchObjects as unknown as TouchList, configurable: true })
    Object.defineProperty(event, 'targetTouches', { value: touchObjects as unknown as TouchList, configurable: true })
    Object.defineProperty(event, 'changedTouches', { value: changedObjects as unknown as TouchList, configurable: true })
  }
  return event
}

describe('useGestures', () => {
  let target: HTMLDivElement

  beforeEach(() => {
    vi.useFakeTimers()
    target = document.createElement('div')
    document.body.appendChild(target)
  })

  afterEach(() => {
    vi.useRealTimers()
    if (target.parentNode) {
      target.parentNode.removeChild(target)
    }
  })

  /**
   * 辅助函数：创建 ref 并渲染 hook
   */
  function setupGestures(callbacks: GestureCallbacks, options?: Parameters<typeof useGestures>[2]) {
    const ref = { current: target } as React.RefObject<HTMLElement | null>
    const { unmount, rerender } = renderHook(
      ({ cb, opts }) => useGestures(ref, cb, opts),
      { initialProps: { cb: callbacks, opts: options } },
    )
    return { unmount, rerender }
  }

  it('Test 1: onTap 在快速点击（无移动）时触发', () => {
    const onTap = vi.fn()
    setupGestures({ onTap })

    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))

    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onTap).toHaveBeenCalledWith(100, 100)
  })

  it('Test 2: onLongPress 在 longPressDelay 后触发', () => {
    const onLongPress = vi.fn()
    const onTap = vi.fn()
    setupGestures({ onLongPress, onTap })

    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))

    // 长按定时器尚未触发
    expect(onLongPress).not.toHaveBeenCalled()

    // 推进时间触发长按
    vi.advanceTimersByTime(500)
    expect(onLongPress).toHaveBeenCalledTimes(1)
    expect(onLongPress).toHaveBeenCalledWith(100, 100)

    // 长按后 touchend 不应触发 tap
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    expect(onTap).not.toHaveBeenCalled()
  })

  it('Test 3: onSwipeHorizontal 在横向滑动时触发', () => {
    const onSwipeHorizontal = vi.fn()
    const onTap = vi.fn()
    setupGestures({ onSwipeHorizontal, onTap })

    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchmove', target, [
      { clientX: 150, clientY: 105, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 150, clientY: 105, identifier: 0 },
    ]))

    expect(onSwipeHorizontal).toHaveBeenCalledTimes(1)
    expect(onSwipeHorizontal).toHaveBeenCalledWith(50)
    expect(onTap).not.toHaveBeenCalled()
  })

  it('Test 4: onSwipeVertical 在纵向滑动时触发', () => {
    const onSwipeVertical = vi.fn()
    const onTap = vi.fn()
    setupGestures({ onSwipeVertical, onTap })

    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchmove', target, [
      { clientX: 105, clientY: 150, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 105, clientY: 150, identifier: 0 },
    ]))

    expect(onSwipeVertical).toHaveBeenCalledTimes(1)
    expect(onSwipeVertical).toHaveBeenCalledWith(50)
    expect(onTap).not.toHaveBeenCalled()
  })

  it('Test 5: onPinch 在双指缩放时触发', () => {
    const onPinch = vi.fn()
    setupGestures({ onPinch })

    // 双指按下，初始距离 50
    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 150, clientY: 100, identifier: 1 },
    ]))

    // 双指移动，距离变为 100（scale = 2）
    target.dispatchEvent(createTouchEvent('touchmove', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 100, identifier: 1 },
    ]))

    expect(onPinch).toHaveBeenCalledTimes(1)
    expect(onPinch).toHaveBeenCalledWith(2, 150, 100)
  })

  it('Test 6: 移动超过 tapThreshold 时不触发 tap', () => {
    const onTap = vi.fn()
    const onSwipeHorizontal = vi.fn()
    const onSwipeVertical = vi.fn()
    // 移动 15px（超过 tapThreshold=10 但低于 swipeThreshold=30）
    setupGestures({ onTap, onSwipeHorizontal, onSwipeVertical })

    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchmove', target, [
      { clientX: 115, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 115, clientY: 100, identifier: 0 },
    ]))

    // 移动超过 tapThreshold，不触发 tap
    expect(onTap).not.toHaveBeenCalled()
    // 移动未超过 swipeThreshold，不触发 swipe
    expect(onSwipeHorizontal).not.toHaveBeenCalled()
    expect(onSwipeVertical).not.toHaveBeenCalled()
  })

  it('Test 7: 手指移动时取消长按', () => {
    const onLongPress = vi.fn()
    setupGestures({ onLongPress })

    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))

    // 移动超过 tapThreshold，应取消长按定时器
    target.dispatchEvent(createTouchEvent('touchmove', target, [
      { clientX: 120, clientY: 100, identifier: 0 },
    ]))

    // 推进时间，长按不应触发
    vi.advanceTimersByTime(500)
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('Test 8: enabled=false 时不触发任何回调', () => {
    const onTap = vi.fn()
    const onLongPress = vi.fn()
    const onSwipeHorizontal = vi.fn()
    const onSwipeVertical = vi.fn()
    const onPinch = vi.fn()
    setupGestures(
      { onTap, onLongPress, onSwipeHorizontal, onSwipeVertical, onPinch },
      { enabled: false },
    )

    // 尝试 tap
    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))

    // 尝试长按
    vi.advanceTimersByTime(500)

    // 尝试双指
    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 150, clientY: 100, identifier: 1 },
    ]))
    target.dispatchEvent(createTouchEvent('touchmove', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
      { clientX: 200, clientY: 100, identifier: 1 },
    ]))

    expect(onTap).not.toHaveBeenCalled()
    expect(onLongPress).not.toHaveBeenCalled()
    expect(onSwipeHorizontal).not.toHaveBeenCalled()
    expect(onSwipeVertical).not.toHaveBeenCalled()
    expect(onPinch).not.toHaveBeenCalled()
  })

  it('Test 9: unmount 时移除所有监听器', () => {
    const onTap = vi.fn()
    const { unmount } = setupGestures({ onTap })

    // unmount 前正常工作
    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    expect(onTap).toHaveBeenCalledTimes(1)

    unmount()

    // unmount 后事件不再触发回调
    onTap.mockClear()
    target.dispatchEvent(createTouchEvent('touchstart', target, [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    target.dispatchEvent(createTouchEvent('touchend', target, [], [
      { clientX: 100, clientY: 100, identifier: 0 },
    ]))
    expect(onTap).not.toHaveBeenCalled()
  })
})
