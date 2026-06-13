const MAX_ENCODED_LENGTH = 4000

export function encodeData(data: unknown): string | null {
  try {
    const json = JSON.stringify(data)
    const encoded = btoa(encodeURIComponent(json))
    if (encoded.length > MAX_ENCODED_LENGTH) return null
    return encoded
  } catch {
    return null
  }
}

/**
 * @internal 仅用于测试验证，生产代码使用 encodeData
 */
export function decodeData(encoded: string): unknown | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}
