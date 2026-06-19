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
