export type VisualizerKey =
  | 'array'
  | 'graph'
  | 'tree'
  | 'heap'
  | 'hash'
  | 'linkedList'
  | 'stack'
  | 'queue'
  | 'trie'
  | 'sort'

export const LARGE_DATA_THRESHOLDS: Record<VisualizerKey, number> = {
  array: 50,
  graph: 20,
  tree: 30,
  heap: 30,
  hash: 30,
  linkedList: 30,
  stack: 30,
  queue: 30,
  trie: 30,
  sort: 30,
}

export function getLargeDataThreshold(
  visualizerKey: VisualizerKey,
  override?: number,
): number {
  if (override !== undefined && override >= 0) {
    return override
  }
  return LARGE_DATA_THRESHOLDS[visualizerKey] ?? 30
}

export function shouldSkipAnimation(
  visualizerKey: VisualizerKey,
  dataLength: number,
  override?: number,
): boolean {
  const threshold = getLargeDataThreshold(visualizerKey, override)
  return dataLength >= threshold
}

/**
 * 判断给定数据量是否属于大数据场景
 * @param visualizerKey - 可视化器标识
 * @param dataLength - 数据长度
 * @param override - 可选阈值覆盖
 * @returns 是否为大数据
 */
export function isLargeData(
  visualizerKey: VisualizerKey,
  dataLength: number,
  override?: number,
): boolean {
  return shouldSkipAnimation(visualizerKey, dataLength, override)
}
