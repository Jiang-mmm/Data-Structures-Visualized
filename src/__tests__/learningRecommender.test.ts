import { describe, it, expect } from 'vitest'
import { getRecommendations, getPersonalizedAdvice } from '../utils/learningRecommender'
import { LEARNING_PATH } from '../configs/learningPath'

const DAY_MS = 24 * 60 * 60 * 1000

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString()
}

describe('learningRecommender', () => {
  describe('getRecommendations', () => {
    it('空进度时应该推荐 array（唯一无前置条件模块）', () => {
      const progress = { visited: [], completed: [], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      expect(recs.length).toBeGreaterThan(0)
      expect(recs[0].node.id).toBe('array')
      expect(recs[0].action).toBe('start')
      expect(recs[0].reasonKey).toBe('recommendations.reason.startHere')
    })

    it('完成 array 后应该推荐已解锁的模块', () => {
      const progress = { visited: ['array'], completed: ['array'], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      const ids = recs.map(r => r.node.id)
      expect(ids).toContain('stack')
      expect(ids).toContain('queue')
      expect(ids).not.toContain('tree')
      expect(ids).not.toContain('heap')
      expect(ids).not.toContain('graph')
    })

    it('应该按难度排序（简单优先）', () => {
      const progress = { visited: ['array'], completed: ['array'], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      const firstTwo = recs.slice(0, 2).map(r => r.node.difficulty)
      expect(firstTwo.every(d => d === 1)).toBe(true)
    })

    it('应该最多返回 3 个推荐', () => {
      const progress = { visited: ['array'], completed: ['array'], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      expect(recs.length).toBeLessThanOrEqual(3)
    })

    it('有进行中模块时应该推荐继续学习', () => {
      const allIds = LEARNING_PATH.map(n => n.id)
      const completed = allIds.filter(id => id !== 'graph')
      const progress = {
        visited: allIds,
        completed,
        startedAt: new Date().toISOString(),
      }
      const recs = getRecommendations(progress)
      const graphRec = recs.find(r => r.node.id === 'graph')
      expect(graphRec).toBeDefined()
      expect(graphRec!.action).toBe('continue')
      expect(graphRec!.reasonKey).toBe('recommendations.reason.continueLearning')
    })

    it('已解锁未开始模块优先级高于进行中模块', () => {
      const completed = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree', 'hash', 'sort']
      const visited = [...completed, 'heap']
      const progress = {
        visited,
        completed,
        startedAt: new Date().toISOString(),
      }
      const recs = getRecommendations(progress)
      const priority1 = recs.filter(r => r.priority === 1)
      const priority2 = recs.filter(r => r.priority === 2)
      expect(priority1.length).toBeGreaterThan(0)
      expect(priority2.length).toBeGreaterThan(0)
      expect(recs[0].priority).toBe(1)
    })

    it('全部完成时应该推荐复习', () => {
      const allIds = LEARNING_PATH.map(n => n.id)
      const progress = {
        visited: allIds,
        completed: allIds,
        startedAt: new Date().toISOString(),
      }
      const recs = getRecommendations(progress)
      expect(recs.length).toBeGreaterThan(0)
      expect(recs.every(r => r.action === 'review')).toBe(true)
      expect(recs.every(r => r.reasonKey === 'recommendations.reason.review')).toBe(true)
    })

    it('推荐应该包含模块节点信息', () => {
      const progress = { visited: [], completed: [], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      expect(recs[0].node).toBeDefined()
      expect(recs[0].node.id).toBeDefined()
      expect(recs[0].node.path).toBeDefined()
      expect(recs[0].node.difficulty).toBeDefined()
    })

    it('无前置条件的模块使用 startHere 理由', () => {
      const progress = { visited: [], completed: [], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      const arrayRec = recs.find(r => r.node.id === 'array')
      expect(arrayRec!.reasonKey).toBe('recommendations.reason.startHere')
    })

    it('有前置条件的已解锁模块使用 unlockedNotStarted 理由', () => {
      const progress = { visited: ['array'], completed: ['array'], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      const stackRec = recs.find(r => r.node.id === 'stack')
      expect(stackRec).toBeDefined()
      expect(stackRec!.reasonKey).toBe('recommendations.reason.unlockedNotStarted')
    })

    it('完成 array 和 linkedlist 后 tree 应该被推荐', () => {
      const progress = {
        visited: ['array', 'linkedlist'],
        completed: ['array', 'linkedlist'],
        startedAt: new Date().toISOString(),
      }
      const recs = getRecommendations(progress)
      const ids = recs.map(r => r.node.id)
      expect(ids).toContain('tree')
    })

    it('完成前置模块后 graph 应该被推荐', () => {
      const completed = ['array', 'linkedlist', 'queue', 'stack', 'hash', 'sort', 'tree', 'heap']
      const progress = {
        visited: completed,
        completed,
        startedAt: new Date().toISOString(),
      }
      const recs = getRecommendations(progress)
      const ids = recs.map(r => r.node.id)
      expect(ids).toContain('graph')
    })

    it('未完成前置条件的模块不应被推荐', () => {
      const progress = { visited: [], completed: [], startedAt: new Date().toISOString() }
      const recs = getRecommendations(progress)
      const ids = recs.map(r => r.node.id)
      expect(ids).not.toContain('stack')
      expect(ids).not.toContain('queue')
      expect(ids).not.toContain('linkedlist')
      expect(ids).not.toContain('tree')
      expect(ids).not.toContain('heap')
      expect(ids).not.toContain('trie')
      expect(ids).not.toContain('hash')
      expect(ids).not.toContain('graph')
      expect(ids).not.toContain('sort')
    })

    it('复习推荐应该返回最多 3 个', () => {
      const allIds = LEARNING_PATH.map(n => n.id)
      const progress = {
        visited: allIds,
        completed: allIds,
        startedAt: new Date().toISOString(),
      }
      const recs = getRecommendations(progress)
      expect(recs.length).toBeLessThanOrEqual(3)
    })
  })

  describe('getPersonalizedAdvice', () => {
    it('无进度时返回欢迎建议', () => {
      const progress = { visited: [], completed: [], startedAt: new Date().toISOString() }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.welcome')
    })

    it('全部完成时返回完成建议', () => {
      const allIds = LEARNING_PATH.map(n => n.id)
      const progress = {
        visited: allIds,
        completed: allIds,
        startedAt: new Date().toISOString(),
      }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.allCompleted')
    })

    it('停滞 7 天以上无完成时返回停滞建议', () => {
      const progress = { visited: ['array'], completed: [], startedAt: daysAgo(10) }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.stalled')
      expect(advice.params?.days).toBe(10)
    })

    it('刚开始（7 天内）无完成时返回刚开始建议', () => {
      const progress = { visited: ['array'], completed: [], startedAt: daysAgo(3) }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.justStarted')
    })

    it('快速学习时返回快速建议', () => {
      const progress = {
        visited: ['array', 'stack'],
        completed: ['array', 'stack'],
        startedAt: daysAgo(5),
      }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.fastPace')
      expect(advice.params?.completed).toBe(2)
      expect(advice.params?.days).toBe(5)
    })

    it('慢速学习时返回慢速建议', () => {
      const progress = {
        visited: ['array', 'stack'],
        completed: ['array'],
        startedAt: daysAgo(30),
      }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.slowPace')
      expect(advice.params?.completed).toBe(1)
      expect(advice.params?.days).toBe(30)
    })

    it('正常速度时返回正常建议', () => {
      const progress = {
        visited: ['array', 'stack', 'queue'],
        completed: ['array', 'stack'],
        startedAt: daysAgo(20),
      }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBe('recommendations.advice.normalPace')
      expect(advice.params?.completed).toBe(2)
      expect(advice.params?.days).toBe(20)
    })

    it('建议对象应包含 key 字段', () => {
      const progress = { visited: [], completed: [], startedAt: new Date().toISOString() }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.key).toBeDefined()
      expect(typeof advice.key).toBe('string')
    })

    it('快速建议应包含 completed 和 days 参数', () => {
      const progress = {
        visited: ['array', 'stack'],
        completed: ['array', 'stack'],
        startedAt: daysAgo(3),
      }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.params).toBeDefined()
      expect(advice.params!.completed).toBe(2)
      expect(advice.params!.days).toBe(3)
    })

    it('停滞建议应包含 days 参数', () => {
      const progress = { visited: ['array'], completed: [], startedAt: daysAgo(15) }
      const advice = getPersonalizedAdvice(progress)
      expect(advice.params).toBeDefined()
      expect(advice.params!.days).toBe(15)
    })
  })
})
