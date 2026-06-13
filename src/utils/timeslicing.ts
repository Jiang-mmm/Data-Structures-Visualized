/**
 * @returns {Promise<void>} 在下一个宏任务/动画帧后 resolve
 */
export function yieldToMain(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0)
    })
  })
}

/**
 * @template T, R
 * @param {T[]} items 待处理数组
 * @param {(item: T, index: number) => Promise<R>} processItem 处理函数
 * @param {number} [batchSize=10] 每 N 步让出主线程一次
 * @returns {Promise<R[]>} 所有处理结果
 * @internal 仅用于测试验证，生产代码使用 yieldToMain
 */
export async function runWithTimeSlicing<T, R>(items: T[], processItem: (item: T, index: number) => Promise<R>, batchSize = 10): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i++) {
    results.push(await processItem(items[i], i))
    if ((i + 1) % batchSize === 0 && i < items.length - 1) {
      await yieldToMain()
    }
  }
  return results
}
