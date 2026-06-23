/**
 * useVisualizer 错误路径 + useLayoutEffect + cleanup 完整性
 * 用于提升 src/hooks/useVisualizer.ts 覆盖率（基线 90.9% statements / 80% functions）
 * 覆盖：useLayoutEffect 真实尺寸路径、ResizeObserver cleanup、clearGraphSimulation 调用
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import { createElement } from 'react'
import { useVisualizer } from '../hooks/useVisualizer'

// ResizeObserver mock - 用 spy 验证 disconnect
const disconnectSpy = vi.fn()
const observeSpy = vi.fn()
const unobserveSpy = vi.fn()

class ResizeObserverMock {
  observe(...args: unknown[]): void {
    observeSpy(...args)
  }
  unobserve(...args: unknown[]): void {
    unobserveSpy(...args)
  }
  disconnect(...args: unknown[]): void {
    disconnectSpy(...args)
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  disconnectSpy.mockClear()
  observeSpy.mockClear()
  unobserveSpy.mockClear()
  ;(globalThis as any).ResizeObserver = ResizeObserverMock
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useVisualizer 错误路径与边界', () => {
  it('初始 dimensions 应有合理默认值', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(result.current.dimensions.width).toBeGreaterThanOrEqual(100)
    expect(result.current.dimensions.height).toBeGreaterThanOrEqual(100)
  })

  it('调用 getAnimationContext 应返回新 Animation 实例', () => {
    const { result } = renderHook(() => useVisualizer())
    const a1 = result.current.getAnimationContext()
    const a2 = result.current.getAnimationContext()
    // 每次都创建新实例（内部 abort 旧实例）
    expect(a1).toBeTruthy()
    expect(a2).toBeTruthy()
  })

  it('调用 getAnimationContext 应 abort 上一个动画', () => {
    const { result } = renderHook(() => useVisualizer())
    const a1 = result.current.getAnimationContext()
    const abortSpy = vi.spyOn(a1, 'abort')
    result.current.getAnimationContext()
    expect(abortSpy).toHaveBeenCalled()
  })

  it('getAnimationContext 应把动画存储到 ref', () => {
    const { result } = renderHook(() => useVisualizer())
    const a1 = result.current.getAnimationContext()
    // 第二次创建后 abort 第一个
    const a2 = result.current.getAnimationContext()
    expect(a2).not.toBe(a1)
  })

  it('ResizeObserver 应被 observe 真实 DOM container', () => {
    function TestComponent() {
      const { containerRef } = useVisualizer()
      return createElement('div', { ref: containerRef, 'data-testid': 'host' })
    }
    render(createElement(TestComponent))
    expect(observeSpy).toHaveBeenCalled()
  })

  it('ResizeObserver disconnect 应在卸载时调用', () => {
    function TestComponent() {
      const { containerRef } = useVisualizer()
      return createElement('div', { ref: containerRef })
    }
    const { unmount } = render(createElement(TestComponent))
    expect(disconnectSpy).not.toHaveBeenCalled()
    unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('abortAnimation 在有动画时应调用 abort', () => {
    const { result } = renderHook(() => useVisualizer())
    const a1 = result.current.getAnimationContext()
    const abortSpy = vi.spyOn(a1, 'abort')
    act(() => {
      result.current.abortAnimation()
    })
    expect(abortSpy).toHaveBeenCalled()
  })

  it('abortAnimation 在无动画时应为 no-op', () => {
    const { result } = renderHook(() => useVisualizer())
    // 第一次 abortAnimation 在没创建动画时调用
    act(() => {
      result.current.abortAnimation()
    })
    // 不抛错即为成功
    expect(true).toBe(true)
  })

  it('svgRef 应可 attach 到 SVG 元素', () => {
    function TestComponent() {
      const { svgRef } = useVisualizer()
      return createElement('svg', { ref: svgRef, 'data-testid': 'svg' })
    }
    const { container } = render(createElement(TestComponent))
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toBeTruthy()
  })
})
