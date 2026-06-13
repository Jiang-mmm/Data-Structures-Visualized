export function encodeData(data: unknown): string | null {
  try {
    const json = JSON.stringify(data)
    return btoa(encodeURIComponent(json))
  } catch {
    return null
  }
}

export function decodeData(encoded: string): unknown | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    return JSON.parse(json)
  } catch {
    return null
  }
}
