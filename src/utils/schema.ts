export interface SchemaValidationResult {
  valid: boolean
  error?: string
}

/** localStorage/import 数据允许的最大嵌套深度 */
export const MAX_STORAGE_DEPTH = 10

/**
 * 验证从 localStorage 或外部导入恢复的数据结构。
 * 要求：
 * - 顶层不能为 null/undefined
 * - 数组/对象非空
 * - 数字必须为有限数
 * - 递归深度不超过 MAX_STORAGE_DEPTH
 * - 只接受 JSON 原生类型（string/number/boolean/null/object/array）
 */
export function validateStoredData(data: unknown): SchemaValidationResult {
  return validateValue(data, 0)
}

function validateValue(value: unknown, depth: number): SchemaValidationResult {
  if (depth > MAX_STORAGE_DEPTH) {
    return { valid: false, error: 'exceeds max depth' }
  }
  if (value === undefined) {
    return { valid: false, error: 'undefined' }
  }
  if (value === null) {
    // 顶层 null 不被视为有效数据结构，但允许作为嵌套值出现
    return depth === 0 ? { valid: false, error: 'top-level null' } : { valid: true }
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { valid: true } : { valid: false, error: 'non-finite number' }
  }
  if (typeof value === 'string' || typeof value === 'boolean') {
    return { valid: true }
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return { valid: false, error: 'empty array' }
    for (let i = 0; i < value.length; i++) {
      const res = validateValue(value[i], depth + 1)
      if (!res.valid) return res
    }
    return { valid: true }
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) return { valid: false, error: 'empty object' }
    for (const key of keys) {
      const res = validateValue(obj[key], depth + 1)
      if (!res.valid) return res
    }
    return { valid: true }
  }
  return { valid: false, error: 'unsupported type' }
}
