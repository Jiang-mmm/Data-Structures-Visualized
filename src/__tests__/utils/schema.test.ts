import { describe, it, expect } from 'vitest'
import { validateStoredData, MAX_STORAGE_DEPTH } from '../../utils/schema'

describe('validateStoredData', () => {
  it('应接受非空数组', () => {
    expect(validateStoredData([1, 2, 3]).valid).toBe(true)
  })

  it('应接受非空对象', () => {
    expect(validateStoredData({ a: 1 }).valid).toBe(true)
  })

  it('应拒绝顶层 null', () => {
    expect(validateStoredData(null).valid).toBe(false)
  })

  it('应拒绝顶层 undefined', () => {
    expect(validateStoredData(undefined).valid).toBe(false)
  })

  it('应拒绝空数组', () => {
    expect(validateStoredData([]).valid).toBe(false)
  })

  it('应拒绝空对象', () => {
    expect(validateStoredData({}).valid).toBe(false)
  })

  it('应拒绝非有限数字', () => {
    expect(validateStoredData([Infinity]).valid).toBe(false)
    expect(validateStoredData([NaN]).valid).toBe(false)
  })

  it('应接受嵌套 null', () => {
    expect(validateStoredData({ a: null }).valid).toBe(true)
    expect(validateStoredData([null]).valid).toBe(true)
  })

  it('应拒绝嵌套 undefined', () => {
    expect(validateStoredData({ a: undefined }).valid).toBe(false)
  })

  it('应拒绝函数、Date、Symbol 等非 JSON 类型', () => {
    expect(validateStoredData({ fn: () => {} }).valid).toBe(false)
    expect(validateStoredData({ date: new Date() }).valid).toBe(false)
    expect(validateStoredData({ sym: Symbol('x') }).valid).toBe(false)
  })

  it(`应接受深度为 ${MAX_STORAGE_DEPTH} 的嵌套对象`, () => {
    let data: Record<string, unknown> = { value: 1 }
    for (let i = 0; i < MAX_STORAGE_DEPTH - 1; i++) {
      data = { nested: data }
    }
    expect(validateStoredData(data).valid).toBe(true)
  })

  it(`应拒绝深度超过 ${MAX_STORAGE_DEPTH} 的嵌套对象`, () => {
    let data: Record<string, unknown> = { value: 1 }
    for (let i = 0; i < MAX_STORAGE_DEPTH; i++) {
      data = { nested: data }
    }
    expect(validateStoredData(data).valid).toBe(false)
  })

  it('应拒绝深度过大的嵌套数组', () => {
    const data: unknown[] = []
    let current: unknown[] = data
    for (let i = 0; i < MAX_STORAGE_DEPTH + 1; i++) {
      const next: unknown[] = []
      current.push(next)
      current = next
    }
    expect(validateStoredData(data).valid).toBe(false)
  })

  it('应返回具体的错误信息', () => {
    expect(validateStoredData({}).error).toBe('empty object')
    expect(validateStoredData([]).error).toBe('empty array')
    expect(validateStoredData(null).error).toBe('top-level null')
    expect(validateStoredData(undefined).error).toBe('undefined')
    expect(validateStoredData([Infinity]).error).toBe('non-finite number')
  })
})
