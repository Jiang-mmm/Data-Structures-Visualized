import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVisualizer } from '../hooks/useVisualizer'

describe('useVisualizer', () => {
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
})
