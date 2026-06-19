import { describe, it, expect } from 'vitest'
import { learningConfigs } from '../configs/learning'
import { complexityAnalysisConfig } from '../configs/learning/complexityAnalysis.config'
import { advancedDataStructuresConfig } from '../configs/learning/advancedDataStructures.config'
import { realWorldApplicationsConfig } from '../configs/learning/realWorldApplications.config'
import type { LearningModeConfig, LearningStep } from '../types/learning'

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

    it('注册后 learningConfigs 总数应为 33（原 29 + 新增 3 + avlTree 1）', () => {
      const keys = Object.keys(learningConfigs)
      expect(keys.length).toBe(33)
    })
  })

  describe('complexityAnalysis 配置内容验证', () => {
    it('algorithmKey 应为 complexityAnalysis', () => {
      expect(complexityAnalysisConfig.algorithmKey).toBe('complexityAnalysis')
    })

    it('应包含复杂度分析核心主题步骤', () => {
      const titles = complexityAnalysisConfig.steps.map(s => s.title)
      expect(titles).toEqual(expect.arrayContaining(['时间复杂度概念', '大O表示法', '空间复杂度']))
      expect(titles).toEqual(expect.arrayContaining(['最好/最坏/平均情况', '均摊分析']))
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
      const titles = advancedDataStructuresConfig.steps.map(s => s.title)
      expect(titles).toEqual(
        expect.arrayContaining([
          '红黑树应用',
          'B树数据库索引',
          '跳表 Redis 应用',
          '布隆过滤器',
          '并查集',
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
      const titles = realWorldApplicationsConfig.steps.map(s => s.title)
      expect(titles).toEqual(
        expect.arrayContaining([
          '浏览器历史记录（栈）',
          '任务队列（队列）',
          '文件系统（树）',
          '社交网络（图）',
          '搜索引擎（字典树）',
          '缓存（哈希表）',
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
