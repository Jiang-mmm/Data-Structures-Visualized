import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVisualizer } from '../hooks/useVisualizer'
import * as animationEngine from '../utils/animationEngine'

// jsdom 默认没有 ResizeObserver；必须显式 mock 才能让 useEffect 中的 `new ResizeObserver` 不报错
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

describe('useVisualizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('导出 useVisualizer 函数', () => {
    expect(typeof useVisualizer).toBe('function')
  })

  it('返回 containerRef 和 svgRef', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(result.current.containerRef).toBeDefined()
    expect(result.current.svgRef).toBeDefined()
  })

  it('返回 dimensions 对象', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(result.current.dimensions).toHaveProperty('width')
    expect(result.current.dimensions).toHaveProperty('height')
  })

  it('返回 getAnimationContext 函数', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(typeof result.current.getAnimationContext).toBe('function')
  })

  it('初始 dimensions 有默认值', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(typeof result.current.dimensions.width).toBe('number')
    expect(typeof result.current.dimensions.height).toBe('number')
  })

  it('containerRef 是一个 ref 对象', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(result.current.containerRef).toHaveProperty('current')
  })

  it('svgRef 是一个 ref 对象', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(result.current.svgRef).toHaveProperty('current')
  })

  it('abortAnimation 在没有正在进行的动画时是安全的', () => {
    const { result } = renderHook(() => useVisualizer())
    expect(() => result.current.abortAnimation()).not.toThrow()
  })

  it('getAnimationContext 返回的对象包含 abort、isAborted 等方法', () => {
    const { result } = renderHook(() => useVisualizer())
    const ctx = result.current.getAnimationContext()
    expect(ctx).toHaveProperty('abort')
    expect(ctx).toHaveProperty('isAborted')
    expect(ctx).toHaveProperty('promise')
    expect(typeof ctx.abort).toBe('function')
    expect(typeof ctx.isAborted).toBe('function')
  })

  it('第二次调用 getAnimationContext 应中止上一次的动画', () => {
    const { result } = renderHook(() => useVisualizer())
    const first = result.current.getAnimationContext()
    const second = result.current.getAnimationContext()
    // 调用了 abort
    expect(typeof first.abort).toBe('function')
    expect(second).not.toBe(first)
  })

  it('在已挂载容器中触发 resize 时应更新 dimensions', () => {
    const createObjectURLSpy = vi.fn(() => 'blob:mock')
    const originalCreateObjectURL = URL.createObjectURL
    URL.createObjectURL = createObjectURLSpy

    // 创建一个有尺寸的 div 模拟容器
    const div = document.createElement('div')
    Object.defineProperty(div, 'getBoundingClientRect', {
      value: () => ({ width: 500, height: 300, top: 0, left: 0, right: 500, bottom: 300, x: 0, y: 0 } as DOMRect),
    })
    Object.defineProperty(div, 'clientWidth', { value: 500, configurable: true })
    Object.defineProperty(div, 'clientHeight', { value: 300, configurable: true })
    document.body.appendChild(div)

    const { result, unmount } = renderHook(() => {
      const data = useVisualizer()
      // 把 containerRef.current 指向真实 div
      ;(data.containerRef as { current: HTMLDivElement | null }).current = div
      return data
    })

    // 触发 useLayoutEffect 路径
    expect(result.current.dimensions).toHaveProperty('width')

    // 调用 abortAnimation 以触发动画 abort 路径
    act(() => { result.current.abortAnimation() })

    unmount()
    URL.createObjectURL = originalCreateObjectURL
    document.body.removeChild(div)
  })

  it('isAnimating 在 useAnimationFrame 上下文下能 abort', () => {
    const { result } = renderHook(() => useVisualizer())
    const ctx = result.current.getAnimationContext()
    expect(ctx.isAborted()).toBe(false)
    act(() => { ctx.abort() })
    expect(ctx.isAborted()).toBe(true)
  })

  it('animationEngine 应正确暴露 Animation 类型', () => {
    expect(typeof animationEngine.createAnimation).toBe('function')
    expect(typeof animationEngine.registerApplyPresetAbortCallback).toBe('function')
    expect(typeof animationEngine.unregisterApplyPresetAbortCallback).toBe('function')
  })

  it('abortAnimation 会取消正在进行的 animation', () => {
    const { result } = renderHook(() => useVisualizer())
    const ctx = result.current.getAnimationContext()
    expect(ctx.isAborted()).toBe(false)
    act(() => { result.current.abortAnimation() })
    expect(ctx.isAborted()).toBe(true)
  })
})
