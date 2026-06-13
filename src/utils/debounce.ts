type DebouncedFunction<F extends (...args: unknown[]) => void> = F & { cancel(): void }

/**
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 带 cancel 方法的防抖函数
 */
export function debounce<F extends (...args: unknown[]) => void>(fn: F, delay: number): DebouncedFunction<F> {
  let timer: ReturnType<typeof setTimeout> | null = null

  const debounced = ((...args: unknown[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as DebouncedFunction<F>

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  return debounced
}
