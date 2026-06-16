import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSharedData } from '../hooks/useSharedData'
import { encodeData } from '../utils/shareUtils'

describe('useSharedData', () => {
  const originalLocation = window.location
  let replaceStateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
  })

  afterEach(() => {
    replaceStateSpy.mockRestore()
    // Reset location search
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  function setSearch(search: string) {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search, href: `http://localhost${search}` },
      writable: true,
      configurable: true,
    })
  }

  it('应该在没有URL参数时不做任何事', () => {
    setSearch('')
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(loadData).not.toHaveBeenCalled()
  })

  it('应该在type不匹配时不做任何事', () => {
    const encoded = encodeData([1, 2, 3])!
    setSearch(`?data=${encoded}&type=stack`)
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(loadData).not.toHaveBeenCalled()
  })

  it('应该在有效数据时调用loadData', () => {
    const data = [1, 2, 3]
    const encoded = encodeData(data)!
    setSearch(`?data=${encoded}&type=array`)
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(loadData).toHaveBeenCalledWith(data)
  })

  it('应该在验证失败时不调用loadData', () => {
    const encoded = encodeData({ not: 'array' })!
    setSearch(`?data=${encoded}&type=array`)
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(loadData).not.toHaveBeenCalled()
  })

  it('应该在没有validator时直接加载数据', () => {
    const data = { foo: 'bar' }
    const encoded = encodeData(data)!
    setSearch(`?data=${encoded}&type=custom`)
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'custom', loadData }))
    expect(loadData).toHaveBeenCalledWith(data)
  })

  it('应该在无效编码时不调用loadData', () => {
    setSearch('?data=invalid-base64!!&type=array')
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(loadData).not.toHaveBeenCalled()
  })

  it('应该在加载后清理URL参数', () => {
    const data = [1, 2]
    const encoded = encodeData(data)!
    setSearch(`?data=${encoded}&type=array`)
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(replaceStateSpy).toHaveBeenCalled()
  })

  it('应该在type参数缺失时不做任何事', () => {
    const encoded = encodeData([1, 2])!
    setSearch(`?data=${encoded}`)
    const loadData = vi.fn()
    renderHook(() => useSharedData({ dataType: 'array', loadData, validator: Array.isArray }))
    expect(loadData).not.toHaveBeenCalled()
  })

  it('应该支持对象类型数据', () => {
    const data = { nodes: [{ id: 'A', label: 'A' }], links: [] }
    const encoded = encodeData(data)!
    setSearch(`?data=${encoded}&type=graph`)
    const loadData = vi.fn()
    const validator = (d: unknown) => d !== null && typeof d === 'object' && 'nodes' in (d as object)
    renderHook(() => useSharedData({ dataType: 'graph', loadData, validator }))
    expect(loadData).toHaveBeenCalledWith(data)
  })
})
