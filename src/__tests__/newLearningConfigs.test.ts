import { describe, it, expect } from 'vitest'
import { learningConfigs } from '../configs/learning'
import { complexityAnalysisConfig } from '../configs/learning/complexityAnalysis.config'
import { advancedDataStructuresConfig } from '../configs/learning/advancedDataStructures.config'
import { realWorldApplicationsConfig } from '../configs/learning/realWorldApplications.config'
import type { LearningModeConfig, LearningStep } from '../types/learning'
import { tStatic } from '../i18n/useI18n'

/**
 * 新增高级学习模块配置单元测试
 * 验证 3 个新配置的结构正确性、注册状态、步骤数量
 */

const newConfigs: Array<{ name: string; config: LearningModeConfig; expectedKey: string }> = [
  { name: 'complexityAnalysis', config: complexityAnalysisConfig, expectedKey: 'complexityAnalysis' },
  { name: 'advancedDataStructures', config: advancedDataStructuresConfig, expectedKey: 'advancedDataStructures' },
  { name: 'realWorldApplications', config: realWorldApplicationsConfig, expectedKey: 'realWorldApplications' },
]

describe('新增高级学习模块配置', () => {
  describe('配置结构正确性', () => {
    newConfigs.forEach(({ name, config }) => {
      describe(`${name} 配置`, () => {
        it('应该有 algorithmKey 字段且为非空字符串', () => {
          expect(config).toBeDefined()
          expect(typeof config.algorithmKey).toBe('string')
          expect(config.algorithmKey.length).toBeGreaterThan(0)
        })

        it('应该有 steps 数组且为数组类型', () => {
          expect(Array.isArray(config.steps)).toBe(true)
        })

        it('应该至少有 5 个步骤', () => {
          expect(config.steps.length).toBeGreaterThanOrEqual(5)
        })

        it('每个步骤应包含完整的必填字段', () => {
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
            // 可选字段类型校验
            if (step.tips !== undefined) {
              expect(Array.isArray(step.tips)).toBe(true)
            }
            if (step.complexity !== undefined) {
              expect(typeof step.complexity).toBe('object')
            }
            // 步骤 id 在同一配置内应唯一
            const idCount = config.steps.filter(s => s.id === step.id).length
            expect(idCount).toBe(1)
            void idx
          })
        })
      })
    })
  })

  describe('配置注册状态', () => {
    newConfigs.forEach(({ name, expectedKey }) => {
      it(`${name} 应该已注册到 learningConfigs`, () => {
        expect(learningConfigs).toHaveProperty(expectedKey)
        expect(learningConfigs[expectedKey as keyof typeof learningConfigs]).toBeDefined()
      })

      it(`${name} 注册项应与导出配置一致`, () => {
        const registered = learningConfigs[expectedKey as keyof typeof learningConfigs]
        const { config } = newConfigs.find(c => c.name === name)!
        expect(registered).toBe(config)
      })
    })

    it('注册后 learningConfigs 总数应为 40（原 29 + 新增 3 + avlTree 1 + counting 1 + skipList 1 + unionFind 1 + redBlackTree 1 + sortCompare 1 + bTree 1 + segmentTree 1）', () => {
      const keys = Object.keys(learningConfigs)
      expect(keys.length).toBe(40)
    })
  })

  describe('complexityAnalysis 配置内容验证', () => {
    it('algorithmKey 应为 complexityAnalysis', () => {
      expect(complexityAnalysisConfig.algorithmKey).toBe('complexityAnalysis')
    })

    it('应包含复杂度分析核心主题步骤', () => {
      const titles = complexityAnalysisConfig.steps.map(s =>
        s.title.startsWith('learningSteps.') ? tStatic(s.title) : s.title
      )
      expect(titles).toEqual(expect.arrayContaining([
        tStatic('learningSteps.complexityAnalysis.steps.concept.title'),
        tStatic('learningSteps.complexityAnalysis.steps.bigO.title'),
        tStatic('learningSteps.complexityAnalysis.steps.space.title'),
      ]))
      expect(titles).toEqual(expect.arrayContaining([
        tStatic('learningSteps.complexityAnalysis.steps.cases.title'),
        tStatic('learningSteps.complexityAnalysis.steps.amortized.title'),
      ]))
    })

    it('步骤 id 应覆盖核心知识点', () => {
      const ids = complexityAnalysisConfig.steps.map(s => s.id)
      expect(ids).toContain('concept')
      expect(ids).toContain('bigO')
      expect(ids).toContain('space')
      expect(ids).toContain('cases')
      expect(ids).toContain('amortized')
    })
  })

  describe('advancedDataStructures 配置内容验证', () => {
    it('algorithmKey 应为 advancedDataStructures', () => {
      expect(advancedDataStructuresConfig.algorithmKey).toBe('advancedDataStructures')
    })

    it('应包含 5 个高级数据结构步骤', () => {
      const titles = advancedDataStructuresConfig.steps.map(s =>
        s.title.startsWith('learningSteps.') ? tStatic(s.title) : s.title
      )
      expect(titles).toEqual(
        expect.arrayContaining([
          tStatic('learningSteps.advancedDataStructures.steps.redBlackTree.title'),
          tStatic('learningSteps.advancedDataStructures.steps.bTree.title'),
          tStatic('learningSteps.advancedDataStructures.steps.skipList.title'),
          tStatic('learningSteps.advancedDataStructures.steps.bloomFilter.title'),
          tStatic('learningSteps.advancedDataStructures.steps.unionFind.title'),
        ])
      )
    })

    it('步骤 id 应覆盖 5 个高级数据结构', () => {
      const ids = advancedDataStructuresConfig.steps.map(s => s.id)
      expect(ids).toContain('redBlackTree')
      expect(ids).toContain('bTree')
      expect(ids).toContain('skipList')
      expect(ids).toContain('bloomFilter')
      expect(ids).toContain('unionFind')
    })
  })

  describe('realWorldApplications 配置内容验证', () => {
    it('algorithmKey 应为 realWorldApplications', () => {
      expect(realWorldApplicationsConfig.algorithmKey).toBe('realWorldApplications')
    })

    it('应包含 6 个实际应用场景步骤', () => {
      const titles = realWorldApplicationsConfig.steps.map(s =>
        s.title.startsWith('learningSteps.') ? tStatic(s.title) : s.title
      )
      expect(titles).toEqual(
        expect.arrayContaining([
          tStatic('learningSteps.realWorldApplications.steps.browserHistory.title'),
          tStatic('learningSteps.realWorldApplications.steps.taskQueue.title'),
          tStatic('learningSteps.realWorldApplications.steps.fileSystem.title'),
          tStatic('learningSteps.realWorldApplications.steps.socialNetwork.title'),
          tStatic('learningSteps.realWorldApplications.steps.searchEngine.title'),
          tStatic('learningSteps.realWorldApplications.steps.cache.title'),
        ])
      )
    })

    it('步骤 id 应覆盖 6 个应用场景', () => {
      const ids = realWorldApplicationsConfig.steps.map(s => s.id)
      expect(ids).toContain('browserHistory')
      expect(ids).toContain('taskQueue')
      expect(ids).toContain('fileSystem')
      expect(ids).toContain('socialNetwork')
      expect(ids).toContain('searchEngine')
      expect(ids).toContain('cache')
    })
  })
})
