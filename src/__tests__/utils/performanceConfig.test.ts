import { describe, it, expect } from 'vitest'
import {
  LARGE_DATA_THRESHOLDS,
  getLargeDataThreshold,
  shouldSkipAnimation,
  type VisualizerKey,
} from '../../utils/performanceConfig'

describe('performanceConfig', () => {
  describe('LARGE_DATA_THRESHOLDS', () => {
    it('array 的默认阈值应为 50', () => {
      expect(LARGE_DATA_THRESHOLDS.array).toBe(50)
    })

    it('graph 的默认阈值应为 20', () => {
      expect(LARGE_DATA_THRESHOLDS.graph).toBe(20)
    })

    it('其他 visualizer 的默认阈值应为 30', () => {
      const others: VisualizerKey[] = [
        'tree',
        'heap',
        'hash',
        'linkedList',
        'stack',
        'queue',
        'trie',
        'sort',
      ]
      others.forEach(key => {
        expect(LARGE_DATA_THRESHOLDS[key]).toBe(30)
      })
    })
  })

  describe('getLargeDataThreshold', () => {
    it('应返回对应 visualizer 的默认阈值', () => {
      expect(getLargeDataThreshold('array')).toBe(50)
      expect(getLargeDataThreshold('graph')).toBe(20)
      expect(getLargeDataThreshold('tree')).toBe(30)
    })

    it('当 override >= 0 时应返回覆盖值', () => {
      expect(getLargeDataThreshold('array', 100)).toBe(100)
      expect(getLargeDataThreshold('graph', 0)).toBe(0)
      expect(getLargeDataThreshold('tree', 5)).toBe(5)
    })

    it('当 override < 0 时应忽略并返回默认值', () => {
      expect(getLargeDataThreshold('array', -1)).toBe(50)
      expect(getLargeDataThreshold('graph', -10)).toBe(20)
    })

    it('未知 key 应回退到 30', () => {
      expect(getLargeDataThreshold('unknown' as VisualizerKey)).toBe(30)
    })
  })

  describe('shouldSkipAnimation', () => {
    it('数据量小于阈值时不应跳过动画', () => {
      expect(shouldSkipAnimation('array', 49)).toBe(false)
      expect(shouldSkipAnimation('graph', 19)).toBe(false)
      expect(shouldSkipAnimation('tree', 29)).toBe(false)
    })

    it('数据量等于阈值时应跳过动画', () => {
      expect(shouldSkipAnimation('array', 50)).toBe(true)
      expect(shouldSkipAnimation('graph', 20)).toBe(true)
      expect(shouldSkipAnimation('tree', 30)).toBe(true)
    })

    it('数据量大于阈值时应跳过动画', () => {
      expect(shouldSkipAnimation('array', 51)).toBe(true)
      expect(shouldSkipAnimation('graph', 21)).toBe(true)
      expect(shouldSkipAnimation('tree', 31)).toBe(true)
    })

    it('应支持 override 阈值', () => {
      expect(shouldSkipAnimation('array', 10, 10)).toBe(true)
      expect(shouldSkipAnimation('array', 9, 10)).toBe(false)
      expect(shouldSkipAnimation('graph', 0, 0)).toBe(true)
    })

    it('负 override 应被忽略', () => {
      expect(shouldSkipAnimation('array', 49, -1)).toBe(false)
      expect(shouldSkipAnimation('array', 50, -1)).toBe(true)
    })
  })
})
