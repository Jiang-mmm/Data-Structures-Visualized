import { describe, it, expect } from 'vitest'
import {
  createSkipList,
  buildInitialSkipList,
  insertSkipList,
  searchSkipList,
  deleteSkipList,
  getValues,
  countNodes,
  randomLevel,
  MAX_LEVEL,
  HEAD_ID,
} from '../algorithms/skipList'

describe('跳表（SkipList）算法', () => {
  describe('常量与基础函数', () => {
    it('MAX_LEVEL 应为 8', () => {
      expect(MAX_LEVEL).toBe(8)
    })

    it('HEAD_ID 应为 "head"', () => {
      expect(HEAD_ID).toBe('head')
    })

    it('randomLevel 应返回 1 到 MAX_LEVEL 之间的整数', () => {
      for (let i = 0; i < 100; i++) {
        const lvl = randomLevel()
        expect(lvl).toBeGreaterThanOrEqual(1)
        expect(lvl).toBeLessThanOrEqual(MAX_LEVEL)
        expect(Number.isInteger(lvl)).toBe(true)
      }
    })
  })

  describe('createSkipList', () => {
    it('应创建只含 head 哨兵节点的空跳表', () => {
      const data = createSkipList()
      expect(data.nodes).toHaveLength(1)
      expect(data.nodes[0].id).toBe(HEAD_ID)
      expect(data.edges).toEqual([])
      expect(data.maxLevel).toBe(1)
    })

    it('head 节点 value 应为 -Infinity', () => {
      const data = createSkipList()
      expect(data.nodes[0].value).toBe(-Infinity)
    })
  })

  describe('buildInitialSkipList', () => {
    it('应包含 5 个预设值 [10, 20, 30, 40, 50]', () => {
      const data = buildInitialSkipList()
      const values = getValues(data)
      expect(values).toEqual([10, 20, 30, 40, 50])
    })

    it('节点数应为 5（不含 head）', () => {
      const data = buildInitialSkipList()
      expect(countNodes(data)).toBe(5)
    })

    it('maxLevel 应 >= 1', () => {
      const data = buildInitialSkipList()
      expect(data.maxLevel).toBeGreaterThanOrEqual(1)
    })
  })

  describe('insertSkipList', () => {
    it('插入新值应增加节点数', () => {
      const data = createSkipList()
      const before = countNodes(data)
      const newData = insertSkipList(data, 42)
      expect(countNodes(newData)).toBe(before + 1)
    })

    it('插入后应能通过 getValues 找到该值', () => {
      const data = createSkipList()
      const newData = insertSkipList(data, 42)
      expect(getValues(newData)).toContain(42)
    })

    it('插入重复值应返回原对象（不变）', () => {
      const data = buildInitialSkipList()
      const newData = insertSkipList(data, 10)
      expect(newData).toBe(data)
    })

    it('插入应保持值升序', () => {
      let data = createSkipList()
      const values = [50, 10, 30, 20, 40]
      for (const v of values) {
        data = insertSkipList(data, v)
      }
      expect(getValues(data)).toEqual([10, 20, 30, 40, 50])
    })

    it('插入应保持不可变性（不修改原对象）', () => {
      const data = buildInitialSkipList()
      const originalNodes = data.nodes.length
      insertSkipList(data, 99)
      expect(data.nodes.length).toBe(originalNodes)
    })

    it('插入后 head 节点的 level 应等于 maxLevel', () => {
      const data = createSkipList()
      const newData = insertSkipList(data, 42)
      const head = newData.nodes.find(n => n.id === HEAD_ID)
      expect(head).toBeDefined()
      expect(head?.level).toBe(newData.maxLevel)
    })

    it('插入后应生成至少一条第 0 层边', () => {
      const data = createSkipList()
      const newData = insertSkipList(data, 42)
      const level0Edges = newData.edges.filter(e => e.level === 0)
      expect(level0Edges.length).toBeGreaterThan(0)
    })

    it('多次插入应保持第 0 层包含所有节点', () => {
      let data = createSkipList()
      for (const v of [10, 20, 30]) {
        data = insertSkipList(data, v)
      }
      // 第 0 层边数 = 节点数（含 head）
      const level0Edges = data.edges.filter(e => e.level === 0)
      expect(level0Edges.length).toBe(data.nodes.length - 1)
    })
  })

  describe('searchSkipList', () => {
    it('应找到存在的值', () => {
      const data = buildInitialSkipList()
      const result = searchSkipList(data, 30)
      expect(result.found).toBe(true)
      expect(result.path.length).toBeGreaterThan(0)
    })

    it('应返回未找到对于不存在的值', () => {
      const data = buildInitialSkipList()
      const result = searchSkipList(data, 999)
      expect(result.found).toBe(false)
    })

    it('搜索最小值应找到', () => {
      const data = buildInitialSkipList()
      const result = searchSkipList(data, 10)
      expect(result.found).toBe(true)
    })

    it('搜索最大值应找到', () => {
      const data = buildInitialSkipList()
      const result = searchSkipList(data, 50)
      expect(result.found).toBe(true)
    })

    it('空跳表搜索应返回未找到', () => {
      const data = createSkipList()
      const result = searchSkipList(data, 10)
      expect(result.found).toBe(false)
      expect(result.path).toEqual([])
    })

    it('搜索路径应包含 nodeId 和 level 字段', () => {
      const data = buildInitialSkipList()
      const result = searchSkipList(data, 30)
      for (const step of result.path) {
        expect(typeof step.nodeId).toBe('string')
        expect(typeof step.level).toBe('number')
      }
    })
  })

  describe('deleteSkipList', () => {
    it('删除存在的值应减少节点数', () => {
      const data = buildInitialSkipList()
      const before = countNodes(data)
      const newData = deleteSkipList(data, 30)
      expect(countNodes(newData)).toBe(before - 1)
    })

    it('删除后该值不应出现在 getValues 中', () => {
      const data = buildInitialSkipList()
      const newData = deleteSkipList(data, 30)
      expect(getValues(newData)).not.toContain(30)
    })

    it('删除不存在的值应返回原对象（不变）', () => {
      const data = buildInitialSkipList()
      const newData = deleteSkipList(data, 999)
      expect(newData).toBe(data)
    })

    it('删除应保持不可变性（不修改原对象）', () => {
      const data = buildInitialSkipList()
      const originalNodes = data.nodes.length
      deleteSkipList(data, 10)
      expect(data.nodes.length).toBe(originalNodes)
    })

    it('删除后剩余值应保持升序', () => {
      const data = buildInitialSkipList()
      const newData = deleteSkipList(data, 30)
      expect(getValues(newData)).toEqual([10, 20, 40, 50])
    })

    it('删除后 head 节点的 level 应等于新 maxLevel', () => {
      const data = buildInitialSkipList()
      const newData = deleteSkipList(data, 30)
      const head = newData.nodes.find(n => n.id === HEAD_ID)
      expect(head?.level).toBe(newData.maxLevel)
    })

    it('删除所有节点后应为空跳表（仅剩 head）', () => {
      let data = buildInitialSkipList()
      for (const v of [10, 20, 30, 40, 50]) {
        data = deleteSkipList(data, v)
      }
      expect(countNodes(data)).toBe(0)
      expect(data.nodes).toHaveLength(1)
      expect(data.nodes[0].id).toBe(HEAD_ID)
    })
  })

  describe('getValues 与 countNodes', () => {
    it('getValues 应返回升序数组', () => {
      const data = buildInitialSkipList()
      const values = getValues(data)
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1])
      }
    })

    it('getValues 不应包含 head 哨兵值', () => {
      const data = buildInitialSkipList()
      const values = getValues(data)
      expect(values).not.toContain(-Infinity)
    })

    it('countNodes 不应计入 head 哨兵', () => {
      const data = createSkipList()
      expect(countNodes(data)).toBe(0)
    })
  })

  describe('多层结构', () => {
    it('插入足够多节点后 maxLevel 可能 > 1', () => {
      let data = createSkipList()
      // 插入 20 个值，概率上 maxLevel 会 > 1
      for (let i = 1; i <= 20; i++) {
        data = insertSkipList(data, i * 5)
      }
      // 由于随机性，这里只验证 maxLevel >= 1
      expect(data.maxLevel).toBeGreaterThanOrEqual(1)
      expect(data.maxLevel).toBeLessThanOrEqual(MAX_LEVEL)
    })

    it('高层边数应 <= 低层边数', () => {
      let data = createSkipList()
      for (let i = 1; i <= 15; i++) {
        data = insertSkipList(data, i * 3)
      }
      // 第 0 层边数应最多
      const level0Count = data.edges.filter(e => e.level === 0).length
      for (let lvl = 1; lvl < data.maxLevel; lvl++) {
        const levelCount = data.edges.filter(e => e.level === lvl).length
        expect(levelCount).toBeLessThanOrEqual(level0Count)
      }
    })

    it('每条边的 source 和 target 应为有效节点 id', () => {
      const data = buildInitialSkipList()
      const nodeIds = new Set(data.nodes.map(n => n.id))
      for (const edge of data.edges) {
        expect(nodeIds.has(edge.source)).toBe(true)
        expect(nodeIds.has(edge.target)).toBe(true)
      }
    })
  })
})
