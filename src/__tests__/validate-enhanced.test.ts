import { describe, it, expect } from 'vitest'
import { sanitizeInput, validateNumericInput, getValidationError, validateImportData } from '../utils/validate'

describe('sanitizeInput 增强测试', () => {
  it('应该过滤反引号', () => {
    expect(sanitizeInput('hello`world')).toBe('helloworld')
  })

  it('应该过滤 & 符号', () => {
    expect(sanitizeInput('a&b')).toBe('ab')
  })

  it('应该过滤分号', () => {
    expect(sanitizeInput('a;b')).toBe('ab')
  })

  it('应该过滤反斜杠', () => {
    expect(sanitizeInput('a\\b')).toBe('ab')
  })

  it('应该保留正常字符', () => {
    expect(sanitizeInput('hello123')).toBe('hello123')
  })

  it('应该处理数字输入', () => {
    expect(sanitizeInput(123)).toBe('123')
  })

  it('应该限制长度', () => {
    expect(sanitizeInput('abcdefghij', 5)).toBe('abcde')
  })
})

describe('validateNumericInput', () => {
  it('应该验证有效数字', () => {
    expect(validateNumericInput(50)).toEqual({ valid: true, value: 50 })
  })

  it('应该拒绝 NaN', () => {
    expect(validateNumericInput(NaN)).toEqual({ valid: false, value: 0 })
  })

  it('应该拒绝超出范围', () => {
    expect(validateNumericInput(100)).toEqual({ valid: false, value: 100 })
  })

  it('应该拒绝负数', () => {
    expect(validateNumericInput(-1)).toEqual({ valid: false, value: -1 })
  })
})

describe('getValidationError', () => {
  it('应该返回 null 对于有效输入', () => {
    expect(getValidationError(50)).toBeNull()
  })

  it('应该返回错误信息对于 NaN', () => {
    expect(getValidationError(NaN)).toContain('有效数字')
  })

  it('应该返回错误信息对于超出范围', () => {
    expect(getValidationError(100)).toContain('1~99')
  })
})

describe('validateImportData', () => {
  it('应该验证有效数组', () => {
    expect(validateImportData([1, 2, 3], 'array')).toEqual({ valid: true, data: [1, 2, 3] })
  })

  it('应该拒绝空数据', () => {
    expect(validateImportData(null, 'array').valid).toBe(false)
  })

  it('应该拒绝非数组', () => {
    expect(validateImportData('hello', 'array').valid).toBe(false)
  })

  it('应该拒绝空数组', () => {
    expect(validateImportData([], 'array').valid).toBe(false)
  })

  it('应该拒绝超大数组', () => {
    const big = Array(201).fill(1)
    expect(validateImportData(big, 'array').valid).toBe(false)
  })

  it('应该拒绝非数字元素', () => {
    expect(validateImportData([1, 'a', 3], 'array').valid).toBe(false)
  })

  it('应该拒绝浮点数', () => {
    expect(validateImportData([1.5, 2, 3], 'array').valid).toBe(false)
  })

  it('应该拒绝超出范围的值', () => {
    expect(validateImportData([1, 1000, 3], 'array').valid).toBe(false)
  })
})