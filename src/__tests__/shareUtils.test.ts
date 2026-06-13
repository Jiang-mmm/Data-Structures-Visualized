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
})