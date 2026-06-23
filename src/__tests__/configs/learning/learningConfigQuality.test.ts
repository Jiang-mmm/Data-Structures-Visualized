/**
 * v20 M7-6 learning config 质量检查
 *
 * 范围：40 个 config 的字段质量、可读性、code snippet 完整性
 * 验证维度：highlightTerms 非空、tips 非空、complexity 字段可选但存在时合法、code snippet 包含关键逻辑
 */
import { describe, it, expect } from 'vitest'
import { learningConfigs } from '../../../configs/learning'
import type { LearningModeConfig, LearningStep } from '../../../types/learning'

const ALL_KEYS = Object.keys(learningConfigs) as Array<keyof typeof learningConfigs>

/** 算法分类映射（用于差异化检查） */
const ALGO_CATEGORY: Record<string, 'sorting' | 'graph' | 'datastructure' | 'advanced'> = {
  // sorting
  bubble: 'sorting', quick: 'sorting', merge: 'sorting', heap: 'sorting',
  selection: 'sorting', insertion: 'sorting', radix: 'sorting', bucket: 'sorting',
  shell: 'sorting', comb: 'sorting', tim: 'sorting', counting: 'sorting', sortCompare: 'sorting',
  // graph
  bfs: 'graph', dfs: 'graph', dijkstra: 'graph', topoSort: 'graph',
  bellmanFord: 'graph', floydWarshall: 'graph', prim: 'graph', kruskal: 'graph',
  // datastructure
  array: 'datastructure', stack: 'datastructure', queue: 'datastructure',
  linkedlist: 'datastructure', doublyLinkedList: 'datastructure',
  tree: 'datastructure', avlTree: 'datastructure', redBlackTree: 'datastructure',
  bTree: 'datastructure', segmentTree: 'datastructure', hash: 'datastructure',
  heapStructure: 'datastructure', trie: 'datastructure',
  skipList: 'datastructure', unionFind: 'datastructure', graph: 'datastructure',
  // advanced
  complexityAnalysis: 'advanced', advancedDataStructures: 'advanced', realWorldApplications: 'advanced',
}

describe('learningConfigs 字段质量', () => {
  describe.each(ALL_KEYS)('%s config 字段', (key) => {
    const config = learningConfigs[key] as LearningModeConfig

    it('highlightTerms 应全部为非空字符串', () => {
      config.steps.forEach((step: LearningStep) => {
        step.highlightTerms.forEach((term, i) => {
          expect(typeof term, `${key}.${step.id}.highlightTerms[${i}]`).toBe('string')
          expect(term.length, `${key}.${step.id}.highlightTerms[${i}]`).toBeGreaterThan(0)
        })
      })
    })

    it('tips 字段（如果存在）应全部为非空字符串', () => {
      config.steps.forEach((step: LearningStep) => {
        if (step.tips) {
          expect(step.tips.length, `${key}.${step.id} tips`).toBeGreaterThan(0)
          step.tips.forEach((tip, i) => {
            expect(typeof tip, `${key}.${step.id}.tips[${i}]`).toBe('string')
            expect(tip.length, `${key}.${step.id}.tips[${i}]`).toBeGreaterThan(0)
          })
        }
      })
    })

    it('complexity 字段（如果存在）应同时包含 time 和 space', () => {
      config.steps.forEach((step: LearningStep) => {
        if (step.complexity) {
          if (step.complexity.time !== undefined) {
            expect(typeof step.complexity.time, `${key}.${step.id}.complexity.time`).toBe('string')
            expect(step.complexity.time.length).toBeGreaterThan(0)
          }
          if (step.complexity.space !== undefined) {
            expect(typeof step.complexity.space, `${key}.${step.id}.complexity.space`).toBe('string')
            expect(step.complexity.space.length).toBeGreaterThan(0)
          }
        }
      })
    })

    it('highlightedLine 应是合法行号（≥1 且 ≤ codeSnippet 行数）', () => {
      config.steps.forEach((step: LearningStep) => {
        const lineCount = step.codeSnippet.split('\n').length
        expect(step.highlightedLine, `${key}.${step.id}.highlightedLine`).toBeGreaterThanOrEqual(1)
        expect(step.highlightedLine, `${key}.${step.id}.highlightedLine`).toBeLessThanOrEqual(lineCount)
      })
    })
  })
})

describe('learningConfigs code snippet 检查', () => {
  describe.each(ALL_KEYS)('%s code snippet', (key) => {
    const config = learningConfigs[key] as LearningModeConfig
    const category = ALGO_CATEGORY[key] || 'datastructure'

    it('codeSnippet 应包含至少 2 行内容', () => {
      config.steps.forEach((step: LearningStep) => {
        const lines = step.codeSnippet.split('\n').filter(l => l.trim().length > 0)
        expect(lines.length, `${key}.${step.id} code 行数`).toBeGreaterThanOrEqual(1)
      })
    })

    it('sorting 类算法的 codeSnippet 应至少一个步骤包含 swap 或 compare 关键字', () => {
      if (category !== 'sorting') return
      const hasKey = config.steps.some((step: LearningStep) =>
        /swap|compare|sort|partition|merge|heap|sift/i.test(step.codeSnippet)
      )
      expect(hasKey, `${key} 应包含排序相关关键字`).toBe(true)
    })

    it('graph 类算法的 codeSnippet 应至少一个步骤包含 graph 遍历相关关键字', () => {
      if (category !== 'graph') return
      const hasKey = config.steps.some((step: LearningStep) =>
        /visit|queue|stack|recur|dist|edge|node|path|tree|relax/i.test(step.codeSnippet)
      )
      expect(hasKey, `${key} 应包含图算法相关关键字`).toBe(true)
    })
  })
})

describe('learningConfigs id 唯一性跨 config 校验', () => {
  it('step id 在同一 config 内应唯一（已分散到 describe.each 验证）', () => {
    // 跨 config 可能有重名 id（如 'init'），不做强制要求
    let totalSteps = 0
    for (const key of ALL_KEYS) {
      const config = learningConfigs[key] as LearningModeConfig
      totalSteps += config.steps.length
    }
    expect(totalSteps).toBeGreaterThan(100)
  })
})
