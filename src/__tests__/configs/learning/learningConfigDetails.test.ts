/**
 * v20 M7-6 learning config 详细集成测试
 *
 * 范围：40 个 config 的核心算法教学内容验证
 * 验证维度：每个 config 的 algorithmKey、step 数量、关键 step 存在性、复杂度字段覆盖
 */
import { describe, it, expect } from 'vitest'
import { learningConfigs } from '../../../configs/learning'
import type { LearningModeConfig, LearningStep } from '../../../types/learning'

const ALL_KEYS = Object.keys(learningConfigs) as Array<keyof typeof learningConfigs>

describe('learningConfigs 详细集成', () => {
  describe.each(ALL_KEYS)('%s 详细验证', (key) => {
    const config = learningConfigs[key] as LearningModeConfig

    it('algorithmKey 字段应与注册键名一致', () => {
      expect(config.algorithmKey).toBe(key)
    })

    it('每个 step 应至少有 1 个 highlightTerm', () => {
      config.steps.forEach((step: LearningStep) => {
        expect(step.highlightTerms.length, `${key}.${step.id}`).toBeGreaterThanOrEqual(1)
      })
    })

    it('每个 step 的 title 和 description 应非空', () => {
      config.steps.forEach((step: LearningStep) => {
        expect(step.title.length, `${key}.${step.id} title`).toBeGreaterThan(0)
        expect(step.description.length, `${key}.${step.id} description`).toBeGreaterThan(0)
      })
    })

    it('每个 step 应有合法的 codeSnippet 和 highlightedLine', () => {
      config.steps.forEach((step: LearningStep) => {
        expect(step.codeSnippet.length, `${key}.${step.id}`).toBeGreaterThan(0)
        const lineCount = step.codeSnippet.split('\n').length
        expect(step.highlightedLine, `${key}.${step.id} highlightedLine`).toBeLessThanOrEqual(lineCount)
        expect(step.highlightedLine, `${key}.${step.id} highlightedLine`).toBeGreaterThanOrEqual(1)
      })
    })
  })
})

describe('learningConfigs 完整性交叉验证', () => {
  it('应有 40 个 config 键', () => {
    expect(Object.keys(learningConfigs).length).toBe(40)
  })

  it('总 step 数应大于 150', () => {
    let total = 0
    for (const key of ALL_KEYS) {
      const config = learningConfigs[key] as LearningModeConfig
      total += config.steps.length
    }
    expect(total).toBeGreaterThan(150)
  })

  it('至少 30 个 config 应包含 complexity 字段', () => {
    let withComplexity = 0
    for (const key of ALL_KEYS) {
      const config = learningConfigs[key] as LearningModeConfig
      if (config.steps.some((s: LearningStep) => s.complexity !== undefined)) {
        withComplexity += 1
      }
    }
    expect(withComplexity).toBeGreaterThanOrEqual(30)
  })

  it('至少 30 个 config 应包含 tips 字段', () => {
    let withTips = 0
    for (const key of ALL_KEYS) {
      const config = learningConfigs[key] as LearningModeConfig
      if (config.steps.some((s: LearningStep) => s.tips !== undefined)) {
        withTips += 1
      }
    }
    expect(withTips).toBeGreaterThanOrEqual(30)
  })
})
