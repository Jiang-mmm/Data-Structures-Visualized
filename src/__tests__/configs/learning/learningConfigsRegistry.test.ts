/**
 * v20 M7-6 learning config 注册表验证
 *
 * 范围：src/configs/learning/ 下全部 40 个 config 的注册状态 + 结构正确性
 * 验证维度：algorithmKey 一致性、steps 数组非空、step id 唯一、必填字段完整
 */
import { describe, it, expect } from 'vitest'
import { learningConfigs } from '../../../configs/learning'
import type { LearningModeConfig, LearningStep } from '../../../types/learning'

/** 期望的 40 个 config 键 */
const EXPECTED_KEYS = [
  'bfs', 'dfs', 'dijkstra', 'topoSort', 'bellmanFord', 'floydWarshall', 'prim', 'kruskal',
  'bubble', 'quick', 'merge', 'heap', 'selection', 'insertion', 'radix', 'bucket',
  'shell', 'comb', 'tim', 'counting',
  'linkedlist', 'doublyLinkedList', 'tree', 'avlTree', 'redBlackTree', 'bTree',
  'segmentTree', 'hash', 'array', 'stack', 'queue', 'heapStructure', 'trie',
  'skipList', 'unionFind', 'graph',
  'complexityAnalysis', 'advancedDataStructures', 'realWorldApplications', 'sortCompare',
] as const

describe('learningConfigs 注册表', () => {
  it('应包含 40 个 config', () => {
    const keys = Object.keys(learningConfigs)
    expect(keys).toHaveLength(40)
  })

  it('应包含所有期望的 config 键', () => {
    const actual = Object.keys(learningConfigs).sort()
    const expected = [...EXPECTED_KEYS].sort()
    expect(actual).toEqual(expected)
  })

  describe.each(EXPECTED_KEYS)('%s config', (key) => {
    const config = learningConfigs[key] as LearningModeConfig

    it('应已注册且非空', () => {
      expect(config).toBeDefined()
      expect(config).not.toBeNull()
    })

    it('algorithmKey 应与注册键一致', () => {
      expect(config.algorithmKey).toBe(key)
    })

    it('应包含 steps 数组', () => {
      expect(Array.isArray(config.steps)).toBe(true)
    })

    it('应至少包含 1 个步骤', () => {
      expect(config.steps.length).toBeGreaterThanOrEqual(1)
    })

    it('每个 step 应有唯一 id', () => {
      const ids = config.steps.map((s: LearningStep) => s.id)
      const unique = new Set(ids)
      expect(unique.size).toBe(ids.length)
    })

    it('每个 step 应有非空 id/title/description/codeSnippet', () => {
      config.steps.forEach((step: LearningStep, idx: number) => {
        expect(typeof step.id).toBe('string')
        expect(step.id.length).toBeGreaterThan(0)
        expect(typeof step.title).toBe('string')
        expect(step.title.length).toBeGreaterThan(0)
        expect(typeof step.description).toBe('string')
        expect(step.description.length).toBeGreaterThan(0)
        expect(typeof step.codeSnippet).toBe('string')
        expect(step.codeSnippet.length).toBeGreaterThan(0)
        expect(typeof step.highlightedLine).toBe('number')
        expect(step.highlightedLine).toBeGreaterThanOrEqual(1)
        expect(Array.isArray(step.highlightTerms)).toBe(true)
        expect(step.highlightTerms.length).toBeGreaterThan(0)
        // 可选字段
        if (step.tips !== undefined) {
          expect(Array.isArray(step.tips)).toBe(true)
        }
        if (step.complexity !== undefined) {
          expect(typeof step.complexity).toBe('object')
        }
        void idx
      })
    })

    it('highlightedLine 应在 codeSnippet 行数范围内', () => {
      config.steps.forEach((step: LearningStep) => {
        const lineCount = step.codeSnippet.split('\n').length
        expect(step.highlightedLine).toBeLessThanOrEqual(lineCount)
      })
    })
  })
})
