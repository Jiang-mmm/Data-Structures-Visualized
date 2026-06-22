import { useMemo } from 'react'
import { useGlobalSettings } from './useGlobalSettings'

/**
 * 算法术语表条目（来自 i18n algorithms 命名空间）。
 * key 与 zh/en locales 中的 algorithms.* 对应。
 */
export interface AlgorithmGlossaryItem {
  id: string
  /** 双语名称（已根据当前语言解析） */
  name: string
  /** 一句话定义（双语） */
  description: string
  /** 典型应用场景（双语） */
  useCase: string
  /** 时间复杂度（最优 / 平均 / 最差） */
  complexity: {
    best: string
    average: string
    worst: string
    space: string
  }
}

const ALGORITHM_IDS = [
  'array',
  'stack',
  'queue',
  'linkedlist',
  'tree',
  'avlTree',
  'redBlackTree',
  'bTree',
  'segmentTree',
  'heap',
  'trie',
  'hash',
  'graph',
  'skipList',
  'unionFind',
  'sort',
] as const

/**
 * 返回 16 个核心数据结构 / 算法的双语术语表条目。
 * 内部通过 useGlobalSettings 的 t() 解析 zh/en 文本。
 */
export function useAlgorithmGlossary(): AlgorithmGlossaryItem[] {
  const { t } = useGlobalSettings()

  return useMemo(
    () =>
      ALGORITHM_IDS.map((id) => ({
        id,
        name: t(`algorithms.${id}.name`),
        description: t(`algorithms.${id}.description`),
        useCase: t(`algorithms.${id}.useCase`),
        complexity: {
          best: t(`algorithms.${id}.best`),
          average: t(`algorithms.${id}.average`),
          worst: t(`algorithms.${id}.worst`),
          space: t(`algorithms.${id}.space`),
        },
      })),
    [t],
  )
}
