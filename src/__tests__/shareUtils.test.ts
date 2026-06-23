import { describe, it, expect } from 'vitest'
import { encodeData, decodeData } from '../utils/shareUtils'

describe('shareUtils', () => {
  it('应该编码和解码数据', () => {
    const data = [1, 2, 3, 4, 5]
    const encoded = encodeData(data)
    expect(encoded).toBeTruthy()
    
    const decoded = decodeData(encoded!)
    expect(decoded).toEqual(data)
  })

  it('应该处理对象数据', () => {
    const data = { name: 'test', value: 123 }
    const encoded = encodeData(data)
    expect(encoded).toBeTruthy()
    
    const decoded = decodeData(encoded!)
    expect(decoded).toEqual(data)
  })

  it('应该处理空数组', () => {
    const data: number[] = []
    const encoded = encodeData(data)
    expect(encoded).toBeTruthy()
    
    const decoded = decodeData(encoded!)
    expect(decoded).toEqual(data)
  })

  it('应该返回 null 对于无效编码', () => {
    const result = decodeData('invalid-base64')
    expect(result).toBeNull()
  })

  it('应该处理字符串数据', () => {
    const data = 'hello world'
    const encoded = encodeData(data)
    expect(encoded).toBeTruthy()
    
    const decoded = decodeData(encoded!)
    expect(decoded).toBe(data)
  })

  it('应该对超大数据返回 null', () => {
    // 构造一个超大数据，使其 base64 编码超过 4000 字符
    const huge = 'x'.repeat(5000)
    const data = { payload: huge }
    const encoded = encodeData(data)
    expect(encoded).toBeNull()
  })

  it('应该对循环引用返回 null', () => {
    const obj: Record<string, unknown> = { name: 'cycle' }
    obj.self = obj  // 循环引用
    const encoded = encodeData(obj)
    expect(encoded).toBeNull()
  })

  it('decodeData 遇到非法 base64 应返回 null', () => {
    // '!!!' 不是合法 base64
    const result = decodeData('!!!')
    expect(result).toBeNull()
  })

  it('decodeData 遇到非 JSON 字符串应返回 null', () => {
    // 合法 base64 但不是合法 JSON
    const notJson = btoa('this is not json')
    const result = decodeData(notJson)
    expect(result).toBeNull()
  })

  it('decodeData 应正确处理 URL 编码的 UTF-8 字符', () => {
    const data = { name: '测试中文' }
    const encoded = encodeData(data)
    const decoded = decodeData(encoded!)
    expect(decoded).toEqual(data)
  })

  it('应该处理 null 和 undefined', () => {
    expect(encodeData(null)).toBeTruthy()
    expect(encodeData(undefined)).toBeTruthy()
    expect(decodeData(encodeData(null)!)).toBeNull()
  })
})