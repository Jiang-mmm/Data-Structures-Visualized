import { tStatic } from '../i18n/useI18n'

/**
 * @internal 仅用于测试验证，生产代码未直接调用
 */
export function sanitizeInput(value: string | number, maxLength: number = 100): string {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  const str = String(value).trim()
  if (str.length > maxLength) return str.slice(0, maxLength)
  return str.replace(/[<>"'`&;\\]/g, '')
}

interface NumericValidationResult {
  valid: boolean
  value: number
}

export function validateNumericInput(value: string | number, min: number = 1, max: number = 99): NumericValidationResult {
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, value: 0 }
  }
  if (num < min || num > max) {
    return { valid: false, value: num }
  }
  return { valid: true, value: num }
}

export function getValidationError(value: string | number, min: number = 1, max: number = 99): string | null {
  const num = Number(value)
  if (isNaN(num) || !isFinite(num)) return tStatic('errors.invalidIndex')
  if (num < min || num > max) return tStatic('errors.indexOutOfRange').replace('{range}', `${min}~${max}`)
  return null
}

export interface ImportValidationResult {
  valid: boolean
  data?: number[]
  error?: string
}

export function validateImportData(data: unknown, maxSize: number = 200, minValue: number = -999, maxValue: number = 999): ImportValidationResult {
  if (!data) {
    return { valid: false, error: tStatic('errors.importFailed') }
  }

  if (!Array.isArray(data)) {
    return { valid: false, error: tStatic('errors.importFailed') }
  }

  if (data.length === 0) {
    return { valid: false, error: tStatic('errors.importFailed') }
  }

  if (data.length > maxSize) {
    return { valid: false, error: tStatic('errors.importFailed') }
  }

  const sanitized: number[] = []
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (typeof item !== 'number' || isNaN(item) || !isFinite(item)) {
      return { valid: false, error: tStatic('errors.importFailed') }
    }
    if (!Number.isInteger(item)) {
      return { valid: false, error: tStatic('errors.importFailed') }
    }
    if (item < minValue || item > maxValue) {
      return { valid: false, error: tStatic('errors.importFailed') }
    }
    sanitized.push(item)
  }

  return { valid: true, data: sanitized }
}
