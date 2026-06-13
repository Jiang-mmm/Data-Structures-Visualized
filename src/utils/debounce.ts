/**
 * @template {(...args: any[]) => void} F
 * @param {F} fn 需要防抖的函数
 * @param {number} delay 延迟时间(毫秒)
 * @returns {F & { cancel(): void }} 带 cancel 方法的防抖函数
 */
export function debounce(fn: any, delay: number): any {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  return debounced
}
