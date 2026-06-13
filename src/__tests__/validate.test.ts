import { describe, it, expect } from 'vitest'
import { sanitizeInput, validateNumericInput, getValidationError } from '../utils/validate'

describe('validate', () => {
  describe('sanitizeInput', () => {
    it('应该清理危险字符', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script')
      expect(sanitizeInput('hello')).toBe('hello')
    })

    it('应该处理数字输入', () => {
      expect(sanitizeInput(42)).toBe('42')
    })
  })

  describe('validateNumericInput', () => {
    it('应该接受1-99范围内的数字', () => {
      expect(validateNumericInput(50)).toEqual({ valid: true, value: 50 })
      expect(validateNumericInput(1)).toEqual({ valid: true, value: 1 })
      expect(validateNumericInput(99)).toEqual({ valid: true, value: 99 })
    })

    it('应该拒绝范围外的数字', () => {
      expect(validateNumericInput(0)).toEqual({ valid: false, value: 0 })
      expect(validateNumericInput(100)).toEqual({ valid: false, value: 100 })
      expect(validateNumericInput(-1)).toEqual({ valid: false, value: -1 })
    })

    it('应该拒绝非数字输入', () => {
      expect(validateNumericInput('abc')).toEqual({ valid: false, value: 0 })
      expect(validateNumericInput(null as unknown as string)).toEqual({ valid: false, value: 0 })
    })
  })

  describe('getValidationError', () => {
    it('应该返回 null 表示有效输入', () => {
      expect(getValidationError(42)).toBe(null)
    })

    it('应该返回错误信息', () => {
      expect(getValidationError(0)).toBe('索引必须在 1~99 之间')
      expect(getValidationError('abc')).toBe('索引必须是有效数字')
    })
  })
})
