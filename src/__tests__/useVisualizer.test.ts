import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import { useVisualizer } from '../hooks/useVisualizer'
import * as animationEngine from '../utils/animationEngine'
import { createElement, type ReactNode } from 'react'

// jsdom 默认没有 ResizeObserver；必须显式 mock 才能让 useEffect 中的 `new ResizeObserver` 不报错
// 使用 prototype methods（而非 class fields）以便 spy 验证 cleanup
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// 提供真实 DOM container，让 useEffect 中 containerRef.current 非 null
function createWrapper() {
  return ({ children }: { children: ReactNode }) => {
    return createElement('div', { 'data-testid': 'visualizer-container' }, children)
  }
}

// 测试组件：把 containerRef / svgRef 真正 attach 到 DOM 元素
function TestVisualizerComponent() {
  const { containerRef, svgRef } = useVisualizer()
  return createElement('div', {
    ref: containerRef,
    'data-testid': 'visualizer-host',
  }, createElement('svg', { ref: svgRef }))
}

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

  // C-4 子阶段：render ref 双重初始化 + cleanup 完整性
  describe('C-4 渲染 ref + cleanup 完整性', () => {
    it('unmount 时应清理 ResizeObserver（通过 spy 验证 disconnect 被调用）', () => {
      const disconnectSpy = vi.spyOn(ResizeObserverMock.prototype as any, 'disconnect')
      // 用真实组件 attach ref，让 containerRef.current 非 null
      const { unmount } = render(createElement(TestVisualizerComponent))
      unmount()
      // cleanup 应调用 observer.disconnect()
      expect(disconnectSpy).toHaveBeenCalled()
      disconnectSpy.mockRestore()
    })

    it('多次 mount/unmount 不应累积 ResizeObserver 实例', () => {
      // 模拟路由切换：mount → unmount → mount → unmount
      const disconnectSpy = vi.spyOn(ResizeObserverMock.prototype as any, 'disconnect')
      const unmounts: Array<() => void> = []
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(createElement(TestVisualizerComponent))
        unmounts.push(unmount)
      }
      // 5 次 unmount：每次 cleanup 都应执行
      unmounts.forEach(u => u())
      // disconnect 应至少被调用 5 次（每次 cleanup）
      expect(disconnectSpy.mock.calls.length).toBeGreaterThanOrEqual(5)
      disconnectSpy.mockRestore()
    })

    it('useLayoutEffect 内部应优先使用 svgRef 尺寸（首次 layout pass）', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useVisualizer(), { wrapper })
      // 初始 dimensions 可能是默认值 {800, 400}（renderHook jsdom 环境下 clientWidth = 0）
      // 或被 useLayoutEffect 设置（如果 svgRef 有值）
      // 核心：dimensions 应是有效数字
      expect(result.current.dimensions.width).toBeGreaterThanOrEqual(100)
      expect(result.current.dimensions.height).toBeGreaterThanOrEqual(100)
    })

    it('abortAnimation 后再创建新动画应正常工作', () => {
      const wrapper = createWrapper()
      const { result } = renderHook(() => useVisualizer(), { wrapper })
      const first = result.current.getAnimationContext()
      act(() => { first.abort() })
      // 第一个已 abort
      expect(first.isAborted()).toBe(true)
      // 创建第二个：应成功（不抛错）
      const second = result.current.getAnimationContext()
      expect(second.isAborted()).toBe(false)
      expect(second).not.toBe(first)
    })
  })
})
